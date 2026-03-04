// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      try {
        wx.cloud.init({
          env: 'cloud1-7ggm9u41ff52487f',
          traceUser: true
        })
      } catch (err) {
        console.error('云开发初始化失败', err)
      }
    }
    
    // 登录
    this.login()
  },
  
  login() {
    wx.login({
      success: res => {
        if (res.code) {
          if (wx.cloud) {
            wx.cloud.callFunction({
              name: 'login',
              data: {
                code: res.code
              },
              success: res => {
                console.log('登录成功', res)
                if (res.result.success) {
                  this.globalData.userInfo = res.result.userInfo
                } else {
                  console.error('登录失败', res.result.error)
                  wx.showToast({
                    title: '登录失败',
                    icon: 'none'
                  })
                  this.globalData.userInfo = null
                }
              },
              fail: err => {
                console.error('登录失败', err)
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                })
                this.globalData.userInfo = null
              }
            })
          } else {
            console.error('云开发未初始化')
            wx.showToast({
              title: '云开发未初始化',
              icon: 'none'
            })
            this.globalData.userInfo = null
          }
        } else {
          console.error('登录失败：' + res.errMsg)
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
          this.globalData.userInfo = null
        }
      },
      fail: err => {
        console.error('登录失败', err)
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
        this.globalData.userInfo = null
      }
    })
  },
  
  getUserInfo(callback) {
    try {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: res => {
          console.log('获取用户信息成功', res)
          const userInfoFromWx = res.userInfo
          
          // 先检查是否已有用户登录信息
          if (this.globalData.userInfo) {
            // 合并用户信息
            const updatedUserInfo = {
              ...this.globalData.userInfo,
              nickName: userInfoFromWx.nickName,
              avatarUrl: userInfoFromWx.avatarUrl,
              gender: userInfoFromWx.gender,
              province: userInfoFromWx.province,
              city: userInfoFromWx.city,
              country: userInfoFromWx.country
            }
            this.globalData.userInfo = updatedUserInfo
            
            // 更新到数据库
            this.updateUserInfo(updatedUserInfo, callback, { success: true })
          } else {
            // 没有登录信息，需要先登录
            if (callback) {
              callback({ success: false, error: '用户未登录' })
            }
          }
        },
        fail: err => {
          console.error('获取用户信息失败', err)
          let errorMsg = '获取用户信息失败'
          if (err.errMsg && err.errMsg.includes('auth deny')) {
            errorMsg = '用户拒绝授权'
          }
          if (callback) {
            callback({ success: false, error: errorMsg })
          }
        }
      })
    } catch (err) {
      console.error('获取用户信息异常', err)
      if (callback) {
        callback({ success: false, error: '获取用户信息异常' })
      }
    }
  },
  
  updateUserInfo(userInfo, callback, result) {
    if (userInfo && userInfo.openid && wx.cloud) {
      try {
        wx.cloud.callFunction({
          name: 'login',
          data: {
            action: 'updateUser',
            userInfo: userInfo
          },
          success: res => {
            console.log('更新用户信息成功', res)
            if (result && callback) {
              callback(result)
            }
            if (res.result && res.result.userInfo) {
              this.globalData.userInfo = res.result.userInfo
            }
          },
          fail: err => {
            console.error('更新用户信息失败', err)
            if (result && callback) {
              callback({ success: false, error: '更新用户信息失败' })
            }
          }
        })
      } catch (err) {
        console.error('更新用户信息异常', err)
        if (result && callback) {
          callback({ success: false, error: '更新用户信息异常' })
        }
      }
    } else {
      if (result && callback) {
        callback(result)
      }
    }
  },
  
  globalData: {
    userInfo: null
  }
})
