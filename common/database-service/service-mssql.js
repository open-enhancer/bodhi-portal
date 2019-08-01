'use strict';

var BaseServiceClass = require('./service-base');
var async = require('async');
var mssql = require('mssql');
var escape = require('mysql').escape;
var myescape = function(val) {
    val = escape(val) + '';
    return val.replace(/\\'/g, "''")
};

var escapeId = require('mysql').escapeId;
var myescapeId = function(val) {
    if (!val) {
        return '';
    }
    val = escapeId(val);
    val = val.relace(/^\`/, '[').relace(/\`$/, ']');
    return val;
}

var varTypeMap = {
    bit: "number",
    int: "number",
    smallint: "number",
    tinyint: "number",
    numeric: "number",
    decimal: "number",
    money: "number",
    smallmoney: "number",
    float: "number",
    real: "number",
    datetime: "string",
    timestamp: "string",
    char: "string",
    varchar: "string",
    text: "string",
    nchar: "string",
    nvarchar: "string",
    ntext: "string",
    binary: "string",
    varbinary: "string",
    image: "string"
};

class MssqlService extends BaseServiceClass {
    constructor(dbConfig) {
        super(dbConfig);
        dbConfig.server = dbConfig.host;
        dbConfig.max = dbConfig.connectionLimit;
        dbConfig.connectionTimeout = parseInt(dbConfig.acquireTimeout);
        if (dbConfig.connectionTimeout < 5000) {
            dbConfig.connectionTimeout = 5000;
        }
        dbConfig.requestTimeout = 600000;
        dbConfig.port = parseInt(dbConfig.port);
        dbConfig.options = {};
        dbConfig.options.encrypt = dbConfig.encrypt || false;
        this.dbConfig = dbConfig;
        this.pool = new mssql.ConnectionPool(dbConfig);
        var that = this;
        this.pool.connect(err => {
            if (err) {
                console.error('Database config: ', dbConfig);
                err.message = 'Failed to create database connection pool. caused by: '
                    + err.message;
                console.error(err);
                throw err;
            }
        });
        // Keep in touch with database.
        var duration = 1000 * 60;
        setTimeout(function() {
            setInterval(function() {
                var req = that.pool.request();
                var sql = 'SELECT 1';
                req.query(sql, (err, result) => {
                    if (err) {
                        if (err.code === 'ECONNCLOSED') {
                            // Reconnect
                            that.pool.connect(function(err) {
                                if (err) {
                                    console.error('Mssql connection is closed, and reconnect failed.');
                                    return console.error(err);
                                }
                                console.log('Mssql connection is reconnected.');
                            });
                            return
                        }
                        console.error('Mssql connection error:', err);
                        return
                    }
                });
            }, duration);
        }, 1000);
    }
    /**
     * @overridden BaseServiceClass#criteriaQuery.
     * @param criteria {Object} Query criteria
     *  eg: {
            id: "d101",
            query: "SELECT * FROM TABLE_$curr_year$ WHERE UID = @user_id@ AND NUM = @12-number@",
            serverVars: {...}
            params: {"1-userid": "zyz"},
            countRecords: true || false,
            metaData: true || false
            filter: {...}, // @see this.__parseFiltersToSqlConditions()
            format: "object" || "array",
            paged: false || true,
            page: 0,
            rownum: 10,
            sortBy: "uid asc, num desc"
        }
     * @param callback {Function} 
        - err
        - result
     */
    criteriaQuery(criteria, callback) {
        var dbConfig = this.dbConfig;
        var that = this;
        var statement = this.prepareSQLStatement(criteria, '?');
        var sql = statement.sql.replace(/\\'/g, "''");
        var params = statement.params;
        var pool = this.pool;
        var ROWS_LENGTH = 'ROWS_LENGTH';
        var countRecords = function(cb) {
            if (!criteria.paged && !criteria.countRecords) {
                return cb(null, ROWS_LENGTH);
            }

            var req = pool.request();

            // input parameter
            var i = 0;
            var countSql = sql.replace(/\?/g, function(id) {
                var pname = '@param' + i;
                var val = params[i];
                // Handle array specially for batch operations
                if (val instanceof Array) {
                    i++;
                    return ' ' + myescape(val) + ' ';
                }
                req.input('param' + i, val);
                i++;
                return pname;
            });
            countSql = "SELECT count(*) records FROM (" + countSql + ") A";
            req.query(countSql, (err, result) => {
                if (err) {
                    return cb(err);
                }
                cb(null, result.recordset[0].records);
            });
        };

        var fetchData = function(cb) {
            if ( criteria.paged === true ) {
                criteria.rowNum = parseInt(criteria.rowNum) || 1;
                var start = ( criteria.page - 1 ) * criteria.rowNum + 1;
                var end = start + criteria.rowNum - 1;
                sql = sql.replace(/^\s*SELECT\s/i, function(s) {
                    return 'SELECT ROW_NUMBER() OVER (ORDER BY '
                        + (criteria.sortBy || '(SELECT NULL)')
                        + ') __RN, ';
                });
                sql = 'SELECT * FROM (' + sql 
                        + ') AS TAB1 WHERE __RN BETWEEN ' + start + ' AND '  + end;

            } else if ( criteria.sortBy ) {
                sql = sql + " ORDER BY " + criteria.sortBy;
            }
            var req = pool.request();

            // input parameter
            var i = 0;
            sql = sql.replace(/\?/g, function(id) {
                var pname = '@param' + i;
                var val = params[i];
                // Handle array specially for batch operations
                if (val instanceof Array) {
                    i++;
                    return ' ' + myescape(val) + ' ';
                }
                req.input('param' + i, val);
                i++;
                return pname;
            });
            req.query(sql, (err, data) => {
                if (err) {
                    return cb(err);
                }
                if ( criteria.paged === true && data.recordset ) {
                    data.recordset = data.recordset.map(function(r) {
                        delete r.__RN;
                        return r;
                    });
                }
                var result = {
                    rows: data.recordset,
                    paged: criteria.paged,
                    page: criteria.page,
                    rowNum: criteria.rowNum
                };
                if (criteria.metaData) {
                    result.metaData = (function(columns) {
                        var fields = [];
                        var col;
                        for ( i in columns ) {
                            col = columns[i];
                            col.dbType = col.type.declaration;
                            col.varType = varTypeMap[col.dbType.toLowerCase()] || 'string';
                            fields.push(col);
                        }
                        return fields;
                    })(data.recordset.columns);
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

    execute(sql, params, cb) {
        var that = this;
        var dbConfig = this.dbConfig;
        var pool = this.pool;
        var req = pool.request();
        var i = 0;
        var val;
        sql = sql.replace(/\?\??/g, function(id) {
            val = params[i];

            if (/\?\?/.test(id)) {
                i++;
                return ' ' + myescapeId(val) + ' ';
            }

            // Handle array specially for batch operations
            if (val instanceof Array) {
                i++;
                return ' ' + myescape(val) + ' ';
            }
            var pname = '@param' + i;
            req.input('param' + i, val);
            i++;
            return pname;
        });
        req.query(sql, (err, result) => {
            if (err) {
                return cb(err);
            }
            result = that.__standardize(result);
            cb(null, result);
        });
    }
    
    __standardize(result) {
        result.affectedRows = result.rowsAffected[0]; 
        if (result.recordset) {
            result.rows = result.recordset;
            result.metaData = (function(columns) {
                var fields = [];
                var col;
                for ( var i in columns ) {
                    col = columns[i];
                    col.dbType = col.type.declaration;
                    col.varType = varTypeMap[col.dbType.toLowerCase()] || 'string';
                    fields.push(col);
                }
                return fields;
            })(result.recordset.columns);
        }
        delete result.rowsAffected;
        delete result.recordset;
        return result;
    }
    /**
     * {Function} beginTransaction
     */
    beginTransaction(callback) {
        var dbConfig = this.dbConfig;
        var pool = this.pool;
        var transaction = pool.transaction();
        var that = this;
        transaction.begin(err => {
            if (err) {
                return callback(err);
            }
            
            // Construct connection obj.
            var conn = {};

            conn.rollback = function() {
                transaction.rollback.apply(transaction, arguments);
            };
            conn.commit = function() {
                transaction.commit.apply(transaction, arguments);
            };
            conn.release = function() {
                // pool.close();
            };
            conn.close = function() {
                // pool.close();
            };
            conn.execute = function(sql, params, cb) {
                var req = transaction.request();
                var i = 0;
                var val;
                sql = sql.replace(/\?\??/g, function(id) {
                    val = params[i];
                    if (/\?\?/.test(id)) {
                        i++;
                        return ' ' + myescapeId(val) + ' ';
                    }
                    // Handle array specially for batch operations
                    if (val instanceof Array) {
                        i++;
                        return ' ' + myescape(val) + ' ';
                    }
                    var pname = '@param' + i;
                    req.input('param' + i, val);
                    i++;
                    return pname;
                });
                req.query(sql, (err, result) => {
                    if (err) {
                        return cb(err);
                    }
                    result = that.__standardize(result);
                    cb(null, result);
                });
            };
            callback(null, conn);
        });
    }

    /**
     * {getConnection}
     */
    getConnection(callback) {
        var dbConfig = this.dbConfig;
        var pool = this.pool;

        // Construct connection obj.
        var conn = {};
        conn.release = function() {
            // pool.close();
        };
        conn.close = function() {
            // pool.close();
        };
        conn.execute = function(sql, params, cb) {
            var req = pool.request();
            var i = 0;
            var val;
            sql = sql.replace(/\?\??/g, function(id) {
                val = params[i];
                if (/\?\?/.test(id)) {
                    i++;
                    return ' ' + myescapeId(val) + ' ';
                }
                // Handle array specially for batch operations
                if (val instanceof Array) {
                    i++;
                    return ' ' + myescape(val) + ' ';
                }
                var pname = '@param' + i;
                req.input('param' + i, val);
                i++;
                return pname;
            });
            req.query(sql, cb);
        };
        callback(null, conn);
    }
}

module.exports = MssqlService;