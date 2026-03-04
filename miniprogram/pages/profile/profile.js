Page({
  data: {
    userInfo: {},
    stats: {
      noticeCount: 0,
      scheduleCount: 0
    },
    showEditDialog: false,
    editNickName: '',
    editAvatarUrl: ''
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
  },
  
  onShow() {
    this.loadUserInfo()
    this.loadStats()
  },

  loadUserInfo() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  
  loadStats() {
    const openid = getApp().globalData.userInfo?.openid
    if (!openid) return
    
    wx.cloud.callFunction({
      name: 'notice',
      data: {
        action: 'list',
        openid: openid
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            'stats.noticeCount': res.result.notices.length
          })
        }
      }
    })
    
    wx.cloud.callFunction({
      name: 'schedule',
      data: {
        action: 'list',
        openid: openid
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            'stats.scheduleCount': res.result.schedule.length
          })
        }
      }
    })
  },
  
  editNickName() {
    this.setData({
      showEditDialog: true,
      editNickName: this.data.userInfo.nickName || ''
    })
  },
  
  onInputNickName(e) {
    this.setData({
      editNickName: e.detail.value
    })
  },
  
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          editAvatarUrl: res.tempFilePaths[0]
        })
      }
    })
  },
  
  async confirmNickName() {
    const nickName = this.data.editNickName.trim()
    if (!nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }
    
    const app = getApp()
    const userInfo = app.globalData.userInfo
    
    if (userInfo && userInfo.openid) {
      wx.showLoading({ title: '保存中...' })
      
      let avatarUrl = userInfo.avatarUrl || ''
      
      // 如果选择了新头像，先上传到云存储
      if (this.data.editAvatarUrl) {
        try {
          const uploadResult = await wx.cloud.uploadFile({
            cloudPath: `avatars/${userInfo.openid}_${Date.now()}.jpg`,
            filePath: this.data.editAvatarUrl
          })
          avatarUrl = uploadResult.fileID
        } catch (err) {
          console.error('上传头像失败', err)
        }
      }
      
      wx.cloud.callFunction({
        name: 'login',
        data: {
          action: 'updateUser',
          userInfo: {
            ...userInfo,
            nickName: nickName,
            avatarUrl: avatarUrl
          }
        },
        success: res => {
          wx.hideLoading()
          if (res.result.success) {
            app.globalData.userInfo = res.result.userInfo
            this.setData({
              userInfo: res.result.userInfo,
              showEditDialog: false,
              editAvatarUrl: ''
            })
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
          } else {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        },
        fail: err => {
          wx.hideLoading()
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    }
  },
  
  cancelEdit() {
    this.setData({
      showEditDialog: false
    })
  },
  
  stopPropagation() {
  }
})