// pages/schedule/schedule.js
Page({
  data: {
    schedule: [],
    showAddDialog: false,
    formData: {
      day: '1',
      timeSlot: '1',
      courseName: '',
      location: ''
    },
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    timeSlots: ['第一节', '第二节', '第三节', '第四节', '第五节', '第六节', '第七节', '第八节']
  },

  onLoad() {
    this.getSchedule()
  },

  // 获取课程表
  getSchedule() {
    wx.showLoading({
      title: '加载中...'
    })
    
    if (wx.cloud) {
      try {
        wx.cloud.callFunction({
          name: 'schedule',
          data: {
            action: 'list',
            openid: getApp().globalData.userInfo?.openid || 'test_openid'
          },
          success: res => {
            wx.hideLoading()
            console.log('获取课程表成功', res)
            if (res.result.success) {
              this.setData({
                schedule: res.result.schedule
              })
            } else {
              wx.showToast({
                title: '获取课程表失败',
                icon: 'none'
              })
              // 云函数调用成功但返回失败，使用本地数据
              this.setData({
                schedule: [
                  { day: 1, timeSlot: 1, courseName: '数学', location: '教室1' },
                  { day: 1, timeSlot: 2, courseName: '语文', location: '教室1' },
                  { day: 2, timeSlot: 1, courseName: '英语', location: '教室2' },
                  { day: 2, timeSlot: 2, courseName: '物理', location: '实验室' },
                  { day: 3, timeSlot: 1, courseName: '化学', location: '实验室' },
                  { day: 3, timeSlot: 2, courseName: '生物', location: '实验室' },
                  { day: 4, timeSlot: 1, courseName: '历史', location: '教室3' },
                  { day: 4, timeSlot: 2, courseName: '地理', location: '教室3' },
                  { day: 5, timeSlot: 1, courseName: '政治', location: '教室4' },
                  { day: 5, timeSlot: 2, courseName: '体育', location: '操场' }
                ]
              })
            }
          },
          fail: err => {
            wx.hideLoading()
            console.error('获取课程表失败', err)
            wx.showToast({
              title: '获取课程表失败',
              icon: 'none'
            })
            // 云函数调用失败，使用本地数据
            this.setData({
              schedule: [
                { day: 1, timeSlot: 1, courseName: '数学', location: '教室1' },
                { day: 1, timeSlot: 2, courseName: '语文', location: '教室1' },
                { day: 2, timeSlot: 1, courseName: '英语', location: '教室2' },
                { day: 2, timeSlot: 2, courseName: '物理', location: '实验室' },
                { day: 3, timeSlot: 1, courseName: '化学', location: '实验室' },
                { day: 3, timeSlot: 2, courseName: '生物', location: '实验室' },
                { day: 4, timeSlot: 1, courseName: '历史', location: '教室3' },
                { day: 4, timeSlot: 2, courseName: '地理', location: '教室3' },
                { day: 5, timeSlot: 1, courseName: '政治', location: '教室4' },
                { day: 5, timeSlot: 2, courseName: '体育', location: '操场' }
              ]
            })
          }
        })
      } catch (err) {
        wx.hideLoading()
        console.error('获取课程表异常', err)
        wx.showToast({
          title: '获取课程表失败',
          icon: 'none'
        })
        // 云函数调用异常，使用本地数据
        this.setData({
          schedule: [
            { day: 1, timeSlot: 1, courseName: '数学', location: '教室1' },
            { day: 1, timeSlot: 2, courseName: '语文', location: '教室1' },
            { day: 2, timeSlot: 1, courseName: '英语', location: '教室2' },
            { day: 2, timeSlot: 2, courseName: '物理', location: '实验室' },
            { day: 3, timeSlot: 1, courseName: '化学', location: '实验室' },
            { day: 3, timeSlot: 2, courseName: '生物', location: '实验室' },
            { day: 4, timeSlot: 1, courseName: '历史', location: '教室3' },
            { day: 4, timeSlot: 2, courseName: '地理', location: '教室3' },
            { day: 5, timeSlot: 1, courseName: '政治', location: '教室4' },
            { day: 5, timeSlot: 2, courseName: '体育', location: '操场' }
          ]
        })
      }
    } else {
      wx.hideLoading()
      // 云开发未初始化，使用本地数据
      this.setData({
        schedule: [
          { day: 1, timeSlot: 1, courseName: '数学', location: '教室1' },
          { day: 1, timeSlot: 2, courseName: '语文', location: '教室1' },
          { day: 2, timeSlot: 1, courseName: '英语', location: '教室2' },
          { day: 2, timeSlot: 2, courseName: '物理', location: '实验室' },
          { day: 3, timeSlot: 1, courseName: '化学', location: '实验室' },
          { day: 3, timeSlot: 2, courseName: '生物', location: '实验室' },
          { day: 4, timeSlot: 1, courseName: '历史', location: '教室3' },
          { day: 4, timeSlot: 2, courseName: '地理', location: '教室3' },
          { day: 5, timeSlot: 1, courseName: '政治', location: '教室4' },
          { day: 5, timeSlot: 2, courseName: '体育', location: '操场' }
        ]
      })
    }
  },

  // 打开添加课程对话框
  addCourse() {
    this.setData({
      showAddDialog: true,
      formData: {
        day: '1',
        timeSlot: '1',
        courseName: '',
        location: ''
      }
    })
  },

  // 隐藏添加课程对话框
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

  // 处理选择
  handlePickerChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 添加课程
  addCourseSubmit() {
    const { day, timeSlot, courseName, location } = this.data.formData
    
    if (!courseName) {
      wx.showToast({
        title: '请填写课程名称',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '保存中...'
    })
    
    wx.cloud.callFunction({
      name: 'schedule',
      data: {
        action: 'create',
        openid: getApp().globalData.userInfo?.openid || 'test_openid',
        data: {
          day: parseInt(day) + 1, // 转换为1-7
          timeSlot: parseInt(timeSlot) + 1, // 转换为1-8
          courseName: courseName,
          location: location,
          createTime: new Date()
        }
      },
      success: res => {
        wx.hideLoading()
        console.log('添加课程成功', res)
        if (res.result.success) {
          this.setData({ showAddDialog: false })
          this.getSchedule()
          wx.showToast({
            title: '课程添加成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '课程添加失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('添加课程失败', err)
        wx.showToast({
          title: '课程添加失败',
          icon: 'none'
        })
      }
    })
  },

  // 获取课程信息
  getCourseInfo(day, timeSlot) {
    return this.data.schedule.find(course => course.day === day && course.timeSlot === timeSlot)
  },

  // 停止事件冒泡
  stopPropagation() {
    // 防止点击对话框内容时关闭对话框
  }
})