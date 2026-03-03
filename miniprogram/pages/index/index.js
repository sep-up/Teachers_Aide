// index.js
Page({
  data: {
    userInfo: {}
  },
  
  onLoad() {
    // 获取用户信息
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  

  
  // 跳转到课程表
  goToSchedule() {
    wx.navigateTo({
      url: '/pages/schedule/schedule'
    })
  },
  
  // 跳转到发布通知
  goToNotice() {
    wx.navigateTo({
      url: '/pages/notice/notice'
    })
  }
})