### GNU/Linux/Mac 环境下部署

#### 第一步 安装 Node.js 环境
- 从 [Nodejs 官网](https://nodejs.org/en/download/) 下载的安装包，按照向导或参考网络资料安装。

#### 第二步 安装 Redis 缓存服务
- 执行 ``wget http://download.redis.io/releases/redis-4.0.8.tar.gz`` 下载。[备选下载地址](https://pan.baidu.com/s/1H4upEa8597qTJhqeGxTp0A)
- 执行 ``tar -xzf redis-4.0.8.tar.gz`` 解压。
- 执行 ``cd redis-4.0.8 & make`` 进入解压根目录并且编译。
- 执行 ``./src/redis-server --port 57192``启动 Redis 服务。

#### 第三步 下载源码解压并安装
- 执行 ``unzip bodhi-portal.zip``。
- 执行 ``cd bodhi-portal`` 进入应用根目录
- 执行 ``npm install`` 安装 Node.js 模块依赖。<br>如您在国内网络慢可使用国内镜像安装: ``npm install --registry=https://r.cnpmjs.org/``

#### 第四步 配置项目
- 修改 config/system.js 配置文件，完成所有【必需】配置。[参考文档](./config_system.md)
- 修改 config/front_login.js 配置文件，完成所有【必需】配置。[参考文档](./config_front_login.md)
- 其他配置文件根据需要修改，默认可以不改。

#### 第五步 启动项目
- 在项目根目录执行指令：``./bin/appctl.sh start``。

#### 第六步 让子系统按照要求接入门户登录
- 参考[子系统如何接入文档](./how_to_access_portal.md)。


### 其他说明
*如果您的数据库使用的是 oracle*，那么需要在 `bodhi-portal` 目录下执行 `$ npm install oracledb` 以适配，注意该模块的安装依赖 [python2.7](https://www.python.org/downloads/) 和 [Oracle Instant Client](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html)。不同的操作系统下如何正确安装 oracledb NodeJS 驱动模块，请参考[文档](https://github.com/oracle/node-oracledb/blob/master/INSTALL.md#which-instructions-to-follow)。