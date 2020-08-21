// 自定义菜单
const {url} = require('../config');

module.exports = {
  "button": [
    {
      "type": "view",
      "name": "硅谷电影",
      "url": "https://www.baidu.com/"
    },
    {
      "type": "view",
      "name": "语音识别",
      "url": "https://www.baidu.com/"
    },
    {
      "name": "戳我",
      "sub_button": [
        {
          "type": "view",
          "name": "官网",
          "url": "https://www.baidu.com/"
        },
        {
          "type": "view",
          "name": "帮助",
          "url": "https://www.baidu.com/"
        }
      ]
    }
  ]
}