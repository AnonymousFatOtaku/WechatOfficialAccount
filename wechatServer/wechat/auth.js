// 验证服务器有效性的模块
/*
 * 开发者服务器
 *   -验证消息是否来自于微信服务器
 *   -目的：计算得出signature微信加密签名和微信传递过来的signature进行对比，一样的说明消息来自微信服务器，不一样则不是微信服务器发送的消息
 * */

// 引入sha1模块
const sha1 = require('sha1');

// 引入config模块
const config = require('../config');

module.exports = () => {
  return (req, res, next) => {
    // 查看微信服务器提交的参数
    console.log(req.query);
    /*
    * 得到的参数
    * {
    * signature: 'da55dd8e80c434e6c69b974d909c207528d2796f',  -微信的加密签名
    * echostr: '3174235516849615871',  -微信的随机字符串
    * timestamp: '1597891570',  -微信发送请求的时间戳
    * nonce: '481303439'  -微信的随机数字
    * }
    * */
    // 通过对象的解构赋值拿到参数
    const {signature, echostr, timestamp, nonce} = req.query;
    const {token} = config;

    // 1.将参与微信加密签名的三个参数(timestamp、nonce、token)按照字典序排序并组合在一起形成一个数组
    const arr = [timestamp, nonce, token];
    const arrSort = arr.sort(); // 通过sort()进行字典序排序

    // 2.将数组里所有参数拼接成一个字符串进行sha1加密
    const str = arrSort.join('');
    const sha1Str = sha1(str);

    // 3.加密完成就生成了一个signature，然后和微信发送过来的signature进行对比
    if (sha1Str === signature) {
      // 一样则返回echostr给微信服务器
      res.send(echostr);
    } else {
      // 不一样则返回error
      res.end('error');
    }
  }
}