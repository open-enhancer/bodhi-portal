require('./index.less');

var locale = require('./i18n');
var tpl = require('./index.html');
var isSmallScreen = $('body').width() < 720;

var settings = window.conf_login;
settings.locale = locale();
settings.locale.userLoginAcc = settings.userIdInputPlaceholder || settings.locale.userLoginAcc

var loginPage = {
    init: function() {
        var that = this;
        
        // Set mode
        $('body').addClass((settings.layoutStyle || 'right') + '-mode')
            .html(tpl(settings));

        if (settings.logoUrl) {
            $('img.logo').css({
                height: (settings.logoHeight || 72) + 'px',
            });
        } else {
            $('img.logo').hide();
        }

        // Set background
        if (settings.backgroundUrl) {
            $('body').css({
                backgroundImage: 'url("' + settings.backgroundUrl + '")'
            });

            var transparency = (settings.transparency === 0 
                || settings.transparency  === '' 
                || typeof settings.transparency === 'undefined')
                ? 0.9 : settings.transparency;
            var opacity = 1 - settings.transparency;
            $('.bg-mask').css('opacity', opacity);
        }

        $('.project-title').css({
            fontSize: (settings.titleFontSize || 28) + 'px',
            fontWeight: settings.titleFontWeight || 'normal'
        });

        if (settings.enableVeriCode === false) {
            $('.login').addClass('no-veri-code')
                .find('.veri-code-line').remove();
        } else {
            $('.refresh-code').on('click', function() {
                that.refreshCode();
            });
            $('.captcha').on('click', function() {
                that.refreshCode();
            });
            that.refreshCode();
        }

        // Set login
        $('.login-btn').button().click(function() {
            $('.tips').html('').removeClass('ui-state-error');
            var uid = $('.uid').val();
            var pwd = $('.pwd').val();
            var code = $('.code').val();
            if (!uid || !pwd) {
                $('.tips').addClass('ui-state-error')
                    .html(locale('nullTips'));
                return;
            }
            if (settings.enableVeriCode !== false && !code) {
                $('.tips').addClass('ui-state-error')
                    .html(locale('inputCodeTips'));
                    return;
            }
            that.doLogin(uid, pwd, code);
        });


        $(window).keyup(function(e) {
            if (e.keyCode === 13) {
                $('.login-btn').focus().click();
            }
        });

        if (settings.noAnimation) {
            if (isSmallScreen) {
                $('.login').css('top','50%');
            } else {
                if (settings.layoutStyle !== 'center') {
                    $('.login-bg').css({
                        width: '38.2%',
                        minWidth: '388px'
                    });
                    $('.login').css('top','50%');
                } else {
                    $('.login-bg').css({
                        height: '61.8%',
                        minHeight: '450px'
                    });
                    $('.login').show();
                }
            }
            return
        }

        // Run animation
        if (!isSmallScreen) {
            if (settings.layoutStyle !== 'center') {
                if (settings.noFrame) {
                    $('.login-bg').css('min-width', '388px');
                    $('.login').animate({top: '50%'}, 500, 'easeOutBounce');
                    return
                }
                $('.login-bg').animate({
                    width: '38.2%'
                }, 300, 'easeOutQuad', function() {
                    $('.login-bg').css('min-width', '388px');
                    $('.login').animate({top: '50%'}, 500, 'easeOutBounce');
                });
            } else {
                if (settings.noFrame) {
                    $('.login-bg').css('min-height', '370px');
                    $('.login').show('drop', 300);
                    return
                }
                $('.login-bg').animate({
                    height: '61.8%'
                }, 500, 'easeOutQuad', function() {
                    $('.login-bg').css('min-height', '370px');
                    $('.login').show('drop', 300);
                });
            }
        } else {
            $('.login').css('top', '80%')
                .animate({
                    top: '50%'
                }, 500, 'easeOutQuint');
        }
    },
    doLogin: function(uid, pwd, code) {
        var that = this;
        var loginURL = window.location.pathname.replace(/\/$/, '');
        $.ajax({
            url:  loginURL + '/do',
            dataType: 'json',
            data: {
                uid: uid,
                pwd: pwd,
                code: code || ''
            },
            type: 'post',
            success: function(result) {
                if (!result.success) {
                    var msg = result.code ? locale(result.code) : result.message;
                    $('.tips').addClass('ui-state-error').html(msg);
                    that.refreshCode();
                } else {

                    var rd = location.search.match(/redirect=([^&]+)/);
                    if (rd) {
                        return location.href = decodeURIComponent(rd[1]);
                    }
                    location.href = '/';
                }
            },
            error: function(e) {
                alert(locale('loginException'));
                console.error(e);
                that.refreshCode();
            }
        });
    },
    refreshCode: function() {
        if (settings.enableVeriCode) {
            $('.captcha').attr('src', '/login/captcha?t=' + new Date().getTime());
        }
    }
};

$(function() {
    loginPage.init();
});