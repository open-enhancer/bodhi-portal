## 主页前端配置说明

```javascript
module.exports = {
    /* 顶部配置 */
    header: {
        height: 48,                                 //【可选】顶部高度，默认 48。
        logoHeight: 36,                             //【可选】logo 高度，默认 36。

        //【可选】logo url，地址可以是 http(s) 开头的绝对 url 地址。也可以是 /public/img 开头的相对地址，
        // 与本项目 /assets/build/img 目录相对应。
        logoUrl: '/public/img/home-logo.png', 

        fontSize: 16,                               //【可选】字体大小，默认 16。
        title: '无远综合信息管理平台',                 //【可选】标题。
        fontWeight: 400,                            //【可选】字体粗细取值可以是 light、normal、heavy。
        themeSelector: true,                        //【可选】允许切换主题皮肤，默认 true。

        //【可选】样式名，取值可以是 ui-state-default、ui-state-hover、ui-state-active、ui-state-higlight、
        // ui-widget-content、ui-widget-header 或者自定义样式名。参考内置样式使用说明：
        // https://assets.enhancer.io/enhancer/tutorials/1.0.0/zh-cn/css.html
        class: 'ui-widget-content',

        //【可选】用户附加展示信息模板，显示在用户信息右侧。使用 {字段名} 来取用登录用户的属性字段（用户表中的字段
        // 或是自定义登录校验时指定给 req.session.user 对象的字段。）
        userAdditionalInfo: '角色:{roles} | 部门: {department}'
    },

    /* 工具栏配置 */
    toolbar: {
        /*【可选】工具栏按钮，可配置 0 个或多个。*/
        buttons: [{
            //【必需】按钮图标，可以设置为 fontawesome 任意图标。可选图标地址：
            // https://assets.enhancer.io/common-template/tool/all/fontawesome.html
            icon: 'far fa-bell',

            title: '通知',           //【可选】按钮提示。
            hiddenOnMobile: false,  //【可选】是否在移动端隐藏，默认 false。
            hiddenOnPC: false,      //【可选】是否在 PC 端隐藏，默认 false。

            //【必需】按钮动作 url，用户点击之后会打开此链接对应的页面，需要确保此页面是已接入门户登录认证，并且
            // 是可访问的。
            actionUrl: 'https://app1.site.com/page/1'
        }, {
            // ... 
        }]
    },

    /* 应用入口配置 */
    apps: {
        //【可选】是否启用个性化过滤，取值可以是 false、true 或字段名比如 'my_apps'，默认为 false。
        // 若设置为 true 或指定过滤字段名，则当前登录用户只能看到自己所拥有的应用入口，此时用户的 apps
        // 字段或者指定字段（定义在用户表中或者自定义登录时设置给 req.session.user 对象）值需要包含可
        // 访问的应用 ID，多个应用逗号分隔如：'app1,app2,app3'。
        personalizedFilter: false,

        //【可选】样式名，取值可以是 ui-state-default、ui-state-hover、ui-state-active、ui-state-higlight、
        // ui-widget-content、ui-widget-header 或者自定义样式名。参考内置样式使用说明：
        // https://assets.enhancer.io/enhancer/tutorials/1.0.0/zh-cn/css.html
        class: 'ui-state-default',

        position: 'left',                         //【可选】位置，left、right、top，默认 left。移动端无效。
        title: '我的应用',                         //【可选】标题。
        titleFontSize: 18,                        //【可选】标题字体大小，默认 18。
        width: 310,                               //【可选】宽度，可设数字或者百分比，默认 310。移动端无效。
        listStyle: 'block',                       //【可选】列表风格，可以是 block, list。默认 block。
        fontSize: 14,                             //【可选】应用字体大小，默认 14。
        appHeight: 72,                            //【可选】应用高度，默认 72。
        appSpacing: 8,                            //【可选】应用间距，默认 8。

        //【可选】应用入口列表，可配置 0 个或多个应用，如果为 0 则页面上不会展示整个应用入口模块。
        list: [{
            id: 'app2',                           //【必需】应用 ID 号，只能由数字，字母和下划线或中划线组成。
            name: '财务',                          //【必需】应用名。
            title: '财务管理系统',                  //【可选】标题。
            icon: 'fas fa-dollar-sign',           //【可选】应用图标。可选图标地址：https://assets.enhancer.io/common-template/tool/all/fontawesome.html
            img: '',                              //【可选】背景图片地址，若配置，则不会显示图标。
            url: 'http://app1.site.com',          //【必需】应用地址 URL。 
            openMode: 'imbedded',                 //【可选】打开方式取值：imbedded(嵌入门户)、internal(外部打开)。
            class: 'ui-widget-content',           //【可选】样式名。
            hiddenOnMobile: false,                //【可选】是否在移动端隐藏，默认 false。
            hiddenOnPC: false                     //【可选】是否在 PC 端隐藏，默认 false。
        }, {
            // ...
        }]
    },

    /* 模块配置 */
    modules: {
        //【可选】是否启用个性化过滤，取值可以是 false、true 或字段名比如 'my_modules'，默认为 false。
        // 若设置为 true 或指定过滤字段名，则当前登录用户只能看到自己所拥有的应用入口，此时用户的 apps
        // 字段或者指定字段（定义在用户表中或者自定义登录时设置给 req.session.user 对象）值需要包含可
        // 访问的模块 ID，多个应用逗号分隔如：'mod-1,mod-2,mod-3'。
        personalizedFilter: false,
        moduleHeight: 320,                       //【可选】统一模块高度，默认 320。
        moduleSpacing: 6,                        //【可选】模块间距，默认 6。 

        //【可选】模块列表，可以配置 0 个或多个模块，如果为 0 则页面上不会展示整个模块区域。
        list: [{
            id: 'mod-1',                         //【必须】模块 ID，只能由数字，字母和下划线或中划线组成。
            name: '新闻公告',                     //【可选】模块名称。
            height: 360,                         //【可选】模块高度，设置后会覆盖统一高度。
            width: 'calc(50% - 12px)',           //【可选】模块宽度，默认为 100%。
            hiddenOnMobile: false,               //【可选】是否在移动端隐藏，默认 false。
            hiddenOnPC: false,                   //【可选】是否在 PC 端隐藏，默认 false。

            //【必需】模块地址。需要确保此页面是已接入门户登录认证，并且是可访问的。
            url: 'http://app1.site.com/standalone/page/103'
        }, {
            // ...
        }]
    },
    /* 底部配置 */
    bottom: {
        height: 20,                         //【可选】高度，默认 20。
        fontSize: 12,                       //【可选】字体大小，默认 12。
        text: '©2019 杭州无远信息技术有限公司', //【可选】文案描述。
        textAlign: 'center'                 //【可选】文案位置，可以是 left, center 或 right，默认 center。
    }
};
```