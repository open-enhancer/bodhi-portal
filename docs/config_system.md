## 系统配置文件说明

此文件负责配置系统运行的基本信息、数据库连接、登录模式、日志设置以及 Redis(session 缓存)设置。

```javascript
module.exports = {
    /* 基础配置 */
    firstLevelDomain: 'site.com',   //【必需】本门户系统部署所在的一级域名。如果没有域名，则填写 IP 地址。
    port: 5300,                     //【必需】系统启动端口。
    name: '无远门户系统',             //【可选】系统名。
    defaultLang: 'zh-cn',           //【可选】默认语言，值可以是 zh-cn 和 en，默认 zh-cn
    sessionMaxAge: 30,              //【可选】用户会话最大时长，单位分钟，默认 30
    externalUrlBase: '',            //【可选】用户访问本门户时在浏览器输入的根地址，默认可不填写。
    formPayloadLimit: '1mb',        //【可选】表单上传最大大小，默认 1mb，单位可以是 mb, kb, gb。
    userFileSizeLimit: '20mb',      //【可选】最大文件上传大小，默认 20mb，单位可以是 mb, kb, gb。

    //【可选】网站图标地址，显示在浏览器选项卡左侧。地址可以是 http 开头的绝对 url 地址。也可以是
    //  /public/img 开头的相对地址，与本项目 /assets/build/img 目录相对应。必需是 .ico 格式！
    faviconUrl: '/public/img/favicon.ico', 
    
    //【可选】默认皮肤，可以设置为 本项目/assets/build/lib/jquery/ui/1.12.1/themes 目录下的任意主题名。
    themeName: 'base', 
    
    /* 数据库配置 */
    database: {
        databaseType: 'mysql',      //【必需】数据库类型，可以是 mysql, oracle 或者 mssql。
        host: '127.0.0.1',          //【必需】数据库主机地址。
        port: '3306',               //【必需】端口。
        database: 'user_center',    //【必需】数据库名或实例名。
        user: 'zyz',                //【必需】用户名。
        password: 'passw0rd',       //【必需】密码。
        acquireTimeout: 1000,       //【可选】请求连接最大等待时间，单位毫秒，默认 1000。
        connectionLimit: 100,       //【可选】连接池最大连接数，默认 100。
        queueLimit: 20,             //【可选】等待队列最大长度，默认 20。
        timezone: '+8:00',          //【可选】时区设置，仅对 mysql 有效，默认不填。
        encrypt: false              //【可选】是否加密连接，仅对 mssql 有效， 默认 false。
    },

    /* 登录配置 */
    login: {
        enableVeriCode: true,       //【可选】是否启用验证码，默认 true。
        veriCodeLenth: 3,           //【可选】验证码长度。
        veriCodeComp: 'num',        //【可选】验证码组成，取值： num 纯数字，numAndLet 数字和字母。
        colorfulCaptcha: false,     //【可选】是否使用彩色验证码。
        veriCodeLevel: 1,           //【可选】验证码识别难度，1 - 3 数字越大越难。

        //【必需】登录校验模式，当值设置为 custom 表示自定义校验，此时需要完成自定义校验函数：config/login.js; 
        // 当值设置为 userTable 表示使用指定用户表的方式来验证，则需要完成下面关于用户表的配置。
        validationMode: 'userTable', 

        hashType: '', //【可选】密码哈希方式，可以是： md5, sha1, sha256, sha512, rmd160 或不填表示无哈希。
        userTable: {
            tableName: 'userinfo',          //【必需】 用户表名。
            idFieldName: 'id',              //【必需】用户 ID 字段名。
            nameFieldName: 'nickname',      //【必需】用户名字段名。
            passwordFieldName: 'password',  //【必需】密码字段名。
            roleFieldName: 'roles',         //【可选】角色字段名，没有可为空。
            statusFieldName: 'status'       //【可选】账号状态字段名。设置后，登录时会检查用户的该字段值是否为 1。
        }
    },

    /* 日志配置 */
    logger: {
        /* 用户日志，负责记录用户的登录和登出操作，位于 logs/user.log */
        user: {
            level: 'INFO',                  //【必需】日志输出级别：DEBUG, INFO, WARN, ERROR，默认 INFO。
            backups: 7                      //【必需】备份天数，默认 7 天。
        },
        /* 应用日志，位于 logs/app.log */
        app: {
            level: 'ERROR',                 //【必需】日志输出级别：DEBUG, INFO, WARN, ERROR，默认 INFO。
            backups: 7                      //【必需】备份天数，默认 7 天。
        }
    },
    /* Redis 缓存配置 */
    redis: {
        host: '127.0.0.1',                  //【必需】redis 主机地址。
        port: 57192,                        //【必需】端口。
        pass: '',                           //【可选】密码。
        db: 0                               //【可选】数据库号，值为 0 ~ 15，默认 0。
    }
};

```