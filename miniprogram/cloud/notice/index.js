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
  
  try {
    switch (action) {
      case 'create':
        // 创建通知
        const { title, content, publishTime } = data
        const newNotice = await db.collection('notices').add({
          data: {
            openid: openid,
            title: title,
            content: content,
            publishTime: publishTime,
            createTime: new Date(),
            isDeleted: false
          }
        })
        return {
          success: true,
          noticeId: newNotice._id
        }
        
      case 'list':
        // 获取通知列表
        const notices = await db.collection('notices').where({
          openid: openid,
          isDeleted: false
        }).orderBy('publishTime', 'desc').get()
        return {
          success: true,
          notices: notices.data
        }
        
      case 'get':
        // 获取单个通知信息
        const { noticeId } = data
        const noticeInfo = await db.collection('notices').doc(noticeId).get()
        return {
          success: true,
          notice: noticeInfo.data
        }
        
      case 'delete':
        // 删除通知（逻辑删除）
        const { deleteId } = data
        await db.collection('notices').doc(deleteId).update({
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
    console.error('通知管理操作失败', err)
    return {
      success: false,
      error: err.message
    }
  }
}