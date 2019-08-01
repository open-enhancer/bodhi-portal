# 欢迎使用 Bodhi Portal

## Bodhi Portal 是什么？
Bodhi Portal 是由杭州无远信息技术有限公司负责开发的开源免费企业级门户配置框架，遵循 [MIT 开源协议](https://mit-license.org)。

## Bodhi Portal 能做什么？
- 提供单点登录服务（SSO），让其他子系统无缝接入。子系统可以是由 Enhancer 平台开发的系统，也可以是其他三方系统。
- 让您的用户在一处登录，便可以独立访问所有接入的子系统。
- 也可以通过统一的门户页面访问并使用各个子系统的功能，并且支持用户个性化展示。
- 一次接入自动适应 PC 端和移动端。
- 使用过程基本只需要做配置，同时也支持二次开发。

### 效果图

- 首页图解
![](https://forum-assets.enhancer.io/00/portal-4.png?t=123)

- 首页内访问子系统效果图
![](https://forum-assets.enhancer.io/00/portal-1.png)

- 移动端首页
![](https://forum-assets.enhancer.io/00/portal-3.png?t=123)

## 如何使用并部署
- [GNU/Linux/Mac 环境下部署文档](./docs/deploy_gnu.md)
- [Windows 环境下部署文档](./docs/deploy_win.md)

## 子系统如何接入门户
- [子系统接入文档](./docs/how_to_access_portal.md)

## 配置文件详解

- [config/system.js (系统配置文件)](./docs/config_system.md)
- [config/front_home.js (主页前端配置文件)](./docs/config_front_home.md)
- [config/front_login.js (登录页前端配置文件)](./docs/config_front_login.md)
- [config/login.js (自定义登录函数文件)](./docs/config_login.md)
- [config/logout.js (自定义登出函数文件)](./docs/config_logout.md)

# [API](./docs/api.md)



