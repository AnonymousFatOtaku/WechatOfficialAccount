// 引入express模块
const express = require('express');

// 创建app应用对象
const app = express();

// 引入auth模块
const auth = require('./wechat/auth');

/*
* 微信服务器需要知道开发者服务器是哪个
*  -测试号管理页面上填写url开发者服务器地址
*    -使用ngrok 内网穿透 将本地端口号开起的服务映射成外网跨域访问的一个网址
*    -ngrok http 3000
*  -填写token
*    -参与微信签名加密的一个参数
* */
// 验证服务器有效性，通过use接受处理所有消息
app.use(auth());

// 监听端口号
app.listen(3000, () => console.log('服务器启动成功'));