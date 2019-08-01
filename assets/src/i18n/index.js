// LANG is a macro defined in webpack.config.js

var locale = require('./locale.' + LANG + '.js');
var __lang__ = '__lang__';

module.exports = function (key, options) {
    if (!key) {
        return locale;
    }

    if (__lang__ === key) {
        return LANG;
    }

    options = options || {};

    return locale[key]
        ? locale[key].replace(/\{\{(\w+)\}\}/g, function(s, $1) {
            return options[$1];
        })
        : (function() {
            console.warn('Key ' + key + ' is not found in locale');
            return '<?No Translation>';
        })();
};