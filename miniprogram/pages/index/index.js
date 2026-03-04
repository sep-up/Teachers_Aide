// index.js
Page({
  data: {
    userInfo: {},
    showEditDialog: false,
    editNickName: '',
    editAvatarUrl: '',
    isNewUser: false,
    weekSchedule: [],
    currentDate: '',
    hasAnyCourse: false,
    showAddDialog: false,
    editMode: false,
    currentCourse: null,
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
    this.checkUserStatus()
  },
  
  checkUserStatus() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
      
      // 延迟检查，等待自动获取微信信息
      setTimeout(() => {
        const currentUserInfo = app.globalData.userInfo
        if (!currentUserInfo.nickName || currentUserInfo.nickName === '教师') {
          this.setData({
            isNewUser: true,
            showEditDialog: true,
            editNickName: currentUserInfo.nickName || ''
          })
        }
      }, 1500)
    } else {
      // 如果还没有用户信息，等待登录完成
      setTimeout(() => {
        this.checkUserStatus()
      }, 500)
    }
  },
  
  onShow() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    this.setCurrentDate()
    this.loadWeekSchedule()
  },
  
  setCurrentDate() {
    const date = new Date()
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日 ${days[date.getDay()]}`
    this.setData({ currentDate: dateStr })
  },
  
  loadWeekSchedule() {
    const openid = getApp().globalData.userInfo?.openid
    if (!openid) return
    
    wx.cloud.callFunction({
      name: 'schedule',
      data: { action: 'list', openid: openid },
      success: res => {
        if (res.result.success) {
          const scheduleData = res.result.schedule
          const weekSchedule = this.formatWeekSchedule(scheduleData)
          const hasAnyCourse = scheduleData.length > 0
          this.setData({ 
            weekSchedule: weekSchedule,
            hasAnyCourse: hasAnyCourse
          })
        }
      }
    })
  },
  
  formatWeekSchedule(scheduleData) {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const timeSlots = ['第一节', '第二节', '第三节', '第四节', '第五节', '第六节', '第七节', '第八节']
    const weekSchedule = []
    
    for (let day = 1; day <= 7; day++) {
      const dayCourses = scheduleData
        .filter(c => c.day === day)
        .sort((a, b) => a.timeSlot - b.timeSlot)
        .map(c => ({
          ...c,
          timeLabel: timeSlots[c.timeSlot - 1],
          color: this.getCourseColorValue(c.courseName),
          textColor: this.getTextColorValue(this.getCourseColorValue(c.courseName))
        }))
      
      weekSchedule.push({
        dayName: days[day - 1],
        courses: dayCourses
      })
    }
    
    return weekSchedule
  },
  
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
  
  getTextColorValue(bgColor) {
    const colorMap = {
      '#FFE7E7': '#D32F2F', '#FFF4E6': '#E65100', '#FFF9E6': '#F57F17', '#E8F5E9': '#2E7D32',
      '#E3F2FD': '#1565C0', '#F3E5F5': '#6A1B9A', '#FCE4EC': '#C2185B', '#E0F2F1': '#00695C'
    }
    return colorMap[bgColor] || '#1565C0'
  },
  
  addCourse() {
    this.setData({
      showAddDialog: true,
      editMode: false,
      currentCourse: null,
      formData: { day: 0, timeSlot: 0, courseName: '', location: '' }
    })
  },
  
  editCourseFromHome(e) {
    const course = e.currentTarget.dataset.course
    this.setData({
      showAddDialog: true,
      editMode: true,
      currentCourse: course,
      formData: {
        day: course.day - 1,
        timeSlot: course.timeSlot - 1,
        courseName: course.courseName,
        location: course.location || ''
      }
    })
  },
  
  goToSchedule() {
    wx.switchTab({ url: '/pages/schedule/schedule' })
  },
  
  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },
  
  hideAddDialog() {
    this.setData({ showAddDialog: false })
  },
  
  handleInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },
  
  handlePickerChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },
  
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
    
    wx.showLoading({ title: '保存中...' })
    
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
        if (res.result.success) {
          this.setData({ showAddDialog: false })
          this.loadWeekSchedule()
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
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },
  
  getUserInfo() {
    const app = getApp()
    app.getUserInfo((res) => {
      if (res.success) {
        this.setData({
          userInfo: app.globalData.userInfo
        })
        if (!app.globalData.userInfo.nickName || app.globalData.userInfo.nickName === '教师') {
          this.setData({
            isNewUser: true,
            showEditDialog: true,
            editNickName: app.globalData.userInfo.nickName || ''
          })
        }
      } else {
        wx.showToast({
          title: res.error || '获取用户信息失败',
          icon: 'none'
        })
      }
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
          action: 'createUser',
          userInfo: {
            openid: userInfo.openid,
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
              isNewUser: false,
              editAvatarUrl: ''
            })
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
          } else {
            wx.showToast({
              title: res.result.error || '保存失败',
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
    } else {
      this.setData({
        showEditDialog: false,
        isNewUser: false
      })
    }
  },
  
  cancelEdit() {
    this.setData({
      showEditDialog: false,
      isNewUser: false
    })
  },
  
  stopPropagation() {
  }
})
