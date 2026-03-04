// pages/notice/notice.js
Page({
  data: {
    notices: [],
    showAddDialog: false,
    formData: {
      title: '',
      content: '',
      images: []
    },
    tempImagePaths: []
  },

  onLoad() {
    this.getNotices()
  },

  // 获取通知列表
  getNotices() {
    wx.showLoading({
      title: '加载中...'
    })
    
    if (wx.cloud) {
      try {
        wx.cloud.callFunction({
          name: 'notice',
          data: {
            action: 'list',
            openid: getApp().globalData.userInfo?.openid || 'test_openid'
          },
          success: res => {
            wx.hideLoading()
            console.log('获取通知列表成功', res)
            if (res.result.success) {
              this.setData({
                notices: res.result.notices
              })
            } else {
              wx.showToast({
                title: '获取通知列表失败',
                icon: 'none'
              })
              this.setData({
                notices: []
              })
            }
          },
          fail: err => {
            wx.hideLoading()
            console.error('获取通知列表失败', err)
            wx.showToast({
              title: '获取通知列表失败',
              icon: 'none'
            })
            this.setData({
              notices: []
            })
          }
        })
      } catch (err) {
        wx.hideLoading()
        console.error('获取通知列表异常', err)
        wx.showToast({
          title: '获取通知列表失败',
          icon: 'none'
        })
        this.setData({
          notices: []
        })
      }
    } else {
      wx.hideLoading()
      wx.showToast({
        title: '云开发未初始化',
        icon: 'none'
      })
      this.setData({
        notices: []
      })
    }
  },

  // 打开添加通知对话框
  addNotice() {
    this.setData({
      showAddDialog: true,
      formData: {
        title: '',
        content: '',
        images: []
      },
      tempImagePaths: []
    })
  },

  // 隐藏添加通知对话框
  hideAddDialog() {
    this.setData({
      showAddDialog: false
    })
  },

  // 处理输入
  handleInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 选择图片
  chooseImage() {
    const maxImages = 9
    const currentCount = this.data.tempImagePaths.length
    
    if (currentCount >= maxImages) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      })
      return
    }
    
    wx.chooseImage({
      count: maxImages - currentCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          tempImagePaths: [...this.data.tempImagePaths, ...tempFilePaths]
        })
      }
    })
  },
  
  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const tempImagePaths = this.data.tempImagePaths
    tempImagePaths.splice(index, 1)
    this.setData({
      tempImagePaths: tempImagePaths
    })
  },
  
  // 上传图片到云存储
  async uploadImages() {
    const images = []
    
    for (let i = 0; i < this.data.tempImagePaths.length; i++) {
      const filePath = this.data.tempImagePaths[i]
      const cloudPath = `notices/${Date.now()}_${i}.${filePath.match(/\.(\w+)$/)[1]}`
      
      try {
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath
        })
        images.push(uploadResult.fileID)
      } catch (err) {
        console.error('上传图片失败', err)
      }
    }
    
    return images
  },
  
  // 发布通知
  async publishNotice() {
    const { title, content } = this.data.formData
    
    if (!title || !content) {
      wx.showToast({
        title: '请填写标题和内容',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '发布中...'
    })
    
    // 上传图片
    let images = []
    if (this.data.tempImagePaths.length > 0) {
      images = await this.uploadImages()
    }
    
    wx.cloud.callFunction({
      name: 'notice',
      data: {
        action: 'create',
        openid: getApp().globalData.userInfo?.openid || 'test_openid',
        data: {
          title: title,
          content: content,
          images: images,
          publishTime: new Date()
        }
      },
      success: res => {
        wx.hideLoading()
        console.log('发布通知成功', res)
        if (res.result.success) {
          this.setData({ 
            showAddDialog: false,
            tempImagePaths: []
          })
          this.getNotices()
          wx.showToast({
            title: '通知发布成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '通知发布失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('发布通知失败', err)
        wx.showToast({
          title: '通知发布失败',
          icon: 'none'
        })
      }
    })
  },

  // 转发通知到微信群
  shareToWeChat(e) {
    const noticeId = e.currentTarget.dataset.noticeid
    const notice = this.data.notices.find(n => n._id === noticeId)
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    wx.shareAppMessage({
      title: notice.title,
      desc: notice.content,
      path: `/pages/notice/notice?id=${noticeId}`,
      success: res => {
        console.log('转发成功', res)
        wx.showToast({
          title: '转发成功',
          icon: 'success'
        })
      },
      fail: err => {
        console.error('转发失败', err)
        wx.showToast({
          title: '转发失败',
          icon: 'none'
        })
      }
    })
  },

  // 停止事件冒泡
  stopPropagation() {
    // 防止点击对话框内容时关闭对话框
  }
})