// 云函数入口文件
const cloud = require('wx-server-sdk')
const https = require('https')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  
  try {
    switch (action) {
      case 'code2Session':
        const { js_code } = data
        // 使用 HTTP 请求调用微信官方接口
        const result = await code2Session(js_code)
        return result
      default:
        return {
          error: '未知操作'
        }
    }
  } catch (err) {
    console.error('调用开放接口失败', err)
    return {
      error: err.message
    }
  }
}

// 通过 HTTP 请求调用微信 code2Session 接口
function code2Session(js_code) {
  return new Promise((resolve, reject) => {
    // 替换为你的小程序 appid 和 secret
    const appid = process.env.APP_ID
    const secret = process.env.APP_SECRET
    const grant_type = 'authorization_code'
    
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=${grant_type}`
    
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.errcode) {
            reject(new Error(`微信接口错误: ${result.errmsg}`))
          } else {
            resolve(result)
          }
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}