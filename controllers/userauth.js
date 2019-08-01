var systemConfig = require('../config/system');
var log4js = require('log4js');
var logger = log4js.getLogger('user');
var captcha = require('enhancer-captcha');
var dbservice = require('../common/database-service');

var loginSettings = systemConfig.login;

var UserAuthController = {};

module.exports = UserAuthController;

UserAuthController.captcha = function(req, res) {
    if (loginSettings.enableVeriCode === false) {
        return res.end();
    }
    var onlyNum = loginSettings.veriCodeComp === 'num';
    var text = captcha.text(loginSettings.veriCodeLenth || 5, onlyNum);
    var img = captcha.make(text, !!loginSettings.colorfulCaptcha, loginSettings.veriCodeLevel || 1);

    req.session.veriCode = text.toUpperCase();
    res.setHeader('Content-Type', 'image/bmp');
    res.end(img.getFileData());
};

// Logout
var logout = require('../config/logout');

if (typeof logout !== 'function') {
    logout = function(req) {};
}

UserAuthController.logout = function(req, res, next) {
    if (req.session && req.session.user) {
        var uid = req.session.user.id;
        logger.info(uid + ' is tring to logout.');
        try {
            logout(req);
        } catch (e) {
            logger.error('Error occured when executing custom logout function. Caused by:');
            logger.error(e);
        }
        req.session.destroy(function(err) {
            if (err) {
                logger.info(uid + ' log out failed.');
                return next(err)
            }
            logger.info(uid + ' logged out.');

            res.send({
                success: true,
                message: 'bye'
            });
        });
    } else {
        res.end();
    }
};

// Login with custom function
if (loginSettings.validationMode === 'custom') {
    var login = require('../config/login');
    UserAuthController.login = login;
    return;
}

// Login with user table mode
var userTable = loginSettings.userTable;
if (!userTable || !userTable.tableName || !userTable.idFieldName 
        || !userTable.nameFieldName || !userTable.passwordFieldName) {
    throw new Error('The user table config is invalid for login validation.');
}
var sql = 'SELECT '
        + userTable.idFieldName + ' E_USER_ID, ' 
        + userTable.nameFieldName + ' E_USER_NAME, '
        + (userTable.roleFieldName ? userTable.roleFieldName + ' E_ROLES, ' : '')
        + (userTable.statusFieldName ? userTable.statusFieldName + ' E_STATUS, ' : '')
        + 'u.* '
        + 'FROM ' + userTable.tableName + ' u '
        + 'WHERE ' + userTable.idFieldName + ' = ? AND ' + userTable.passwordFieldName + ' = ?';

var hash = require('../common/hash');
logger.info('The validation sql for login: ');
logger.info(sql);
logger.info('The password hash type:', loginSettings.hashType);

UserAuthController.login = function(req, res, next) {
    // check code
    if (loginSettings.enableVeriCode) {
        if (!req.body.code || req.body.code !== req.session.veriCode) {
            res.send({success: false, message: 'Invalid code.', code: 'INVALID_VERI_CODE'})
            return;
        }
    }
    if (!req.body.uid || !req.body.pwd) {
        res.send({success: false, message: 'Invalid user id or password.', code: 'INVALID_USER_OR_PWD'});
        return;
    }

    // hash the password
    var uid = req.body.uid;
    var pwd = hash.digest(loginSettings.hashType, req.body.pwd);

    dbservice.execute(sql, [uid, pwd], function(err, result) {
        if (err) {
            return next(err);
        }
        if (!result.rows.length) {
            res.send({
                success: false,
                message: 'Invalid user id or password.',
                code: 'INVALID_USER_OR_PWD'
            });
            return;
        }
        var user = result.rows[0];

        // check status if specified.
        if (userTable.statusFieldName) {
            if (!user['E_STATUS']) {
                res.send({
                    success: false,
                    message: 'Invalid user account status.',
                    code: 'INVALID_ACCOUNT_STATUS'
                });
                return;
            }
        }

        user.id = user['E_USER_ID'];
        user.name = user['E_USER_NAME'];
        user.roles = user['E_ROLES'];
        user.status = user['E_STATUS'];
        delete user['E_USER_ID'];
        delete user['E_USER_NAME'];
        delete user['E_ROLES'];
        delete user['E_STATUS'];
        delete user[userTable.passwordFieldName];

        req.session.user = user;

        res.send({success: true, message: 'ok'});

    });
};

