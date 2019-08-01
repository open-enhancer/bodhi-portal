require('./index.less');
var locale = require('../../i18n');
var tpl = require('./index.html');
var isIP = /^\d+(\.\d+){3}$/;

module.exports = {
    __onChangeCallbacks: [],
    init: function() {
        this.$selector = $(tpl({
                locale: locale()
            })).appendTo($('body'));

        this.$mask = $('<div>').addClass('theme-selector-mask').appendTo($('body'));

        var theme = this.getThemeName();
        this.$selector.find('.theme-list li[themename='+theme+']').addClass('ui-state-highlight');
        this.__bindEvent();
    },

    __bindEvent: function() {
        var that = this;
        this.$selector.find('li').on('click', function() {
            var themeName = $(this).attr('themename');
            var $theme = $('#theme');
            var lastThemeName = $theme.attr('themename');
            if (lastThemeName === themeName) {
                return;
            }
            that.$selector.find('li.ui-state-highlight')
                .removeClass('ui-state-highlight');
            var href = $theme.attr('href').replace(lastThemeName, themeName);
            $theme.attr('href', href).attr('themename', themeName);
            $(this).addClass('ui-state-highlight');
            $.cookie('theme', themeName, {
                domain: isIP.test(document.domain) ? document.domain 
                        : document.domain.match(/[^\.]+\.[^\.]+$/)[0]
            });
            $('body').attr('theme', themeName);
            setTimeout(function() {
                that.__onChangeCallbacks.forEach(function(f) {
                    if (typeof f === 'function') {
                        f(themeName);
                    }
                });
            }, 600);
        });
        this.$selector.find(' i.fa-times').on('click', function() {
            that.close();
        });
        if ($('body').width() < 720) {
            this.$mask.on('click', function() {
                that.close();
            });
        }
    },
    open: function() {
        $('body').css('overflow', 'hidden');
        if (!this.$selector) {
            this.init();
        }
        this.$mask.show();
        this.$selector.show('drop', 300);
    },
    close: function() {
        this.$mask.hide();
        this.$selector.hide('drop', 300);
        $('body').css('overflow', 'unset');
    },
    getThemeName: function() {
        return $('body').attr('theme');
    },
    onChange: function(callback) {
        this.__onChangeCallbacks.push(callback);
    }
}