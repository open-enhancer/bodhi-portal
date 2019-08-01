var log4js = require('log4js');
var logger = log4js.getLogger('app');

var sessionStore = require('../common/redis-service').getSessionStore();

var ApiController = {
    isLoggedIn: function(req, res) {
        var access_token = req.body.access_token;
        if (!access_token) {
            res.send({success: false});
            return
        }
        sessionStore.get(access_token, function(err, sess) {
            if (err) {
                logger.error(err);
                res.status(500).send('Server internal error. Caused by:' + err.message);
                return;
            }
            if (!sess || !sess.user) {
                res.send({success: true, isLoggedIn: false});
                return;
            }

            res.send({success: true, isLoggedIn: true, userInfo: sess.user});
            sessionStore.touch(access_token, sess, function(err) {
                if (err) {
                    logger.error('Keep in touch with session', access_token, 'failed. Caused by:');
                    logger.error(err);
                    return
                }
            });
        });
    },
    logout: function(req, res) {
        var access_token = req.body.access_token;
        if (!access_token) {
            res.send({success: false});
            return
        }
        sessionStore.destroy(access_token, function(err) {
            if (err) {
                logger.error(err);
                res.status(500).send('Server internal error. Caused by:' + err.message);
                return;
            }
            res.send({success: true, message: 'ok'});
        });
    }
};

module.exports = ApiController;