module.exports = function(lang) {
    var locale = require('./locale.' + lang + '.js');
    return function (key, options) {
        if (!key) {
            return locale;
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
    }
}