var conf = require('../../config/system').redis;
var redis = require('redis');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var client = redis.createClient(conf.port, conf.host);

var sessionMaxAge = require('../../config/system').sessionMaxAge;
var INFINITE_TIME = 15 * 24 * 3600;
var SESSION_MAX_AGE = 60 * (function(maxAge) {
    if (maxAge === 'infinite') {
        return INFINITE_TIME;
    }
    return parseInt(maxAge) || 30;
})(sessionMaxAge);

var store = new RedisStore({
    client: client,
    ttl: SESSION_MAX_AGE,
    db: conf.db,
    pass: conf.pass
});

module.exports = {
	getClient: function() {
		return client;
	},
	getSessionStore: function() {
		return store;
	}
}