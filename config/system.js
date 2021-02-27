module.exports = {
    name: 'XX 统一信息门户',
    firstLevelDomain: 'site.com',
    port: 5300,
    defaultLang: 'zh-cn',
    sessionMaxAge: 30,
    externalUrlBase: '',
    formPayloadLimit: '2mb',
    userFileSizeLimit: '20mb',
    faviconUrl: '/public/img/favicon.ico',
    themeName: 'base',
    database: {
        databaseType: 'mysql',
        host: '127.0.0.1',
        port: '3306',
        database: 'user_center',
        user: 'zyz',
        password: 'passw0rd',
        acquireTimeout: 1000,
        connectionLimit: 100,
        queueLimit: 20
    },
    logger: {
        user: {
            level: 'INFO',
            backups: 7
        },
        app: {
            level: 'ERROR',
            backups: 7
        }
    },
    redis: {
        host: '127.0.0.1',
        port: 57192,
        pass: '',
        db: 1
    },
    login: {
        enableVeriCode: true,
        veriCodeLenth: 3,
        veriCodeComp: 'num',
        colorfulCaptcha: false,
        veriCodeLevel: 1,
        validationMode: 'userTable',
        hashType: 'md5',
        userTable: {
            tableName: 'userinfo',
            idFieldName: 'id',
            nameFieldName: 'nickname',
            passwordFieldName: 'password',
            // roleFieldName: 'roles',
            // statusFieldName: 'status'
        }
    }
};