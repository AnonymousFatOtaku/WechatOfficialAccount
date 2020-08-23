// 获取accessToken：微信调用接口全局唯一凭据，有效期为2小时，建议提前5分钟请求，每天最多2000次

// 只需要引入request-promise-native，第三方模块在上自定义模块在下
const rp = require('request-promise-native');
// 引入config模块
const {appID, appsecret} = require('../config');
// 引入menu模块
const menu = require('./menu');
// 引入api模块
const api = require('../utils/api');
// 引入tools函数
const {writeFileAsync, readFileAsync} = require('../utils/tools');

// 定义Wechat类用来获取access_token
class Wechat {
  constructor() {
  }

  // 获取access_token
  getAccessToken() {
    // 定义请求的地址
    const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`;

    // 发送请求，需使用request和request-promise-native这两个库，返回值是一个promise对象
    return new Promise((resolve, reject) => {
      rp({method: 'GET', url, json: true})
        .then(res => {
          // console.log(res);
          // 设置access_token的过期时间
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
          // 将promise对象状态改成成功的状态
          resolve(res);
        })
        .catch(err => {
          // console.log(err);
          // 将promise对象状态改成失败的状态
          reject('getAccessToken方法出了问题：' + err);
        })
    })
  }

  // 用来保存access_token的方法，accessToken为要保存的凭据
  saveAccessToken(accessToken) {
    return writeFileAsync(accessToken, 'access_token.txt');
  }

  // 用来读取access_token的方法
  readAccessToken() {
    return readFileAsync('access_token.txt');
  }

  // 用来检测access_token是否有效
  isValidAccessToken(data) {
    // 检测传入的参数是否是有效的
    if (!data && !data.access_token && !data.expires_in) {
      // 代表access_token无效
      return false;
    }
    return data.expires_in > Date.now();
  }

  // 用来获取没有过期的access_token
  fetchAccessToken() {
    // 之前保存过access_token并且它是有效的则直接使用
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    // 是fetchAccessToken函数的返回值
    return this.readAccessToken()
      .then(async res => {
        // 本地有文件
        // 判断它是否过期
        if (this.isValidAccessToken(res)) {
          // 有效的
          return Promise.resolve(res);
        } else {
          // 过期了
          // 发送请求获取access_token(getAccessToken)
          const res = await this.getAccessToken();
          // 保存下来（本地文件）(saveAccessToken)
          await this.saveAccessToken(res);
          // 将请求回来的access_token返回出去
          return Promise.resolve(res);
        }
      })
      .catch(async err => {
        // 本地没有文件
        // 发送请求获取access_token(getAccessToken)，
        const res = await this.getAccessToken();
        // 保存下来（本地文件）(saveAccessToken)
        await this.saveAccessToken(res);
        // 将请求回来的access_token返回出去
        return Promise.resolve(res);
      })
      .then(res => {
        // 将access_token挂载到this上
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        // 返回res包装了一层promise对象（此对象为成功的状态）
        // 是this.readAccessToken()最终的返回值
        return Promise.resolve(res);
      })
  }

  // 用来获取jsapi_ticket
  getTicket() {
    // 发送请求
    return new Promise(async (resolve, reject) => {
      // 获取access_token
      const data = await this.fetchAccessToken();
      // 定义请求的地址
      const url = `${api.ticket}&access_token=${data.access_token}`;
      rp({method: 'GET', url, json: true})
        .then(res => {
          // 将promise对象状态改成成功的状态
          resolve({
            ticket: res.ticket,
            expires_in: Date.now() + (res.expires_in - 300) * 1000
          });
        })
        .catch(err => {
          // console.log(err);
          // 将promise对象状态改成失败的状态
          reject('getTicket方法出了问题：' + err);
        })
    })
  }

  // 用来保存jsapi_ticket
  saveTicket(ticket) {
    return writeFileAsync(ticket, 'ticket.txt');
  }

  // 用来读取jsapi_ticket
  readTicket() {
    return readFileAsync('ticket.txt');
  }

  // 用来检测jsapi_ticket是否有效
  isValidTicket(data) {
    //检测传入的参数是否是有效的
    if (!data && !data.ticket && !data.expires_in) {
      //代表ticket无效的
      return false;
    }
    return data.expires_in > Date.now();
  }

  // 用来获取没有过期的jsapi_ticket
  fetchTicket() {
    // 优化
    if (this.ticket && this.ticket_expires_in && this.isValidTicket(this)) {
      // 说明之前保存过ticket并且它是有效的，直接使用
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.ticket_expires_in
      })
    }
    return this.readTicket()
      .then(async res => {
        // 本地有文件
        // 判断它是否过期
        if (this.isValidTicket(res)) {
          // 有效的
          return Promise.resolve(res);
        } else {
          // 过期了
          const res = await this.getTicket();
          await this.saveTicket(res);
          return Promise.resolve(res);
        }
      })
      .catch(async err => {
        // 本地没有文件
        const res = await this.getTicket();
        await this.saveTicket(res);
        return Promise.resolve(res);
      })
      .then(res => {
        // 将ticket挂载到this上
        this.ticket = res.ticket;
        this.ticket_expires_in = res.expires_in;
        // 返回res包装了一层promise对象（此对象为成功的状态）
        return Promise.resolve(res);
      })
  }

  // 创建自定义菜单
  createMenu(menu) {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取access_token
        const data = await this.fetchAccessToken();
        // 定义请求地址
        const url = `${api.menu.create}access_token=${data.access_token}`;
        // 发送请求
        const result = await rp({method: 'POST', url, json: true, body: menu});
        resolve(result);
      } catch (e) {
        reject('createMenu方法出了问题：' + e);
      }
    })
  }

  // 删除自定义菜单
  deleteMenu() {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.fetchAccessToken();
        // 定义请求地址
        const url = `${api.menu.delete}access_token=${data.access_token}`;
        // 发送请求
        const result = await rp({method: 'GET', url, json: true});
        resolve(result);
      } catch (e) {
        reject('deleteMenu方法出了问题：' + e);
      }
    })
  }

}

// 模拟测试
(async () => {
  const w = new Wechat();
  // 先删除再创建
  let result = await w.deleteMenu();
  console.log(result);
  result = await w.createMenu(menu);
  console.log(result);
  const data = w.fetchTicket();
})()

module.exports = Wechat;