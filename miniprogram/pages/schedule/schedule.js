// pages/schedule/schedule.js
Page({
  data: {
    schedule: [],
    scheduleGrid: [],
    showAddDialog: false,
    showDetailDialog: false,
    editMode: false,
    currentCourse: null,
    currentWeek: 0,
    weekOptions: ['本周', '下周', '下下周'],
    weekStartDate: '',
    formData: {
      day: 0,
      timeSlot: 0,
      courseName: '',
      location: ''
    },
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    timeSlots: ['第一节', '第二节', '第三节', '第四节', '第五节', '第六节', '第七节', '第八节']
  },

  onLoad() {
    this.setWeekDate()
    this.getSchedule()
  },
  
  setWeekDate() {
    const date = new Date()
    const day = date.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const weekStart = new Date(date.setDate(date.getDate() + diff))
    const weekStartStr = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`
    this.setData({ weekStartDate: weekStartStr })
  },
  
  onWeekChange(e) {
    this.setData({ currentWeek: e.detail.value })
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
              const scheduleData = res.result.schedule
              const gridData = this.generateScheduleGrid(scheduleData)
              this.setData({
                schedule: scheduleData,
                scheduleGrid: gridData
              })
            } else {
              wx.showToast({
                title: '获取课程表失败',
                icon: 'none'
              })
              this.setData({
                schedule: []
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
            this.setData({
              schedule: []
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
        this.setData({
          schedule: []
        })
      }
    } else {
      wx.hideLoading()
      wx.showToast({
        title: '云开发未初始化',
        icon: 'none'
      })
      this.setData({
        schedule: []
      })
    }
  },

  // 打开添加课程对话框
  addCourse() {
    this.setData({
      showAddDialog: true,
      editMode: false,
      currentCourse: null,
      formData: {
        day: 0,
        timeSlot: 0,
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

  // 添加或更新课程
  addCourseSubmit() {
    const { day, timeSlot, courseName, location } = this.data.formData
    
    if (!courseName) {
      wx.showToast({
        title: '请填写课程名称',
        icon: 'none'
      })
      return
    }
    
    const targetDay = parseInt(day) + 1
    const targetTimeSlot = parseInt(timeSlot) + 1
    
    // 检查时间冲突（编辑模式下排除当前课程）
    const conflictCourse = this.data.schedule.find(course => 
      course.day === targetDay && 
      course.timeSlot === targetTimeSlot &&
      (!this.data.editMode || course._id !== this.data.currentCourse._id)
    )
    
    if (conflictCourse) {
      wx.showModal({
        title: '时间冲突',
        content: `该时间段已有课程：${conflictCourse.courseName}`,
        showCancel: false
      })
      return
    }
    
    wx.showLoading({
      title: '保存中...'
    })
    
    const action = this.data.editMode ? 'update' : 'create'
    const requestData = {
      action: action,
      openid: getApp().globalData.userInfo?.openid || 'test_openid'
    }
    
    if (this.data.editMode) {
      requestData.id = this.data.currentCourse._id
      requestData.data = {
        day: targetDay,
        timeSlot: targetTimeSlot,
        courseName: courseName,
        location: location
      }
    } else {
      requestData.data = {
        day: targetDay,
        timeSlot: targetTimeSlot,
        courseName: courseName,
        location: location,
        createTime: new Date()
      }
    }
    
    wx.cloud.callFunction({
      name: 'schedule',
      data: requestData,
      success: res => {
        wx.hideLoading()
        console.log('保存课程成功', res)
        if (res.result.success) {
          this.setData({ showAddDialog: false })
          this.getSchedule()
          wx.showToast({
            title: this.data.editMode ? '课程更新成功' : '课程添加成功',
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
        console.error('保存课程失败', err)
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },

  // 生成课程表网格数据
  generateScheduleGrid(scheduleData) {
    const grid = []
    for (let timeSlot = 1; timeSlot <= 8; timeSlot++) {
      const row = []
      for (let day = 1; day <= 7; day++) {
        const course = scheduleData.find(c => c.day === day && c.timeSlot === timeSlot)
        if (course) {
          course.color = this.getCourseColorValue(course.courseName)
          course.textColor = this.getTextColorValue(course.color)
        }
        row.push(course || null)
      }
      grid.push(row)
    }
    return grid
  },
  
  // 获取课程信息
  getCourseInfo(day, timeSlot) {
    return this.data.schedule.find(course => course.day === day && course.timeSlot === timeSlot)
  },
  
  // 根据课程名称生成颜色值
  getCourseColorValue(courseName) {
    if (!courseName) return '#E3F2FD'
    
    const colors = [
      '#FFE7E7', '#FFF4E6', '#FFF9E6', '#E8F5E9',
      '#E3F2FD', '#F3E5F5', '#FCE4EC', '#E0F2F1'
    ]
    
    let hash = 0
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  },
  
  // 根据背景色生成文字颜色值
  getTextColorValue(bgColor) {
    const colorMap = {
      '#FFE7E7': '#D32F2F',
      '#FFF4E6': '#E65100',
      '#FFF9E6': '#F57F17',
      '#E8F5E9': '#2E7D32',
      '#E3F2FD': '#1565C0',
      '#F3E5F5': '#6A1B9A',
      '#FCE4EC': '#C2185B',
      '#E0F2F1': '#00695C'
    }
    return colorMap[bgColor] || '#1565C0'
  },

  // 点击课程单元格
  onCourseClick(e) {
    const { day, time } = e.currentTarget.dataset
    const course = this.getCourseInfo(day, time)
    
    if (course) {
      this.setData({
        showDetailDialog: true,
        currentCourse: course
      })
    }
  },
  
  // 关闭详情对话框
  hideDetailDialog() {
    this.setData({
      showDetailDialog: false,
      currentCourse: null
    })
  },
  
  // 编辑课程
  editCourse() {
    const course = this.data.currentCourse
    this.setData({
      showDetailDialog: false,
      showAddDialog: true,
      editMode: true,
      formData: {
        day: course.day - 1,
        timeSlot: course.timeSlot - 1,
        courseName: course.courseName,
        location: course.location || ''
      }
    })
  },
  
  // 删除课程
  deleteCourse() {
    const course = this.data.currentCourse
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除课程"${course.courseName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          
          wx.cloud.callFunction({
            name: 'schedule',
            data: {
              action: 'delete',
              deleteId: course._id
            },
            success: res => {
              wx.hideLoading()
              if (res.result.success) {
                this.setData({ showDetailDialog: false })
                this.getSchedule()
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                })
              }
            },
            fail: err => {
              wx.hideLoading()
              console.error('删除课程失败', err)
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  // 停止事件冒泡
  stopPropagation() {
  }
})