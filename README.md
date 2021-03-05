# 欢迎使用 Bodhi Portal

## Bodhi Portal 是什么？
Bodhi Portal 是由[杭州无远信息技术有限公司](https://wuyuan.io)负责开发的开源免费企业级门户配置框架，遵循 [MIT 开源协议](https://mit-license.org)。

## Bodhi Portal 能做什么？
- 提供单点登录服务（SSO），让其他子系统无缝接入。子系统可以是由 [无远开发平台](https://wuyuan.io)开发的系统，也可以是其他三方系统。
- 让您的用户在一处登录，便可以独立访问所有接入的子系统。
- 也可以通过统一的门户页面访问并使用各个子系统的功能，并且支持用户个性化展示。
- 一次接入自动适应 PC 端和移动端。
- 使用过程基本只需要做配置，同时也支持二次开发。

## 单点登录基本原理
**核心原理:** **门户网站**和各个**子系统**在相同一级域名下，用户在门户登录成功之后，系统会在浏览器端的 cookie 中设置访问令牌 token，其他各个同域子系统可以拿到此 cookie 令牌，调用门户接口，判断是否登录：

![](//forum-assets.wuyuan.io/4/1329891a-f580-4a6c-9171-adc122d5a00f16149091482600)

## 效果图

### 首页图解

![](//forum-assets.wuyuan.io/4/d639a2f4-f649-4d65-910b-7563cfe5b89416144075104282)

### 首页内访问子系统效果图

![](//forum-assets.wuyuan.io/4/d639a2f4-f649-4d65-910b-7563cfe5b89416144075100560)

![](//forum-assets.wuyuan.io/4/d639a2f4-f649-4d65-910b-7563cfe5b89416144075106113)

### 移动端首页
![](//forum-assets.wuyuan.io/4/d639a2f4-f649-4d65-910b-7563cfe5b89416144075103281)

## 如何使用并部署
- [GNU/Linux/Mac 环境下部署文档](https://wuyuan.io/tutorials-portal)
- [Windows 环境下部署文档](https://wuyuan.io/tutorials-portal)

## 子系统如何接入门户
- [子系统接入文档](https://wuyuan.io/tutorials-portal)

## 配置文件详解

- [config/system.js (系统配置文件)](https://wuyuan.io/tutorials-portal)
- [config/front_home.js (主页前端配置文件)](https://wuyuan.io/tutorials-portal)
- [config/front_login.js (登录页前端配置文件)](https://wuyuan.io/tutorials-portal)
- [config/login.js (自定义登录函数文件)](https://wuyuan.io/tutorials-portal)
- [config/logout.js (自定义登出函数文件)](https://wuyuan.io/tutorials-portal)

# [API](https://wuyuan.io/tutorials-portal)

