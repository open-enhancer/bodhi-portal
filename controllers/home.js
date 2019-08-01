var CHINESE = 'zh-cn';
var BASE = 'base';

var fs = require('fs');
var conf_system = require('../config/system');
var conf_front_home = require('../config/front_home');
var conf_front_home_jsonstr = JSON.stringify(conf_front_home);

var conf_front_login = require('../config/front_login');
conf_front_login.enableVeriCode = conf_system.login.enableVeriCode;
var conf_front_login_jsonstr = JSON.stringify(conf_front_login);


var externalUrlBase = conf_system.externalUrlBase.replace(/\/$/, '');
var store = require('../common/redis-service').getSessionStore();

var HomeController = {
    index: function(req, res) {
        if (!req.session || !req.session.user) {
            res.redirect('/login');
            return;
        }
        var lang = conf_system.defaultLang || req.cookies.lang || CHINESE;
        var themeName = req.cookies['theme'] || conf_system.themeName || BASE;
        
        res.render('index.html', {
            title: conf_front_home.header.title || conf_system.name,
            conf_front: conf_front_home_jsonstr,
            baseUrl: externalUrlBase,
            favicon: conf_system.faviconUrl,
            language: lang,
            themeName: themeName,
            userInfo: JSON.stringify(req.session.user)
        });
    },
    login: function(req, res) {
        if (req.session.user) {
            res.redirect('/');
            return
        }

        var lang = conf_system.defaultLang || req.cookies.lang || CHINESE;
        var themeName = req.cookies['theme'] || conf_system.themeName || BASE;
        res.render('login.html', {
            baseUrl: externalUrlBase,
            favicon: conf_system.faviconUrl,
            title: conf_front_login.title || conf_system.name,
            language: lang,
            themeName: themeName,
            conf_login: conf_front_login_jsonstr
        });
    }
};
module.exports = HomeController;