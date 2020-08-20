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

// 引入tools模块
const {getUserDataAsync, parseXMLAsync, formatMessage} = require('../utils/tools');

module.exports = () => {
  return async (req, res, next) => {
    // 查看微信服务器提交的参数
    // console.log(req.query);
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
    // const arr = [timestamp, nonce, token];
    // const arrSort = arr.sort(); // 通过sort()进行字典序排序

    // 2.将数组里所有参数拼接成一个字符串进行sha1加密
    // const str = arrSort.join('');
    const sha1Str = sha1([timestamp, nonce, token].sort().join(''));

    // 3.加密完成就生成了一个signature，然后和微信发送过来的signature进行对比
    /*if (sha1Str === signature) {
      // 一样则返回echostr给微信服务器
      res.send(echostr);
    } else {
      // 不一样则返回error
      res.end('error');
    }*/

    if (req.method === 'GET') {
      if (sha1Str === signature) {
        // 一样则返回echostr给微信服务器
        res.send(echostr);
      } else {
        // 不一样则返回error
        res.end('error');
      }
    } else if (req.method === 'POST') {
      // 微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
      // 验证消息来自于微信服务器
      if (sha1Str !== signature) {
        // 说明消息不是来自微信服务器
        res.end('error');
      }
      // console.log(req.query);
      /*
      * 返回参数
      * {
      * signature: '488839706c5264a88d760ced15a5e7a64dde6501',
      * timestamp: '1597910421',
      * nonce: '1870705358',
      * openid: 'oW3ll5hRFgCOZem3vxiyuc5clW34'  -用户的微信id
      * }
      * */

      // 接收请求体中的数据，流式数据
      const xmlData = await getUserDataAsync(req);
      // console.log(xmlData);
      /*
      * 返回参数
      * <xml><ToUserName><![CDATA[gh_5ff41adc622f]]></ToUserName>  -开发者的id
      * <FromUserName><![CDATA[oW3ll5hRFgCOZem3vxiyuc5clW34]]></FromUserName>  -用户openid
      * <CreateTime>1597912399</CreateTime>  -发送的时间戳
      * <MsgType><![CDATA[text]]></MsgType>  -发送消息类型
      * <Content><![CDATA[233]]></Content>  -消息内容
      * <MsgId>22876603622886845</MsgId>  -消息id，微信服务器默认保存3天内用户发送的数据，3天内能通过此id找到消息数据，3天后被销毁
      * </xml>
      * */

      // 将xml数据解析为js对象
      const jsData = await parseXMLAsync(xmlData);
      // console.log(jsData);

      // 格式化数据
      const message = formatMessage(jsData);
      // console.log(message);

      /*
      * 一旦遇到以下情况微信都会在公众号会话中向用户下发系统提示："该公众号暂时无法提供服务，请稍后再试"
      * 1.开发者在5秒内未回复任何内容
      * 2.开发者回复了异常数据，比如JSON数据、字符串、xml数据中有多余的空格*****等
      * */
      // 简单的自动回复，回复文本内容
      let content = '默认回复';
      // 判断用户发送的消息是否是文本消息
      if (message.MsgType === 'text') {
        // 判断用户发送的消息内容具体是什么
        if (message.Content === '1') { // 全匹配
          content = '1的回复';
        } else if (message.Content === '2') {
          content = '2的回复';
        } else if (message.Content.match('测试')) { // 半匹配
          content = '包含测试的回复';
        }
      }

      // 最终回复用户的消息
      let replyMessage = `<xml>
                            <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                            <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                            <CreateTime>${Date.now()}</CreateTime>
                            <MsgType><![CDATA[text]]></MsgType>
                            <Content><![CDATA[${content}]]></Content>
                          </xml>`;

      // 返回响应给微信服务器
      res.send(replyMessage);

      // 如果开发者服务器没有返回响应给微信服务器，微信服务器会发送三次请求过来
      // res.end('');
    } else {
      res.end('error');
    }
  }
}