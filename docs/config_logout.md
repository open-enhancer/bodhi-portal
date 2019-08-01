## 自定义登出函数说明

【示例】
```javascript
// 日志记录对象。
var log4js = require('log4js');
var logger = log4js.getLogger('user');

/**
 * @param req {HttpRequest} 登录请求 Http 对象。
 */
function(req) {
    logger.info(req.session.user.id, '登出系统。');
}
```