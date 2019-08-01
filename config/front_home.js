module.exports = {
    header: {
        height: 48,
        logoHeight: 36,
        logoUrl: '/public/img/home-logo.png',
        fontSize: 18,
        title: 'XXXXX',
        fontWeight: 400,
        themeSelector: true,
        class: 'ui-widget-content',
        userAdditionalInfo: '角色: {roles}'
    },
    toolbar: {
        buttons: [{
            icon: 'far fa-bell',
            title: '通知',
            actionUrl: 'http://app2.site.com/standalone/page/101'
        }, {
            icon: 'far fa-sun',
            title: '个人设置',
            hiddenOnMobile: true,
            actionUrl: 'http://app1.site.com/standalone/page/101'
        }]
    },
    apps: {
        personalizedFilter: false,
        class: 'ui-state-default',
        position: 'left',
        title: '我的应用',
        titleFontSize: 18,
        width: 310,
        listStyle: 'block',
        fontSize: 14,
        appHeight: 72,
        appSpacing: 8,
        list: [{
            id: 'app1',
            name: '报销',
            title: '无现金报销系统',
            icon: 'fab fa-amazon-pay',
            url: 'http://app1.site.com',
            openMode: 'imbedded',
            hiddenOnMobile: true,
            hiddenOnPC: false,
            class: 'ui-state-highlight'
        }, {
            id: 'app2',
            name: '财务',
            title: '财务管理系统',
            img: '',
            icon: 'fas fa-dollar-sign',
            url: 'http://app2.site.com',
            openMode: 'imbedded',
            class: 'ui-widget-content'
        }, {
            id: 'app3',
            name: 'xxx',
            title: 'xxx / xxx / xxx',
            img: '/public/img/home-logo.png',
            url: 'http://app3.site.com',
            openMode: 'imbedded',
            class: 'ui-widget-content'
        }]
    },
    modules: {
        personalizedFilter: false,
        moduleHeight: 320,
        moduleSpacing: 6,
        list: [{
            id: 'mod-1',
            name: '新闻公告',
            height: 360,
            width: 'calc(50% - 12px)',
            url: 'http://app1.site.com/standalone/page/103'
        }, {
            height: 360,
            width: '50%',
            id: 'mod-2',
            name: '图片新闻',
            url: 'http://app2.site.com/standalone/page/104'
        }, {
            id: 'mod-3',
            name: '我的日程',
            height: 500,
            url: 'http://app3.site.com/standalone/page/102',
            hiddenOnMobile: true
        }]
    },
    bottom: {
        height: 20,
        fontSize: 12,
        text: '©2019 xxxx',
        textAlign: 'center'
    }
};