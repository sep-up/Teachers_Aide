// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data, openid } = event
  console.log('schedule云函数action, data, openid', action, data, openid)

  try {
    switch (action) {
      case 'create':
        // 创建课程
        const { day, timeSlot, courseName, location, createTime } = data
        const newCourse = await db.collection('schedule').add({
          data: {
            openid: openid,
            day: day,
            timeSlot: timeSlot,
            courseName: courseName,
            location: location || '',
            createTime: createTime,
            isDeleted: false
          }
        })
        return {
          success: true,
          courseId: newCourse._id
        }
        
      case 'list':
        // 获取课程表
        const schedule = await db.collection('schedule').where({
          openid: openid,
          isDeleted: false
        }).orderBy('day', 'asc').orderBy('timeSlot', 'asc').get()
        return {
          success: true,
          schedule: schedule.data
        }
        
      case 'update':
        // 更新课程
        const { id: updateId } = event
        const updateFields = data
        await db.collection('schedule').doc(updateId).update({
          data: updateFields
        })
        return {
          success: true
        }
        
      case 'delete':
        // 删除课程（逻辑删除）
        const { deleteId } = event
        await db.collection('schedule').doc(deleteId).update({
          data: {
            isDeleted: true
          }
        })
        return {
          success: true
        }
        
      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (err) {
    console.error('课程表管理操作失败', err)
    return {
      success: false,
      error: err.message
    }
  }
}