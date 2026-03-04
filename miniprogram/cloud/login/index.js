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
      console.log('login云函数code, action, userInfo', code, action, userInfo)
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
      
      // 返回更新后的用户信息
      const updatedUser = await db.collection('users').where({
        openid: userInfo.openid
      }).get()
      
      return {
        success: true,
        userInfo: updatedUser.data[0]
      }
    } else if (action === 'createUser') {
      // 创建新用户（用于首次授权后创建）
      const existingUser = await db.collection('users').where({
        openid: userInfo.openid
      }).get()
      
      if (existingUser.data.length > 0) {
        // 用户已存在，更新信息
        await db.collection('users').where({
          openid: userInfo.openid
        }).update({
          data: {
            nickName: userInfo.nickName || '教师',
            avatarUrl: userInfo.avatarUrl || '',
            lastLoginTime: new Date()
          }
        })
        const updatedUser = await db.collection('users').where({
          openid: userInfo.openid
        }).get()
        return {
          success: true,
          userInfo: updatedUser.data[0],
          isNewUser: false
        }
      }
      
      // 创建新用户
      const newUser = await db.collection('users').add({
        data: {
          openid: userInfo.openid,
          nickName: userInfo.nickName || '教师',
          avatarUrl: userInfo.avatarUrl || '',
          createTime: new Date(),
          lastLoginTime: new Date()
        }
      })
      
      const newUserInfo = await db.collection('users').doc(newUser._id).get()
      return {
        success: true,
        userInfo: newUserInfo.data,
        isNewUser: true
      }
    } else {
      let openid
      
      try {
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
        
        console.log('openapi云函数返回结果', res)
        
        // 检查openapi云函数是否返回错误
        if (res.result.error) {
          throw new Error(`调用openapi失败: ${res.result.error}`)
        }
        
        const { openid: wxOpenid, session_key } = res.result
        
        // 检查openid是否存在
        if (!wxOpenid) {
          throw new Error('获取openid失败')
        }
        
        openid = wxOpenid
        console.log('获取openid成功', openid)
      } catch (err) {
        console.error('调用openapi失败', err)
        return {
          success: false,
          error: '获取用户身份失败，请稍后重试'
        }
      }
      
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