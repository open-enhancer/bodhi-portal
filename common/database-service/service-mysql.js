'use strict';

var BaseServiceClass = require('./service-base');
var mysql = require('mysql');
var async = require('async');

var dbTypeMap = {
    '1': 'TINYINT',
    '2': 'SMALLINT',
    '3': 'INT',
    '4': 'FLOAT',
    '5': 'DOUBLE',
    '7': 'TIMESTAMP',
    '8': 'BIGINT',
    '9': 'MEDIUMINT',
    '10': 'DATE',
    '11': 'TIME',
    '12': 'DATETIME',
    '13': 'YEAR',
    '16': 'BIT',
    '252': 'BLOB',
    '253': 'VARCHAR',
    '254': 'CHAR',
    '246': 'DECIMAL'
};

var varTypeMap = {
    '1': 'number', 
    '2': 'number', 
    '3': 'number', 
    '4': 'number',
    '5': 'number',
    '7': 'number',
    '8': 'number',
    '9': 'string',
    '10': 'string',
    '11': 'string',
    '12': 'string',
    '13': 'string',
    '14': 'string',
    '15': 'string',
    '16': 'string',
    '252': 'string',
    '253': 'string',
    '254': 'string',
    '246': 'number'
};

class MysqlService extends BaseServiceClass {
    constructor(dbConfig) {
        dbConfig.timezone = dbConfig.timezone || '08:00';
        super(dbConfig);
        this.dbConfig = dbConfig;
        this.pool = mysql.createPool(dbConfig);
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

            if (!criteria.paged && !criteria.countRecords) {
                return cb(null, ROWS_LENGTH);
            }
            var countSql = "SELECT count(*) records FROM (" + sql + ") A";

            that.pool.query(countSql, params, function(err, result) {
                if (err) {
                    return cb(err);
                }
                if (!result.length) {
                    return cb(new Error('Invalid count sql.'));
                }
                cb(null, result[0]['records']);
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
                    + ( ( criteria.page - 1 ) * criteria.rowNum ) 
                    + ", " + criteria.rowNum;
            }
            
            that.pool.query(sql, params, function(err, rows, fields) {
                if (err) {
                    return cb(err);
                }

                var result = {
                    rows: rows,
                    paged: criteria.paged,
                    page: criteria.page,
                    rowNum: criteria.rowNum
                };
                if (criteria.metaData) {
                    result.metaData = fields.map(function(f) {
                        f.dbType = dbTypeMap[f.type];
                        f.varType = varTypeMap[f.type] || 'string';
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
        this.pool.query(sql, params, function(err, result, fileds) {
            if (err) {
                return callback(err);
            }
            if (result instanceof Array) {
                return callback(null, {
                    rows: result,
                    metaData: fileds.map(function(f) {
                        if (f) {
                            f.dbType = dbTypeMap[f.type];
                            f.varType = varTypeMap[f.type] || 'string';
                        }
                        return f;
                    })
                });
            }
            callback(null, result);
        });
    }

    beginTransaction(cb) {
        this.pool.getConnection(function(err, conn) {
            if (err) {
                return cb(err);
            }
            var exec = conn.query;
            conn.execute = function(sql, params, callback) {
                exec.apply(conn, [sql, params, function(err, result, fileds) {
                    if (err) {
                        return callback(err);
                    }

                    if (result instanceof Array) {
                        return callback(null, {
                            rows: result,
                            metaData: fileds.map(function(f) {
                                if (f) {
                                    f.dbType = dbTypeMap[f.type];
                                    f.varType = varTypeMap[f.type] || 'string';
                                }
                                return f;
                            })
                        });
                    }
                    callback(null, result);
                }])
            };
            conn.beginTransaction(function(err) {
                if (err) {
                    return cb(err);
                }
                cb(null, conn);
            });
        });
    }

    getConnection(cb) {
        this.pool.getConnection(function(err, conn) {
            if (err) {
                return cb(err);
            }
            conn.execute = conn.query;
            cb(null, conn);
        });
    }
}

module.exports = MysqlService;
