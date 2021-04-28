/**
 * Copyright © 2021 Wuyuan Info Tech Co., Ltd. All rights reserved.
 * License: MIT
 * Site: https://wuyuan.io
 * Author: zyz
 * Updated: 2020/12/30
 * Created: 2020/12/16
 **/

'use strict';

var BaseServiceClass = require('./service-base');
const { Pool, Client } = require('pg')

var async = require('async');

var escape = require('mysql').escape;
var myescape = function(val) {
    val = escape(val) + '';
    return val; // .replace(/\\'/g, "\'")
};
var escapeId = require('mysql').escapeId;
var myescapeId = function(val) {
    if (!val) {
        return '';
    }
    val = escapeId(val);
    val = val.relace(/^\`/, '"').relace(/\`$/, ']');
    return val;
}

var dbTypeMap = {
    '23': 'integer',
    '1043': 'varchar',
    '1042': 'char',
    '1082': 'date',
    '1114': 'timestamp',
    '1700': 'numeric',
    '701': 'float',
    '790': 'money',
    '25': 'text',
    '1083': 'time'
};

var varTypeMap = {
    '23': 'number',
    '1043': 'string',
    '1042': 'string',
    '1082': 'date',
    '1114': 'date',
    '1700': 'number',
    '701': 'number',
    '790': 'number',
    '25': 'string',
    '1083': 'date'
};

class PgsqlService extends BaseServiceClass {
    constructor(dbConfig, cb) {
        // dbConfig.timezone = dbConfig.timezone || '08:00';
        // dbConfig.charset = dbConfig.charset || 'utf8mb4';
        super(dbConfig);
        this.dbConfig = dbConfig;
        this.pool = new Pool(dbConfig);
        if (typeof cb === 'function') {
            setTimeout(function() {
                cb();
            }, 1)
        }
    }
    // @overridden BaseServiceClass#criteriaQuery
    criteriaQuery(criteria, callback) {
        var limitReg = /\sLIMIT\s+\d+\s*(\,\s*\d+\s*)?$/i;
        var that = this;
        var limitClause = criteria.query.match(limitReg);
        criteria.query = criteria.query.replace(limitReg, '');

        var statement = this.prepareSQLStatement(criteria, '?');

        var sql = statement.sql + (limitClause || [''])[0];
        var params = statement.params;
        
        var ROWS_LENGTH = 'ROWS_LENGTH';

        var countRecords = function(cb) {
            if (!criteria.paged || !criteria.countRecords) {
                return cb(null, ROWS_LENGTH);
            }
            // var countSql = "SELECT count(*) records FROM (" + sql + ") A";
            var countSql = that.getCountSql(sql, params);
            
            // Create connection and destroy it after use. This is just for preview mode, 
            // and different from connection using method in bodhi app.
        
            var i = 1;
            var args = [];
            countSql.sql = countSql.sql.replace(/\?/g, function(s) {
                            var val = countSql.params[i-1];
                            // Handle array specially for batch operations
                            if (val instanceof Array) {
                                i++;
                                return ' ' + myescape(val) + ' ';
                            }
                            args.push(val);
                            return '$' + i++;
                        });
             that.pool.query(countSql.sql, args, function(err, result) {
                if (err) {
                    return cb(err);
                }
                if (!result.rows.length) {
                    return cb(null, 0);
                }
                cb(null, result.rows[0]['records']);
            });
        };

        var fetchData = function(cb) {
            if ( criteria.sortBy ) {
                sql = sql + " ORDER BY " + criteria.sortBy;
            }
            if ( criteria.paged === true ) {
                criteria.rowNum = parseInt(criteria.rowNum) || 1;
                sql = sql.replace(limitReg, '');
                sql = sql + " LIMIT " 
                    + criteria.rowNum
                    + " OFFSET "
                    + ( ( criteria.page - 1 ) * criteria.rowNum ) 
            }

            var i = 1;
            var args = [];
            sql = sql.replace(/\?/g, function(s) {
                var val = params[i-1];
                // Handle array specially for batch operations
                if (val instanceof Array) {
                    i++;
                    return ' ' + myescape(val) + ' ';
                }
                args.push(val);
                return '$' + i++;
            });
            that.pool.query(sql, args, function(err, res) {
                
                if (err) {
                    return cb(err);
                }

                var result = {
                    rows: res.rows,
                    paged: criteria.paged,
                    page: criteria.page,
                    rowNum: criteria.rowNum
                };
                if (criteria.metaData) {
                    result.metaData = res.fields.map(function(f) {
                        f.dbType = dbTypeMap[f.dataTypeID];
                        f.varType = varTypeMap[f.dataTypeID] || 'string';
                        return f;
                    });
                }

                cb(null, result);
            });
        };

        async.parallel([countRecords, fetchData], function(err, results) {
            if (err) {
                return callback(err);
            }
            var records = results[0];
            var finalResult = results[1];

            finalResult.records = records === ROWS_LENGTH 
                ? finalResult.rows.length
                : records;

            if (criteria.format === 'array') {
                finalResult.rows = finalResult.rows.map(function(obj) {
                    var arr = [];
                    for (var i in obj) {
                        arr.push(obj[i]);
                    }
                    return arr;
                });
            }
            callback(null, finalResult);
        });
    }

    execute(sql, params, callback) {
        // Create connection and destroy it after use. This is just for preview mode, 
        // and different from connection using method in bodhi app.

        var i = 1;
        var args = [];
        sql = sql.replace(/\?/g, function(s) {
                var val = params[i-1];
                // Handle array specially for batch operations
                if (val instanceof Array) {
                    i++;
                    return ' ' + myescape(val) + ' ';
                }
                args.push(val);
                return '$' + i++;
            });
        this.pool.query(sql, args, function(err, result) {
            if (err) {
                return callback(err);
            }
            if (result.command === 'SELECT') {
                return callback(null, {
                    rows: result.rows,
                    metaData: result.fields.map(function(f) {
                        if (f) {
                            f.dbType = dbTypeMap[f.dataTypeID];
                            f.varType = varTypeMap[f.dataTypeID] || 'string';
                        }
                        return f;
                    })
                });
            }
            callback(null, result);
        });
    }

    beginTransaction(done) {
        this.pool.connect(function(err, conn, release) {
            if (err) {
                done(err);
                return;
            }
            // hack
            var exec = conn.query;
            conn.execute = function(sql, params, callback) {
                var i = 1;
                var args = [];
                sql = sql.replace(/\?/g, function(s) {
                    var val = params[i-1];
                    // Handle array specially for batch operations
                    if (val instanceof Array) {
                        i++;
                        return ' ' + myescape(val) + ' ';
                    }
                    args.push(val);
                    return '$' + i++;
                });

                exec.apply(conn, [sql, args, function(err, result, fileds) {
                    if (err) {
                        return callback(err);
                    }

                    if (result.command === 'SELECT') {
                        return callback(null, {
                            rows: result.rows,
                            metaData: result.fields.map(function(f) {
                                if (f) {
                                    f.dbType = dbTypeMap[f.dataTypeID];
                                    f.varType = varTypeMap[f.dataTypeID] || 'string';
                                }
                                return f;
                            })
                        });
                    }
                    callback(null, result);
                }])
            };
            conn.release = function() {
                release();
            }
            conn.close = function() {
                release();
            }
            conn.rollback = function(cb) {
                conn.query('ROLLBACK', err => {
                    if (err) {
                        console.error('Error rolling back client', err.stack);
                        cb(err);
                    }
                    cb();
                })
            };
            conn.commit = function(cb) {
                conn.query('COMMIT', err => {
                    if (err) {
                        console.error('Error Commit', err.stack);
                        cb(err);
                    }
                    cb();
                })
            };
            conn.query('BEGIN', err => {
                if (err) {
                    return done(err);
                }
                done(null, conn);
            });
        });
    }

    getConnection(cb) {
        this.pool.connect(function(err, conn, release) {
            // hack
            conn.execute = conn.query;
            conn.release = release;
            conn.destroy = release;
            cb(null, conn);
        });
    }
}

module.exports = PgsqlService;
