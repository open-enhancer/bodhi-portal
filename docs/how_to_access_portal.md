# 子系统如何接入门户

不论子系统实现采用何种语言何种框架，都可以通过调用门户 API 来接入，步骤如下：

- 首先，需要确保子系统跟门户系统部署在同一个一级域名下。比如：
  - 门户的访问地址是：http://portal.site.com
  - 子系统的访问地址是：http://app1.site.com

- 其次，在子系统的用户鉴权中间件(拦截器/过滤器)中调用 [/api/isLoggedIn](./api.md) 接口，判断用户是否登录，若未登录，重定向到门户登录页。
- 最后，在子系统的退出动作中调用 [/api/logout](./api.md) 接口。

### 核心原理：用户在门户登录成功之后，系统会在浏览器端的 cookie 中设置访问令牌 access_token，其他各个同域子系统可以拿到此 cookie 令牌，调用门户接口，判断是否登录。

## Enhancer 平台开发应用接入步骤

如果您的系统使用 Enhancer 平台来开发，只需要以下两步即可接入：

- 第一步，在工作台->全局配置->用户登录->单点登录配置中，开启单点登录校验，贴入以下代码并根据实际情况做相关修改：

```javascript
function (enhancer, user, done) {

	// 本系统部署的地址。
	var siteUrl = 'http://app1.site.com'
    // 门户登录地址。
    var loginUrl = 'http://portal.site.com/login'
    // 门户登录内网校验地址。
    var ssoCheckUrl = 'http://xxx.xxx.xxx.xxx/api/isLoggedIn';

    var httpRequest = require('request');
    var logger = enhancer.getLogger();
    var req = enhancer.getContextRequest();
    
    // 从 cookie 中拿到单点登录门户设置的令牌。
    var accessToken = req.cookies.access_token;
    
    // 将门户设置的令牌，发给门户提供的接口做校验。
    httpRequest.post({url: ssoCheckUrl, form: {access_token: accessToken}}, function(err, response) {
         if (err) {
             // 若有系统级错误，将错误对象作为第一个参数，传递给 done 方法，并返回。
             done(err);
             return;
         }
         var result = JSON.parse(response.body);
         if (!result || !result.isLoggedIn) {
             // 若校验不合法，返回重定向登录的地址，并且包含登录成功后返回的跳转地址。
             var url = loginUrl + '?redirect=' + encodeURIComponent(siteUrl);
             done(null, url);
             return;
         }

         var isDataInitialized = user.getVariable('IS_DATA_INITIALIZED');
         // 如果当前用户数据已初始化过，则直接返回 true。
         if (isDataInitialized) {
             done(null, true);
             return;
         }
         
         // 否则，给首次访问本系统的用户注入所需要的账户，角色，以及变量信息。
         // 这些信息可以来自约定的单点登录系统返回的信息，也可以查询数据库或
         // 其他 IO 操作，进一步获取用户相关信息。此处直接赋值示意。
         user.setRoles(['employee']);  			// 用户必须有角色。
         user.setId(result.userInfo.id);  		// 用户必须有 ID。
         user.setName('兰姆达'); 				// 用户必须有名字，显示在登录状态栏。
         user.setVariable('DEPART','总经办'); 	// 其他变量根据需要设置。
         user.setVariable('DEPART_ID', 100); 	// 部门 ID。
         
         // 标记此用户数据已经初始化完成。
         user.setVariable('IS_DATA_INITIALIZED', true); 

         done(null, true);
    });
}
```

- 第二步，在工作台->全局配置->用户登录->单点登录配置中，开启单点登录校验，贴入以下代码并根据实际情况做相关修改：

```javascript
function (enhancer, user) {
	var httpRequest = require('request');
    var logger = enhancer.getLogger();
    var req = enhancer.getContextRequest();
    
    // 从 cookie 中拿到单点登录门户设置的令牌。
    var accessToken = req.cookies.access_token;
 	
 	// 注销用户接口 url。
    var logoutUrl = 'http://xxx.xxx.xxx/api/logout';
    
    httpRequest.post({url: logoutUrl, form: {access_token: accessToken}}, function(err, response) {
         if (err) {
             console.error('Logout failed! Caused by:');
             console(err);
             return;
         }
    });
}

```

