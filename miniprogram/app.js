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
          // 发送 code 到后台换取 openId, sessionKey, unionId
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
                  // 获取用户信息
                  this.getUserInfo()
                } else {
                  // 云函数调用成功但返回失败，使用本地用户信息
                  this.globalData.userInfo = {
                    nickName: '张老师',
                    avatarUrl: '',
                    openid: 'test_openid'
                  }
                }
              },
              fail: err => {
                console.error('登录失败', err)
                // 云函数调用失败，使用本地用户信息
                this.globalData.userInfo = {
                  nickName: '张老师',
                  avatarUrl: '',
                  openid: 'test_openid'
                }
              }
            })
          } else {
            // 云开发未初始化，使用本地用户信息
            this.globalData.userInfo = {
              nickName: '张老师',
              avatarUrl: '',
              openid: 'test_openid'
            }
          }
        } else {
          console.error('登录失败：' + res.errMsg)
          // 登录失败，使用本地用户信息
          this.globalData.userInfo = {
            nickName: '张老师',
            avatarUrl: '',
            openid: 'test_openid'
          }
        }
      },
      fail: err => {
        console.error('登录失败', err)
        // 登录失败，使用本地用户信息
        this.globalData.userInfo = {
          nickName: '张老师',
          avatarUrl: '',
          openid: 'test_openid'
        }
      }
    })
  },
  
  getUserInfo() {
    // 获取用户信息
    try {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: res => {
          console.log('获取用户信息成功', res)
          this.globalData.userInfo = {
            ...this.globalData.userInfo,
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
            gender: res.userInfo.gender,
            province: res.userInfo.province,
            city: res.userInfo.city,
            country: res.userInfo.country
          }
          // 更新用户信息到数据库
          this.updateUserInfo()
        },
        fail: err => {
          console.error('获取用户信息失败', err)
          // 获取用户信息失败，不影响程序运行
        }
      })
    } catch (err) {
      console.error('获取用户信息异常', err)
      // 获取用户信息异常，不影响程序运行
    }
  },
  
  updateUserInfo() {
    if (this.globalData.userInfo && this.globalData.userInfo.openid && wx.cloud) {
      try {
        wx.cloud.callFunction({
          name: 'login',
          data: {
            action: 'updateUser',
            userInfo: this.globalData.userInfo
          },
          success: res => {
            console.log('更新用户信息成功', res)
          },
          fail: err => {
            console.error('更新用户信息失败', err)
            // 更新用户信息失败，不影响程序运行
          }
        })
      } catch (err) {
        console.error('更新用户信息异常', err)
        // 更新用户信息异常，不影响程序运行
      }
    }
  },
  
  globalData: {
    userInfo: null
  }
})