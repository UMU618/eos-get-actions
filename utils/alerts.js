/**
 * @author UMU618 <umu618@hotmail.com>
 * @copyright MEET.ONE 2019
 * @description Use block-always-using-brace npm-coding-style.
 * @lastModified 2020-04-08 14:37
 */

'use strict'

const fetch = require('node-fetch')

module.exports = {
  timeout: 0

  , setTimeout(t) {
    if (typeof(t) === 'number') {
      module.exports.timeout = t
    }
  }

  , getDingtalkSign: (timestamp, secret) => {
    const to_sign = timestamp + '\n' + secret
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', secret)
    return hmac.update(to_sign).digest('base64')
  }

  , sendDingtalk: (token, secret, text) => {
    if (!token || !text) {
      console.log('sendDingtalk() local message:', text)
      return
    }

    let url = 'https://oapi.dingtalk.com/robot/send?access_token=' + token
    if (secret) {
      const timestamp = Date.now()
      url += '&timestamp=' + timestamp + '&sign='
        + encodeURIComponent(module.exports.getDingtalkSign(timestamp, secret))
    }
    fetch(url, {
      method: 'POST'
      , headers: {
        'Content-Type': 'application/json'
      }
      , body: JSON.stringify({
        msgtype: 'text'
        , text: {
          content: text
        }
      })
      , timeout: module.exports.timeout
    }).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        console.error(
          `sendDingtalk() failed, status = ${res.status}, message: ${text}`)
        return null
      }
    }, (err) => {
      console.error(err)
    }).then((jo) => {
      if (jo !== null) {
        if (jo.errcode === 0) {
          console.log('sendDingtalk() succeeded:', text)
        } else {
          console.error(
            `sendDingtalk() failed: ${JSON.stringify(jo)}, message: ${text}`)
        }
      }
    })
  }

  , sendTelegram: (token, chat_id, text) => {
    if (!token || !chat_id || !text) {
      console.log('sendTelegram() local message:', text)
      return
    }
    fetch('https://api.telegram.org/bot' + token + '/sendMessage?'
      + require('querystring').stringify({
        chat_id: chat_id, text: text
      }), { method: 'POST', timeout: module.exports.timeout })
      .then(function (res) {
        if (res.ok) {
          return res.json()
        } else {
          console.error(
            `sendTelegram() failed, status = ${res.status}, message: ${text}`)
          return null
        }
      }, function (err) {
        console.error(err)
      })
      .then((jo) => {
        if (jo !== null) {
          if (jo.ok) {
            console.log('sendTelegram() succeeded:', text)
          } else {
            console.error(
              `sendTelegram() failed: ${JSON.stringify(jo)}, message: ${text}`)
          }
        }
      })
  }

  , sendFeishu: (token, text, title) => {
    if (!token || !text) {
      console.log('sendFeishu() local message:', text)
      return
    }
    const url = 'https://open.feishu.cn/open-apis/bot/hook/' + token
    const jo = {
      text: text
    }
    if (title) {
      jo.title = title
    }
    fetch(url, {
      method: 'POST'
      , headers: {
        'Content-Type': 'application/json'
      }
      , body: JSON.stringify(jo)
      , timeout: module.exports.timeout
    }).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        console.error(
          `sendFeishu() failed, status = ${res.status}, message: ${text}`)
        return null
      }
    }, (err) => {
      console.log(err)
    }).then((jo) => {
      if (jo !== null) {
        if (jo.ok === true) {
          console.log('sendFeishu() succeeded:', text)
        } else {
          console.error(
            `sendFeishu() failed: ${JSON.stringify(jo)}, message: ${text}`)
        }
      }
    })
  }
}
