var fs = require('fs');
var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var log4js = require('log4js');
var logger = log4js.getLogger('app');
var mustache = require('mustache');
var routes = require('./routes/index');
var systemConfig = require('./config/system');
var i18n = require('./i18n');

var store = require('./common/redis-service').getSessionStore();

var app = express();
app.set('env', 'development');
app.set('views', path.resolve(__dirname, './views'));

// view set to store templates
var views = {};

// define the template engine
app.engine('html', function (filePath, options, callback) {
    var tpl = views[filePath];
    if (tpl) {
        return callback(null, mustache.render(tpl, options));
    }
    fs.readFile(filePath, function (err, content) {
        if (err) {
            return callback(new Error(err));
        }
        content = content + '';
        views[filePath] = content;
        return callback(null, mustache.render(content, options));
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(log4js.connectLogger(logger, {level: 'auto'}));

app.use(bodyParser.json({limit: (systemConfig.formPayloadLimit || '1mb')}));

app.use(bodyParser.urlencoded({ extended: false, limit: (systemConfig.userFileSizeLimit || '20mb')}));

var INFINITE_TIME = 1000 * 365 * 24 * 60 * 10;
var SESSION_MAX_AGE = 60 * 1000 * (function(maxAge) {
    if (maxAge === 'infinite') {
        return INFINITE_TIME;
    }
    return parseInt(maxAge) || 30;
})(systemConfig.sessionMaxAge);

var sessConf = {
    name: 'signed_token',
    secret: 'b0dh!-p0rta1',
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: SESSION_MAX_AGE
    }
};

if (systemConfig.firstLevelDomain) {
    sessConf.domain = systemConfig.firstLevelDomain;
    console.log('Effective Domain:', systemConfig.firstLevelDomain);
} else {
    logger.error('The fristLevelDomain must be specified in config/system.js! Ohterwise the apps accessed by this portal will not work properly!');
    logger.error('必须在配置文件 config/system.js 中指定本系统运行所在的一级域名 fristLevelDomain，否则接入应用无法正常工作。');
}

app.use(session(sessConf));

app.use(cookieParser());

// Prepare locale pack and user env info.

var Useragent = require('express-useragent');

function getClientIp (req) {
  var ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] ||
    req.ip ||
    (req.connection && req.connection.remoteAddress) ||
    (req.socket && req.socket.remoteAddress) ||
    (req.connection && req.connection.socket && req.connection.socket.remoteAddress) || '';

  if (ip || ip.split(',').length > 0) {
    ip = ip.split(',')[0]
  }
  return ip;
}
app.use(function(req, res, next) {
    var lang = req.cookies.lang || 'zh-cn';
    if (lang !== 'en') {
        lang = 'zh-cn'
    }
    req.locale = i18n(lang);
    req.ip = getClientIp(req);
    req.ua = Useragent.parse(req.headers['user-agent'] || '');

    res.cookie('access_token', req.sessionID, {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: SESSION_MAX_AGE,
        domain: systemConfig.firstLevelDomain || req.headers.host.replace(/\:\d+$/, '')
    });
    next();
});

// Check if the redis server is connected normally.
app.use(function(req, res, next) {
    if (!req.session) {
        var err = new Error(req.locale('redisConnErr', {port: systemConfig.redis.port}));
        err.status = 500;
        return next(err);
    }
    next();
});

app.use('/public', express.static(path.join(__dirname, 'assets/build')));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('URL Not Found: ' + req.url);
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    logger.error(err);
    var code = err.status || 500;
    res.status(code);
    
    // if request is ajax
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        res.send(err.message);
        return
    }
    if (code == 404) {
        res.render('404', {
            message: req.locale('pageNotFound')
        });
        return 
    }
    res.render('500', {
        code: code,
        message: err.message
    });
});

module.exports = app;
