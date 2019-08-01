/**
 * Database Service Class
 * @param databaseConfiguration {Object} Database configuration
 *  eg: 
    {
      "default": "__default__",
      "connections": {
        "__default__": {
          "databaseType": "mysql",
          "host": "115.28.48.117",
          "port": "3306",
          "database": "widget_usage",
          "user": "zyz",
          "password": "passw0rd",
          "acquireTimeout": "1000",
          "connectionLimit": "100",
          "queueLimit": "20"
        }
      }
    }
 */
function DatabaseService(databaseConfiguration) {
    this.config = databaseConfiguration;
    this.services = {};

    // Prepare services first, to avoid for using dataservice before it is not ready.
    for (var i in this.config.connections) {
      this.getService(i);
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

    getService: function(connectionName) {
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
        this.services[connectionName] = new Service(dbConfig);
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

var instance = new DatabaseService(dbconfig);


module.exports = instance;