/**
 * Copyright © 2021 Wuyuan Info Tech Co., Ltd. All rights reserved.
 * License: MIT
 * Site: https://wuyuan.io
 * Author: zyz
 * Updated: 2020/12/30
 **/

'use strict';

var BaseServiceClass = require('./service-base');
var oracledb = require('oracledb');
oracledb.autoCommit = true;

var async = require('async');

var dbTypeMap = {
    '101': 'BINARY_DOUBLE',
    '100': 'BINARY_FLOAT',
    '113': 'BLOB',
    '96': 'CHAR',
    '112': 'CLOB',
    '12': 'DATE',
    '2': 'NUMBER', // or FlOAT
    '104': 'ROWID',
    '187': 'TIMESTAMP',
    '232': 'TIMESTAMP',
    '188': 'TIMESTAMP',
    '1': 'VARCHAR2'
};

var varTypeMap = {
    '101': 'number',
    '100': 'number',
    '113': 'string',
    '96': 'string',
    '112': 'string',
    '12': 'string',
    '2': 'number', // or FlOAT
    '104': 'string',
    '187': 'string',
    '232': 'string',
    '188': 'string',
    '1': 'string'
};

class OracleService extends BaseServiceClass {
    constructor(dbConfig, cb) {
        super(dbConfig);
        dbConfig.connectString = dbConfig.host + '/' + dbConfig.database;
        dbConfig.poolMax = parseInt(dbConfig.connectionLimit) || 10;
        this.dbConfig = dbConfig;
        var that = this;
        oracledb.createPool(dbConfig, function(err, pool) {
            if (err) {
                console.error('Failed to create connection pool for oracle. Caused by:');
                console.error(err);
                if (typeof cb === 'function') {
                    return cb(err);
                }
                return;
            }

            that.pool = pool;
            if (typeof cb === 'function') {
                cb();
            }
        });
    }
    // @overridden BaseServiceClass#criteriaQuery
    criteriaQuery(criteria, callback) {
        var that = this;
        var statement = this.prepareSQLStatement(criteria, ':var');
        var sql = statement.sql;
        var params = statement.params;
        var ROWS_LENGTH = 'ROWS_LENGTH';

        var countRecords = function(cb) {
            if (!criteria.paged || !criteria.countRecords) {
                return cb(null, ROWS_LENGTH);
            }
            
            var countSql = that.getCountSql(sql, params, ':var');
            that.pool.getConnection(function(err, conn) {
                if (err) {
                    return (err);
                }
                conn.execute(countSql.sql, countSql.params, {
                    outFormat: oracledb.OBJECT
                }, function(err, result) {
                    conn && conn.release();
                    if (err) {
                        return cb(err);
                    }
                    if (!result.rows.length) {
                        return cb(null, 0);
                    }

                    cb(null, result.rows[0]['RECORDS']);
                });
            });
        };

        var fetchData = function(cb) {
            if ( criteria.sortBy ) {
                sql = sql + " ORDER BY " + criteria.sortBy;
            }
            if ( criteria.paged === true ) {
                criteria.rowNum = parseInt(criteria.rowNum) || 1;
                var start = ( criteria.page - 1 ) * criteria.rowNum;
                var end = start + criteria.rowNum + 1;
                sql = ' SELECT * FROM (SELECT A.*, rownum r__ FROM ('
                    + sql +') A WHERE rownum < ' + end + ') B WHERE r__ > ' + start;
            }

            that.pool.getConnection(function(err, conn) {
                if (err) {
                    return (err);
                }
                conn.execute(sql, params, {
                    outFormat: criteria.format === 'array' ? oracledb.ARRAY : oracledb.OBJECT,
                    extendedMetaData: criteria.metaData
                }, function(err, result) {
                    conn && conn.release();
                    if (err) {
                        return cb(err);
                    }

                    result.paged = criteria.paged;
                    result.page = criteria.page;
                    result.rowNum = criteria.rowNum;
                    if (result.metaData) {
                        result.metaData = result.metaData.map(function(f) {
                            f.varType = varTypeMap[f.dbType] || 'string';
                            f.dbType = dbTypeMap[f.dbType];
                            return f;
                        });
                    }
                    if (result.paged === true && result.rows) {
                        result.rows = result.rows.map(function(r) {
                            delete r.r__;
                            return r
                        });
                    }
                    cb(null, result);
                });
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

            callback(null, finalResult);
        });
    }

    execute(sql, params, callback) {
        var that = this;
        that.pool.getConnection(function(err, conn) {
            if (err) {
                return (err);
            }
            sql = sql.replace(/\?/g, ':var ');
            conn.execute(sql, params, {
                autoCommit: true,
                extendedMetaData: true,
                outFormat: oracledb.OBJECT
            }, function(err, result) {
                conn && conn.release();
                if (err) {
                    return callback(err);
                }
                if (result.rows) {
                    result.metaData = result.metaData.map(function(f) {
                        f.dbType = dbTypeMap[f.type];
                        f.varType = varTypeMap[f.type] || 'string';
                        return f;
                    });
                }
                callback(null, result);
            });
        });
    }

    beginTransaction(cb) {
        var that = this;
        that.pool.getConnection(function(err, conn) {
            if (err) {
                return cb(err);
            }

            // hack
            var exec = conn.execute;
            conn.execute = function(sql, params, callback) {
                sql = sql.replace(/\?/g, ':var ');
                exec.apply(conn, [sql, params, {
                    autoCommit: false,
                    extendedMetaData: true,
                    outFormat: oracledb.OBJECT
                }, function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    if (result.rows) {
                        result.metaData = result.metaData.map(function(f) {
                            f.dbType = dbTypeMap[f.type];
                            f.varType = varTypeMap[f.type] || 'string';
                            return f;
                        });
                    }
                    callback(null, result);
                }]);
            }
            cb(null, conn);
        });
    }

    getConnection(cb) {
        var that = this;
        return that.pool.getConnection(cb);
    }
}

module.exports = OracleService;
