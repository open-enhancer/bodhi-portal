## 登录页配置说明

```javascript
module.exports = {
    layoutStyle: 'left',                        //【可选】布局风格，取值可以是 left, right, center。
    title: '无远统一登录平台',                     //【可选】标题。
    titleFontSize: 26,                          //【可选】标题字体大小。
    titleFontWeight: 400,                       //【可选】标题字体粗细。取值可以是 light、normal、heavy。

    //【可选】logo url，地址可以是 http(s) 开头的绝对 url 地址。也可以是 /public/img 开头的相对地址，
    // 与本项目 /assets/build/img 目录相对应。
    logoUrl: '/public/img/login-logo.png',
    logoHeight: 90,                             //【可选】logo 高度。
    backgroundUrl: '/public/img/login-bg.jpg',  //【可选】背景图片地址。
    transparency: 0.75,                         //【可选】背景透明度。
    userIdInputPlaceholder: '手机号 / ID / 邮箱'  //【可选】登录ID输入框背景提示。
}
```