/**
 * Copyright © 2021 Wuyuan Info Tech Co., Ltd. All rights reserved.
 * License: MIT
 * Site: https://wuyuan.io
 * Author: zyz
 * Updated: 2020/12/30
 **/

/*
 * Database Service Class
 * @param databaseConfiguration {Object} Database configuration
 *  eg: 
    {
      "default": "__default__",
      "connections": {
        "__default__": {
          "databaseType": "mysql",
          "host": "127.0.0.1",
          "port": "3306",
          "database": "my_db",
          "user": "zyz",
          "password": "passw0rd",
          "acquireTimeout": "1000",
          "connectionLimit": "100",
          "queueLimit": "20"
        }
      }
    }
  * @param cb {Function} callback
  */
function DatabaseService(databaseConfiguration, cb) {
    var that = this;
    that.config = databaseConfiguration;
    that.services = {};
    var marks = {};
    var isAllCompleted = function() {
        for (var i in marks) {
            if (!marks[i]) {
                return false;
            }
        }
        return true;
    }
    // Prepare services first, to avoid for using dataservice before it is not ready.
    for (var i in that.config.connections) {
        marks[i] = false;
        (function(cname) {
            that.getService(cname, function(err) {
                if (err) {
                    console.error('Failed to create database connection pool', cname, '. Caused by:');
                    console.error(err);
                    return
                }
                marks[cname] = true;
                console.log('Database connection pool', cname, 'is created.');
                if (isAllCompleted()) {
                    if (typeof cb === 'function') {
                        cb(null, that);
                    }
                }
            });
        })(i);
    }
}

DatabaseService.prototype = {
    /**
     * {Function} query
     * @param connectionName {String} [optional] The connection name defined in 
     *   databaseConfiguration.connections. If not set, the query will be executed using 
     *   default connection.
     * @param criteria {Object} [required] @see Service.prototype.prepareStatement()
     *   in ./service-base.js
     * @param cb {Function} Callback function.
     **/
    criteriaQuery: function(connectionName, criteria, cb) {
        if (arguments.length === 2) {
            cb = criteria;
            criteria = connectionName;
            connectionName = this.config.default;
        }

        // Consider rewrite callback to catch adventitious execptions
        var callback = cb;
        var service = this.getService(connectionName);
        criteria.query = (criteria.query || '').replace(/\;\s*$/, '');
        service.criteriaQuery(criteria, callback);
    },

    getService: function(connectionName, cb) {
        if (!connectionName) {
            connectionName = this.config.default;
        }
        if (this.services[connectionName]) {
            return this.services[connectionName];
        }

        var dbConfig = this.config.connections[connectionName];
        if (!dbConfig) {
            dbConfig = this.config.connections[this.config.default];
        }
        var databaseType = dbConfig.databaseType || 'mysql';
        var Service = require('./service-' + databaseType);
        this.services[connectionName] = new Service(dbConfig, cb);
        return this.services[connectionName];
    },

    execute: function(connectionName, sql, params, cb) {
        if (arguments.length === 3) {
            cb = params;
            params = sql;
            sql = connectionName;
            connectionName = this.config.default;
        }

        var callback = cb;
        var dbService = this.getService(connectionName);
        dbService.execute(sql, params, function(err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    beginTransaction: function(connectionName, cb) {
        if (arguments.length === 1) {
            cb = connectionName;
            connectionName = this.config.default;
        }
        var dbService = this.getService(connectionName);
        var callback = cb;
        dbService.beginTransaction(callback);
    },
    getConnection: function(connectionName, cb) {
        if (arguments.length === 1) {
            cb = connectionName;
            connectionName = this.config.default;
        }
        var dbService = this.getService(connectionName);
        var callback = cb;
        dbService.getConnection(callback);
    }
};
var dbconfig = {
    default: '__default__',
    connections: {
        __default__: require('../../config/system').database
    }
};
var instance = new DatabaseService(dbconfig, function(err) {
    process.nextTick(function() {
        if (typeof DatabaseService.onInit === 'function') {
            DatabaseService.onInit(err);
        }
    });
});

DatabaseService.getInstance = function() {
    return instance;
};

module.exports = DatabaseService;