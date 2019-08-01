require('./index.less');
var locale = require('./i18n');
var tpl = require('./index.html');
var contentHeight = 'calc(100% - ' + (parseInt(pageConf.header.height) + parseInt(pageConf.bottom.height)) + 'px)';
var themeSelector = require('../../common/theme-selector');
var toolManager = require('./tool-manager');
var isSmallScreen = $('body').width() < 720;

function appendContext(url, context) {
    if (!url || typeof url !== 'string') {
        return url;
    }
    context = 'imbedded_in_bodhi_portal=true&' + (context || '');
    var hash = (url.match(/\#[^\#]+$/) || '') + '';
    var query = (url.split(/\?/)[1] || '').replace(/\#[^\#]+$/, '');
    query += (query ? '&' : '') + context;
    return url.split(/\?/)[0].replace(/\#[^\#]+$/, '') + '?' + query + hash;
}

function viewApp(appId, name, url) {
    $('.portal-content').hide();
    $('.app-view').hide();
    $('.app-container').show();
    $('.portal-app-tabs li').removeClass('selected ui-widget-content')
        .addClass('ui-state-default');
    $('.portal-home-button').addClass('ui-state-default').removeClass('ui-widget-content');

    if (isSmallScreen) {
        // show app title on top.
        $('.portal-title').hide();
        $('.portal-curr-app-title').show();
        $('.portal-curr-app-name').text(name);
        $('.portal-bottom').hide();
        $('.portal-header').hide('blind');
        $('.portal-header-handle').addClass('folded').show();
    }

    var $view = $('#app-view-' + appId);
    if ($view.length) {
        $view.show();
        $('.portal-app-tabs li[app-id=' + appId + ']')
            .removeClass('ui-state-default')
            .addClass('ui-widget-content selected');
        return;
    }
    $('<li>').attr('app-id', appId)
        .attr('app-url', url)
        .append(name)
        .addClass('ui-widget-content selected')
        .append('<i class="fa fa-times"></i>')
        .prepend('<i class="fa fa-redo"></i>')
        .prependTo($('.portal-app-tabs'));
    $('<iframe>').addClass('app-view')
        .attr('id', 'app-view-' + appId)
        .attr('src', url)
        .appendTo($('.app-container'));

    
}

function showPortal() {
    $('.app-container').hide();
    $('.portal-curr-app-title').hide();
    $('.portal-app-tabs li').removeClass('selected ui-widget-content').addClass('ui-state-default');
    $('.portal-content').show();
    $('.portal-title').show();
    $('.portal-bottom').show();
    $('.portal-header-handle').hide();
    $('.portal-home-button').removeClass('ui-state-default').addClass('ui-widget-content');
}

pageConf.apps.list = pageConf.apps.list || [];
pageConf.modules.list = pageConf.modules.list || [];
pageConf.toolbar.buttons = pageConf.toolbar.buttons || [];

// Remove hidden apps, modules and tool buttons.
pageConf.apps.list = pageConf.apps.list.filter(function(a) {
    // Filter by user personal apps.
    if (pageConf.apps.personalizedFilter) {
        var key = typeof pageConf.apps.personalizedFilter === 'string' 
                ? pageConf.apps.personalizedFilter
                : 'apps';
        var userApps = userInfo[key] || '';
        if (userApps.indexOf(a.id) == -1) {
            return false;
        }
    }
    return isSmallScreen ? !a.hiddenOnMobile : !a.hiddenOnPC;
});

pageConf.modules.list = pageConf.modules.list.filter(function(m) {
    // Filter by user personal modules.
    if (pageConf.modules.personalizedFilter) {
        var key = typeof pageConf.modules.personalizedFilter === 'string' 
                ? pageConf.modules.personalizedFilter
                : 'modules';
        var userModules = userInfo[key] || '';
        if (userModules.indexOf(m.id) == -1) {
            return false;
        }
    }
    return isSmallScreen ? !m.hiddenOnMobile : !m.hiddenOnPC;
});

pageConf.toolbar.buttons = pageConf.toolbar.buttons.filter(function(b) {
    return isSmallScreen ? !b.hiddenOnMobile : !b.hiddenOnPC;
});


// Append url context
pageConf.apps.list = pageConf.apps.list.map(function(a) {
    if (a.openMode !== 'external') {
        a.url = appendContext(a.url, 'imbedded_type=app');
    }
    return a;
});

pageConf.modules.list = pageConf.modules.list.map(function(m) {
    m.url = appendContext(m.url, 'imbedded_type=module');
    if (typeof m.height === 'number' || /^\d+$/.test(m.height)) {
        m.height = m.height + 'px';
    }
    if (typeof m.width === 'number' || /^\d+$/.test(m.width)) {
        m.width = m.width + 'px';
    }
    return m;
});

pageConf.toolbar.buttons = pageConf.toolbar.buttons.map(function(b) {
    b.actionUrl = appendContext(b.actionUrl, 'imbedded_type=tool');
    return b;
});


// Prepare style sheet.
var style = `<style>
    .portal-header {
        font-size: ${pageConf.header.fontSize}px;
        font-weight: ${pageConf.header.fontWeight};
        height: ${pageConf.header.height}px;
        line-height: ${parseInt(pageConf.header.height) - 1}px;
    }
    .portal-app-tabs li {
        line-height: ${parseInt(pageConf.header.height)*(parseInt(pageConf.header.height) >= 32 ? 0.6 : 0.9) - 2}px;
        height: ${parseInt(pageConf.header.height) > 32 ? '60%' : '90%'};
        top: ${parseInt(pageConf.header.height) > 32 ? '40%' : '10%'};
    }
    .portal-logo {
        height: ${pageConf.header.logoHeight}px;
        margin-top: ${(parseInt(pageConf.header.height) - parseInt(pageConf.header.logoHeight) - 1) / 2}px;
    }
    .portal-apps {
        float: ${pageConf.apps.position || 'left'};
        margin-${pageConf.apps.position || 'left'}: 12px;
        font-size: ${pageConf.apps.fontSize}px;
    }
    .portal-apps-title {
        font-size: ${pageConf.apps.titleFontSize}px;
    }
    .portal-app {
        width: ${pageConf.apps.listStyle === 'block' ? pageConf.apps.appHeight + 'px' : '100%' };
        margin-bottom: ${parseFloat(pageConf.apps.appSpacing)/2}px;
        margin-top: ${parseFloat(pageConf.apps.appSpacing)/2}px;
        margin-right: ${pageConf.apps.listStyle === 'block' ? parseFloat(pageConf.apps.appSpacing)/2 : 0}px;
        margin-left: ${pageConf.apps.listStyle === 'block' ? parseFloat(pageConf.apps.appSpacing)/2 : 0}px;
    }
    .portal-apps-container.list .portal-app-des {
        width: calc(100% - ${parseFloat(pageConf.apps.appHeight) + 6}px);
    }
    .portal-app-icon {
        width: ${pageConf.apps.appHeight}px;
        height: ${pageConf.apps.appHeight}px;
    }
    .portal-app-icon i {
        font-size: ${parseFloat(pageConf.apps.appHeight) / 2}px;
        display: inline-block;
        line-height: ${parseFloat(pageConf.apps.appHeight)  - 12}px;
    }
    .portal-app-name {

    }
    .portal-app-title {

    }
    .portal-modules {
        float: ${pageConf.apps.position === 'right' ? 'right' : 'left'};
    }
    .portal-module {
        height: ${pageConf.modules.moduleHeight}px;
        margin-bottom: ${pageConf.modules.moduleSpacing}px;
    }
    
    .portal-bottom {
        font-size: ${pageConf.bottom.fontSize}px;
        height: ${pageConf.bottom.height}px;
        text-align: ${pageConf.bottom.textAlign};
    }`;

if (!isSmallScreen) {
    style += `
    .portal-content {
        height: calc(100% - ${parseInt(pageConf.header.height) + parseInt(pageConf.bottom.height)}px);
    }
    .portal-apps {
        width: ${(!pageConf.modules.list.length || pageConf.apps.position === 'top') ? 'calc(100% - 24px)'
                : (/%$/.test(pageConf.apps.width) ? 'calc(' + pageConf.apps.width + ' - 12px)' 
                                            : (parseFloat(pageConf.apps.width - 12) + 'px'))
        };
        ${pageConf.apps.position === 'top' ? 'height: auto;' : ''}
    }
    .portal-modules {
        width: calc(100% - 
            ${(!pageConf.apps.list.length ||  pageConf.apps.position === 'top') ? '0px'
                : (/%$/.test(pageConf.apps.width) ? pageConf.apps.width : (pageConf.apps.width + 'px'))
            });
        ${pageConf.apps.position === 'top' ? 'height: auto;' : ''}
    }
    .app-container {
        height: calc(100% - ${parseInt(pageConf.header.height) +  parseInt(pageConf.bottom.height)}px);
    }
    `;
}

style += `</style>`;

$('head').append(style);



if (typeof pageConf.header.userAdditionalInfo === 'string') {
    userInfo.additional = pageConf.header.userAdditionalInfo.replace(/\{(\w+)\}/g, function(s, $1) {
        return userInfo[$1];
    })
}

var data = pageConf;
data.userInfo = userInfo;
if (isSmallScreen) {
    data.apps.listStyle = 'block';
}
data.isSmallScreen = isSmallScreen;
data.locale = locale();

$('body').html(tpl(data));

$('body').tooltip({
    show: {effect: 'swing', duration: 300},
});


$('.portal-header-handle').on('click', function() {
   if ($(this).hasClass('folded')) {
        $('.portal-header').show('blind');
        $(this).removeClass('folded');
   } else {
        $('.portal-header').hide('blind');
        $(this).addClass('folded');
   }
});
// go home
$('.portal-title,.portal-logo').on('click', function() {
    showPortal();
});

// theme switch
$('.portal-theme-switch').on('click', function() {
    themeSelector.open();
});

// view app
$('.portal-app').on('click', function(e) {
    var appId = $(this).attr('app-id');
    var name = $(this).find(' .portal-app-name').text(); 
    var url = $(this).attr('app-url');
    var mode =$(this).attr('mode');
    if (mode === 'external') {
        window.open(url, appId);
        return
    }
    viewApp(appId, name, url);
});

$('.portal-app-tabs').on('click', 'li', function(e) {
    if ($(this).hasClass('selected')) {
        return;
    }
    var appId = $(this).attr('app-id');
    var name = $(this).text(); 
    var url = $(this).attr('app-url');
    viewApp(appId, name, url);
});


// sortable ta
$('.portal-app-tabs').sortable();

// close app 
$('.portal-app-tabs').on('click', '.fa-times', function(e) {
    e.stopPropagation();
    var appId = $(this).parent().attr('app-id');
    $('#app-view-' + appId).remove();
    $(this).parent().remove();
    var $first = $('.portal-app-tabs li:first');
    if ($first.length) {
        $first.click();
        return
    }
    showPortal();
});
// reload app
$('.portal-app-tabs').on('click', '.fa-redo', function(e) {
    e.stopPropagation();
    var appId = $(this).parent().attr('app-id');
    var url = $(this).parent().attr('app-url');
    $('#app-view-' + appId).remove();
    $('<iframe>').addClass('app-view')
        .attr('id', 'app-view-' + appId)
        .attr('src', url)
        .appendTo($('.app-container'));
});

// home
$('.portal-curr-app-title i.fa-home').on('click', function(e) {
    showPortal();
});

$('.portal-logout').on('click', function(e) {
    $.post('/logout')
        .done(function(result) {
            window.location.href = '/login';
        })
        .error(function(err) {
            alert(locale('logoutFailedMsg'));
            console.error(err);
        });
});

// action url
$('body').on('click', '[action-url]', function() {
    var url = $(this).attr('action-url');
    if (!url) {
        return;
    }
    toolManager.open(url);
});


