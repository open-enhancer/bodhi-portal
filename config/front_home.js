module.exports = {
    header: {
        height: 48,
        logoHeight: 36,
        logoUrl: '/public/img/home-logo.png',
        fontSize: 18,
        title: 'XX 统一信息门户',
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
        class: 'ui-widget-content',
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
            icon: 'fab fa-bitcoin',
            url: 'http://app1.site.com',
            openMode: 'imbedded',
            hiddenOnMobile: true,
            hiddenOnPC: false,
            class: 'ui-state-active'
        }, {
            id: 'app2',
            name: '财务',
            title: '财务管理系统',
            img: '',
            icon: 'fas fa-dollar-sign',
            url: 'http://app2.site.com',
            openMode: 'imbedded',
            class: 'ui-state-default'
        }, {
            id: 'app3',
            name: '请假',
            title: 'xxx / xxx / xxx',
            icon: 'far fa-calendar-plus',
            url: 'http://app3.site.com',
            openMode: 'imbedded',
            class: 'ui-widget-content'
        }, {
            id: 'app4',
            name: '会议室预定',
            title: 'xxx / xxx / xxx',
            icon: 'far fa-calendar-check',
            url: 'http://app4.site.com',
            openMode: 'imbedded',
            class: 'ui-state-default'
        }, {
            id: 'app5',
            name: '待办事项',
            title: 'xxx / xxx / xxx',
            icon: 'fas fa-tasks',
            url: 'http://app5.site.com',
            openMode: 'imbedded',
            class: 'ui-state-hover'
        }, {
            id: 'app6',
            name: '体检预约',
            title: 'xxx / xxx / xxx',
            icon: 'fab fa-medrt',
            url: 'http://app6.site.com',
            openMode: 'imbedded',
            class: 'ui-state-default'
        }, {
            id: 'app7',
            name: '观星',
            title: 'xxx / xxx / xxx',
            icon: 'far fa-chart-bar',
            url: 'http://app7.site.com',
            openMode: 'imbedded',
            class: 'ui-state-default'
        }, {
            id: 'app8',
            name: '出差',
            title: 'xxx / xxx / xxx',
            icon: 'fas fa-plane-departure',
            url: 'http://app8.site.com',
            openMode: 'imbedded',
            class: 'ui-state-default'
        }, {
            id: 'app9',
            name: '客户关系',
            title: 'xxx / xxx / xxx',
            icon: 'fas fa-users',
            url: 'http://app9.site.com',
            openMode: 'imbedded',
            class: 'ui-state-default'
        }, {
            id: 'app10',
            name: '目标管理',
            title: 'xxx / xxx / xxx',
            img: '/public/img/goal.jpeg',
            url: 'http://app10.site.com',
            openMode: 'imbedded',
            class: 'ui-widget-content'
        }, {
            id: 'app11',
            name: '知行合一',
            title: 'xxx / xxx / xxx',
            icon: 'far fa-compass',
            url: 'http://app11.site.com',
            openMode: 'imbedded',
            class: 'ui-state-highlight'
        }, {
            id: 'app12',
            name: '社区',
            title: 'xxx / xxx / xxx',
            icon: 'fa fa-comments',
            url: 'http://app12.site.com',
            openMode: 'imbedded',
            class: 'ui-state-error'
        }, {
            id: 'app13',
            name: '邮件',
            title: 'xxx / xxx / xxx',
            icon: 'far fa-envelope',
            url: 'http://app13.site.com',
            openMode: 'imbedded',
            class: 'ui-state-hover'
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
            width: 'calc(50% - 6px)',
            url: 'http://app1.site.com/standalone/page/103'
        }, {
            height: 360,
            width: '50%',
            id: 'mod-2',
            name: '图片新闻',
            url: 'http://app1.site.com/standalone/page/102',
            style: 'margin-right:0',
            hiddenOnMobile: true
        }, {
            id: 'mod-3',
            name: '我的日程',
            height: 500,
            url: 'http://app2.site.com/standalone/page/101',
            hiddenOnMobile: false
        }]
    },
    bottom: {
        height: 20,
        fontSize: 12,
        text: '©2016 - 2021 xx技术有限公司',
        textAlign: 'center'
    }
};