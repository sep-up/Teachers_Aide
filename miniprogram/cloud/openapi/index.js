// 云函数入口文件
const cloud = require('wx-server-sdk')

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
        const result = await cloud.openapi.auth.code2Session({
          js_code: js_code,
          grant_type: 'authorization_code'
        })
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