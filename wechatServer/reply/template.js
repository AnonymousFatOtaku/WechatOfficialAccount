// 用来加工处理最终回复用户消息的模板(xml数据)
module.exports = options => {

  // 拆分前面重复的部分
  let replyMessage = `<xml>
                        <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
                        <CreateTime>${options.createTime}</CreateTime>
                        <MsgType><![CDATA[${options.msgType}]]></MsgType>`;

  // 不同类型的消息回复不同的内容
  if (options.msgType === 'text') { // 文本
    replyMessage += `<Content><![CDATA[${options.content}]]></Content>`;
  } else if (options.msgType === 'image') { // 图片
    replyMessage += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`;
  } else if (options.msgType === 'voice') { // 语音
    replyMessage += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`;
  } else if (options.msgType === 'video') { // 视频
    replyMessage += `<Video>
                      <MediaId><![CDATA[${options.mediaId}]]></MediaId>
                      <Title><![CDATA[${options.title}]]></Title>
                      <Description><![CDATA[${options.description}]]></Description>
                     </Video>`;
  } else if (options.msgType === 'music') { // 音乐
    replyMessage += `<Music>
                      <Title><![CDATA[${options.title}]]></Title>
                      <Description><![CDATA[${options.description}]]></Description>
                      <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
                      <HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl>
                      <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
                     </Music>`;
  } else if (options.msgType === 'news') { // 图文
    replyMessage += `<ArticleCount>${options.content.length}</ArticleCount>
                     <Articles>`;
    options.content.forEach(item => { // 可能有多条，数量不固定
      replyMessage += `<item>
                        <Title><![CDATA[${item.title}]]></Title>
                        <Description><![CDATA[${item.description}]]></Description>
                        <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
                        <Url><![CDATA[${item.url}]]></Url>
                       </item>`
    })
    replyMessage += `</Articles>`;
  }

  // 拆分结尾重复部分
  replyMessage += '</xml>';

  // 最终回复给用户的xml数据
  return replyMessage;
}