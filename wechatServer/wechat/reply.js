// 根据用户发送的消息类型和内容返回不同的内容给用户
module.exports = async message => {

  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text'
  }

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
  } else if (message.MsgType === 'image') { // 用户发送图片消息
    options.msgType = 'image';
    options.mediaId = message.MediaId;
    console.log(message.PicUrl);
  } else if (message.MsgType === 'voice') { // 用户发送语音消息
    options.msgType = 'voice';
    options.mediaId = message.MediaId;
    console.log(message.Recognition);
  } else if (message.MsgType === 'location') { // 用户发送地理位置
    content = `纬度：${message.Location_X},经度：${message.Location_Y},地理位置：${message.Label}`;
  } else if (message.MsgType === 'event') { // 事件
    if (message.Event === 'subscribe') { // 用户关注事件
      content = '感谢关注';
      if (message.EventKey) {
        content = '用户扫描带参数二维码进行关注';
      }
    } else if (message.Event === 'unsubscribe') { // 用户取消关注事件
      console.log('用户取消关注');
    } else if (message.Event === 'SCAN') { // 用户已关注再扫描带参数二维码事件
      content = '用户已关注再扫描带参数二维码';
    } else if (message.Event === 'LOCATION') { // 上报地理位置事件
      content = `纬度：${message.Latitude},经度：${message.Longitude},精度：${message.Precision}`;
    } else if (message.Event === 'CLICK') { // 自定义菜单事件
      content = `点击了按钮：${message.EventKey}`;
    }
  }

  options.content = content;
  console.log(options);

  return options;
}