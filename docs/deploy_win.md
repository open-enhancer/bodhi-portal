### Windows 环境下部署

#### 第一步 安装 Node.js 环境
- 从 [Nodejs 官网](https://nodejs.org/en/download/) 下载 For Windows 的 .msi 安装包，按照向导安装到默认路径（修改安装路径可能会造成无法正常运行）。

#### 第二步 下载并安装 [Redis windows 版](https://github.com/MicrosoftArchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.msi)。 [备选下载地址](https://pan.baidu.com/s/1eSLvXwI)
- 安装时，将启动端口设置为 `57192`，安装完毕之后 Redis 会作为服务自动启动在后台。

#### 第三步 第三步 下载源码解压并安装
- 解压下载的zip包。
- 打开 Windows Power Shell（或者 cmd 命令窗口）， 进入`bodhi-portal`根目录。
- 执行指令 `npm install`
<br>如您在国内网络慢可使用国内镜像安装: ``npm install --registry=https://r.cnpmjs.org/``

#### 第四步 配置项目
- 修改 config/system.js 配置文件，完成所有【必需】配置。[参考文档](./config_system.md)
- 修改 config/front_login.js 配置文件，完成所有【必需】配置。[参考文档](./config_front_login.md)
- 其他配置文件根据需要修改，默认可以不改。

#### 第五步 启动项目
- 打开 Windows Power Shell（或者 cmd 命令窗口）， 进入`bodhi-portal`根目录，执行指令：``node ./bin/start``。

【说明】Windows 环境下，启动窗口需要一直存在才能保证应用正常服务。如果希望以 Windows 服务的形式开机启动应用，参考文章：[https://forum.enhancer.io/topic/5b11013535e3f84ea8dd872f](https://forum.enhancer.io/topic/5b11013535e3f84ea8dd872f)

#### 第六步 让子系统按照要求接入门户登录
- 参考[子系统如何接入文档](./how_to_access_portal.md)。

### 其他说明
*如果您的数据库使用的是 oracle*，那么需要在 `bodhi-portal` 目录下执行 `$ npm install oracledb` 以适配，注意该模块的安装依赖 [python2.7](https://www.python.org/downloads/) 和 [Oracle Instant Client](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html)。不同的操作系统下如何正确安装 oracledb NodeJS 驱动模块，请参考[文档](https://github.com/oracle/node-oracledb/blob/master/INSTALL.md#which-instructions-to-follow)。