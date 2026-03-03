// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { code, action, userInfo } = event
  
  try {
    if (action === 'updateUser') {
      // 更新用户信息
      await db.collection('users').where({
        openid: userInfo.openid
      }).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          province: userInfo.province,
          city: userInfo.city,
          country: userInfo.country,
          lastLoginTime: new Date()
        }
      })
      
      return {
        success: true
      }
    } else {
      // 调用微信登录接口获取openid
      const res = await cloud.callFunction({
        name: 'openapi',
        data: {
          action: 'code2Session',
          data: {
            js_code: code
          }
        }
      })
      
      const { openid, session_key } = res.result
      
      // 查询用户是否存在
      const userResult = await db.collection('users').where({
        openid: openid
      }).get()
      
      let user
      
      if (userResult.data.length === 0) {
        // 创建新用户
        const newUser = await db.collection('users').add({
          data: {
            openid: openid,
            nickName: '教师',
            avatarUrl: '',
            createTime: new Date(),
            lastLoginTime: new Date()
          }
        })
        
        // 获取新创建的用户信息
        const newUserInfo = await db.collection('users').doc(newUser._id).get()
        user = newUserInfo.data
      } else {
        // 更新用户最后登录时间
        await db.collection('users').where({
          openid: openid
        }).update({
          data: {
            lastLoginTime: new Date()
          }
        })
        
        user = userResult.data[0]
      }
      
      return {
        success: true,
        userInfo: user
      }
    }
  } catch (err) {
    console.error('登录失败_云函数_login', err)
    return {
      success: false,
      error: err.message
    }
  }
}