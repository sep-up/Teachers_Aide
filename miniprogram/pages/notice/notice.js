// pages/notice/notice.js
Page({
  data: {
    notices: [],
    showAddDialog: false,
    formData: {
      title: '',
      content: ''
    }
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
              // 云函数调用成功但返回失败，使用本地数据
              this.setData({
                notices: [
                  {
                    _id: '1',
                    title: '家长会通知',
                    content: '各位家长，本周六下午2点将召开家长会，请准时参加。',
                    publishTime: '2026-03-01 10:00:00'
                  },
                  {
                    _id: '2',
                    title: '期中考试安排',
                    content: '期中考试将于下周一至周三进行，请同学们做好准备。',
                    publishTime: '2026-02-28 14:30:00'
                  },
                  {
                    _id: '3',
                    title: '春季运动会',
                    content: '学校将于3月15日举行春季运动会，欢迎同学们积极报名参加。',
                    publishTime: '2026-02-25 09:00:00'
                  }
                ]
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
            // 云函数调用失败，使用本地数据
            this.setData({
              notices: [
                {
                  _id: '1',
                  title: '家长会通知',
                  content: '各位家长，本周六下午2点将召开家长会，请准时参加。',
                  publishTime: '2026-03-01 10:00:00'
                },
                {
                  _id: '2',
                  title: '期中考试安排',
                  content: '期中考试将于下周一至周三进行，请同学们做好准备。',
                  publishTime: '2026-02-28 14:30:00'
                },
                {
                  _id: '3',
                  title: '春季运动会',
                  content: '学校将于3月15日举行春季运动会，欢迎同学们积极报名参加。',
                  publishTime: '2026-02-25 09:00:00'
                }
              ]
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
        // 云函数调用异常，使用本地数据
        this.setData({
          notices: [
            {
              _id: '1',
              title: '家长会通知',
              content: '各位家长，本周六下午2点将召开家长会，请准时参加。',
              publishTime: '2026-03-01 10:00:00'
            },
            {
              _id: '2',
              title: '期中考试安排',
              content: '期中考试将于下周一至周三进行，请同学们做好准备。',
              publishTime: '2026-02-28 14:30:00'
            },
            {
              _id: '3',
              title: '春季运动会',
              content: '学校将于3月15日举行春季运动会，欢迎同学们积极报名参加。',
              publishTime: '2026-02-25 09:00:00'
            }
          ]
        })
      }
    } else {
      wx.hideLoading()
      // 云开发未初始化，使用本地数据
      this.setData({
        notices: [
          {
            _id: '1',
            title: '家长会通知',
            content: '各位家长，本周六下午2点将召开家长会，请准时参加。',
            publishTime: '2026-03-01 10:00:00'
          },
          {
            _id: '2',
            title: '期中考试安排',
            content: '期中考试将于下周一至周三进行，请同学们做好准备。',
            publishTime: '2026-02-28 14:30:00'
          },
          {
            _id: '3',
            title: '春季运动会',
            content: '学校将于3月15日举行春季运动会，欢迎同学们积极报名参加。',
            publishTime: '2026-02-25 09:00:00'
          }
        ]
      })
    }
  },

  // 打开添加通知对话框
  addNotice() {
    this.setData({
      showAddDialog: true,
      formData: {
        title: '',
        content: ''
      }
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

  // 发布通知
  publishNotice() {
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
    
    wx.cloud.callFunction({
      name: 'notice',
      data: {
        action: 'create',
        openid: getApp().globalData.userInfo?.openid || 'test_openid',
        data: {
          title: title,
          content: content,
          publishTime: new Date()
        }
      },
      success: res => {
        wx.hideLoading()
        console.log('发布通知成功', res)
        if (res.result.success) {
          this.setData({ showAddDialog: false })
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