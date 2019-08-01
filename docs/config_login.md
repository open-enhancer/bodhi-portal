## 自定义登录函数配置说明

#### 此函数仅当 config/system.js 配置文件中的 login.validationMode 设置为 custom 时才有效。

### 函数参数说明
#### request 对象
request 对象是对 nodejs 原生 [Http.IncomingMessage](https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_class_http_incomingmessage) 的扩展。除了拥有 http 请求基本的参数属性之外还有以下常用属性和方法：

- request.query {Object} 本次 http 请求 url 中的参数键值对。比如 `request.query['name'] `可以取到url携带的name参数值。
- request.body {Object} 本次 http 请求消息体键值对内容。其中 request.body.uid 和 request.body.pwd 可以取到本次登录的用户名和密码。
- request.cookies {Object} 本次 http 请求携带的 cookie 键值对。
- request.headers {Object} 本次 http 请求的协议头对象。

详细文档请参考 [request api](http://www.expressjs.com.cn/4x/api.html#req)

#### response
response 对象是对 nodejs 原生 [Http.ServerResponse](https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_class_http_serverresponse) 对象的扩展。除了拥有 http 响应所需的基本方法外还有以下常用方法:

- response.status(code) 设置响应代码，默认 200。
- response.send(text|json) 发送给客户端内容并结束响应。
- response.cookie(name, value) 给客户端设置 cookie。

详细文档请参考 [response api](http://www.expressjs.com.cn/4x/api.html#res)

###【示例】
```javascript
// 数据库服务对象。
var dbService = require('../common/database-service');

// 日志记录对象。
var log4js = require('log4js');
var logger = log4js.getLogger('user');

/**
 * @param req {HttpRequest} 登录请求 Http 对象。
 * @param res {HttpResponse} 登录回应 Http 对象。
 */
module.exports = function(req, res) {
    var userId = req.body.uid;
    var password = req.body.pwd;

    logger.info(userId, ' 尝试登录。');

    var sql = 'SELECT * FROM usertab WHERE id = ? AND password = MD5(?)';
    dbService.execute(sql, [userId, password], function(err, result) {
        if (err) {
            // 记录错误。
            logger.error(err);
            logger.error('uid:', userId);

            res.status(500).send({
                success: false,
                message: '登录异常，原因：' + err.message
            });
            return;
        }
        var u = result.rows[0];
        if (!u) {
            res.send({
                success: false,
                message: '用户名或密码不正确。'
            });
            return;
        }

        if (u.status !== 1) {
            res.send({
                success: false,
                message: '账号已停用，请联系管理员。'
            });
            return;
        }

        // ！非常重要！登录成功后，要为 session 设置 user 对象。
        // 根据业务需要自行决定将哪些属性保留在 session 中。
        req.session.user = {
            id: u.id,
            name: u.nickname,
            roles: u.roles,
            department: u.department,
            // ...
        };
        logger.info(userId, ' 登录成功！');
        res.send({success: true});
    });

}
```