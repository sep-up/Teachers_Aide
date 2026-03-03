# Teachers Aide - 数据模型设计

## 1. 现有数据模型分析

根据PRD文档，现有数据模型包含以下集合：
- users：用户信息
- classes：班级信息
- students：学生信息
- exams：考试信息
- scores：成绩信息
- comments：评语信息
- templates：评语模板
- schedules：课程表信息
- attendances：考勤信息
- notices：通知信息

## 2. 索引设计

### 2.1 users 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| openid | 唯一索引 | 快速查询用户信息，用于登录验证 |
| createTime | 普通索引 | 按创建时间排序，用于用户管理 |

### 2.2 classes 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| openid | 普通索引 | 快速查询教师的所有班级 |
| className | 普通索引 | 按班级名称搜索 |
| academicYear | 普通索引 | 按学年筛选班级 |
| isDeleted | 普通索引 | 区分已删除和未删除的班级 |

### 2.3 students 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| classId | 普通索引 | 快速查询班级内的所有学生 |
| name | 普通索引 | 按学生姓名搜索 |
| studentNumber | 唯一索引 | 学号唯一性验证 |
| status | 普通索引 | 按学生状态筛选（在读/毕业） |

### 2.4 exams 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| classId | 普通索引 | 快速查询班级的所有考试 |
| examDate | 普通索引 | 按考试日期排序 |
| subject | 普通索引 | 按科目筛选考试 |

### 2.5 scores 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| studentId | 普通索引 | 快速查询学生的所有成绩 |
| examId | 普通索引 | 快速查询考试的所有成绩 |
| score | 普通索引 | 按分数排序，用于成绩统计 |

### 2.6 comments 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| studentId | 普通索引 | 快速查询学生的所有评语 |
| semester | 普通索引 | 按学期筛选评语 |
| createTime | 普通索引 | 按创建时间排序 |

### 2.7 templates 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| openid | 普通索引 | 快速查询教师的所有模板 |
| category | 普通索引 | 按分类筛选模板 |

### 2.8 schedules 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| classId | 普通索引 | 快速查询班级的所有课程 |
| dayOfWeek | 普通索引 | 按星期几筛选课程 |
| period | 普通索引 | 按节次筛选课程 |

### 2.9 attendances 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| studentId | 普通索引 | 快速查询学生的所有考勤记录 |
| date | 普通索引 | 按日期筛选考勤记录 |
| status | 普通索引 | 按考勤状态筛选 |

### 2.10 notices 集合

| 字段 | 索引类型 | 用途 |
|------|----------|------|
| openid | 普通索引 | 快速查询教师的所有通知 |
| createTime | 普通索引 | 按创建时间排序 |

## 3. 数据结构优化

### 3.1 users 集合

```json
{
  "_id": "string",
  "openid": "string",
  "nickName": "string",
  "avatarUrl": "string",
  "createTime": "timestamp",
  "lastLoginTime": "timestamp",  // 新增：记录最后登录时间
  "preferences": {  // 新增：用户偏好设置
    "theme": "light",
    "notifications": true
  }
}
```

### 3.2 classes 集合

```json
{
  "_id": "string",
  "openid": "string",
  "className": "string",
  "academicYear": "string",
  "grade": "string",
  "subject": "string",
  "createTime": "timestamp",
  "isDeleted": false,
  "studentCount": 0  // 新增：学生数量，用于快速显示
}
```

### 3.3 students 集合

```json
{
  "_id": "string",
  "classId": "string",
  "name": "string",
  "gender": "string",
  "studentNumber": "string",
  "parentPhone": "string",
  "joinDate": "timestamp",
  "status": "string",
  "avatarUrl": "string"  // 新增：学生头像
}
```

### 3.4 exams 集合

```json
{
  "_id": "string",
  "classId": "string",
  "examName": "string",
  "examDate": "timestamp",
  "subject": "string",
  "totalScore": 100,  // 新增：总分
  "passScore": 60,    // 新增：及格分数
  "isPublished": false  // 新增：是否发布成绩
}
```

### 3.5 scores 集合

```json
{
  "_id": "string",
  "studentId": "string",
  "examId": "string",
  "score": "number",
  "isAbsent": "boolean",
  "remark": "string",
  "rank": 0  // 新增：排名
}
```

### 3.6 comments 集合

```json
{
  "_id": "string",
  "studentId": "string",
  "content": "string",
  "semester": "string",
  "createTime": "timestamp",
  "templateIds": ["string"]  // 新增：使用的模板ID列表
}
```

### 3.7 templates 集合

```json
{
  "_id": "string",
  "openid": "string",
  "content": "string",
  "category": "string",
  "createTime": "timestamp",
  "isSystem": false  // 新增：是否系统预设模板
}
```

### 3.8 schedules 集合

```json
{
  "_id": "string",
  "classId": "string",
  "dayOfWeek": "number",
  "period": "number",
  "courseName": "string",
  "location": "string",
  "teacherName": "string",
  "color": "string",  // 新增：课程颜色标记
  "isActive": true    // 新增：是否有效
}
```

### 3.9 attendances 集合

```json
{
  "_id": "string",
  "studentId": "string",
  "date": "timestamp",
  "status": "number",
  "remark": "string",
  "recordTime": "timestamp"  // 新增：记录时间
}
```

### 3.10 notices 集合

```json
{
  "_id": "string",
  "openid": "string",
  "title": "string",
  "content": "string",
  "signature": "string",
  "imageUrl": "string",
  "createTime": "timestamp",
  "templateId": "string"  // 新增：使用的模板ID
}
```

## 4. 数据迁移方案

### 4.1 初始数据迁移

- **系统模板数据**：在应用初始化时，导入预设的评语模板
- **默认用户设置**：为新用户创建默认偏好设置

### 4.2 版本升级数据迁移

当数据模型发生变更时，需要进行数据迁移：

1. **添加新字段**：
   - 对于新增的字段，设置合理的默认值
   - 使用云函数批量更新现有数据

2. **修改字段类型**：
   - 备份现有数据
   - 转换字段类型
   - 验证数据完整性

3. **删除字段**：
   - 确认字段不再使用
   - 备份数据后删除

### 4.3 数据备份与恢复

- **自动备份**：定期（如每周）自动备份数据库
- **手动备份**：提供手动导出数据的功能
- **数据恢复**：支持从备份文件恢复数据

## 5. 性能优化建议

### 5.1 查询优化

- 使用索引加速查询
- 避免全表扫描
- 使用分页查询，限制返回数据量
- 对于复杂查询，使用云函数处理

### 5.2 存储优化

- 图片等大文件使用云存储
- 定期清理过期数据
- 优化数据结构，减少冗余字段

### 5.3 安全优化

- 使用云开发安全规则限制数据访问
- 敏感数据加密存储
- 定期检查数据访问日志

## 6. 扩展性考虑

### 6.1 未来功能扩展

- **多学科支持**：可在classes集合中添加subjects数组
- **家长端**：可添加parents集合和相关关联
- **作业管理**：可添加homework集合
- **教学资源**：可添加resources集合

### 6.2 数据模型扩展

- 保持核心数据结构稳定
- 使用嵌入文档存储相关联的小量数据
- 使用引用方式存储大量关联数据

## 7. 数据库安全规则

```json
{
  "rules": {
    "users": {
      "$user_id": {
        ".read": "auth != null && auth.uid == $user_id",
        ".write": "auth != null && auth.uid == $user_id"
      }
    },
    "classes": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$class_id": {
        ".read": "auth != null",
        ".write": "auth != null && (data == null || data.openid == auth.uid)"
      }
    },
    "students": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$student_id": {
        ".read": "auth != null",
        ".write": "auth != null && get(/databases/$(database)/documents/classes/$(data.classId)).data.openid == auth.uid"
      }
    },
    "exams": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$exam_id": {
        ".read": "auth != null",
        ".write": "auth != null && get(/databases/$(database)/documents/classes/$(data.classId)).data.openid == auth.uid"
      }
    },
    "scores": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$score_id": {
        ".read": "auth != null",
        ".write": "auth != null && get(/databases/$(database)/documents/exams/$(data.examId)).data.classId == get(/databases/$(database)/documents/classes/$(data.classId)).data.classId && get(/databases/$(database)/documents/classes/$(data.classId)).data.openid == auth.uid"
      }
    },
    "comments": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$comment_id": {
        ".read": "auth != null",
        ".write": "auth != null && get(/databases/$(database)/documents/students/$(data.studentId)).data.classId == get(/databases/$(database)/documents/classes/$(data.classId)).data.classId && get(/databases/$(database)/documents/classes/$(data.classId)).data.openid == auth.uid"
      }
    },
    "templates": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$template_id": {
        ".read": "auth != null",
        ".write": "auth != null && (data == null || data.openid == auth.uid || data.isSystem == true)"
      }
    },
    "schedules": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$schedule_id": {
        ".read": "auth != null",
        ".write": "auth != null && get(/databases/$(database)/documents/classes/$(data.classId)).data.openid == auth.uid"
      }
    },
    "attendances": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$attendance_id": {
        ".read": "auth != null",
        ".write": "auth != null && get(/databases/$(database)/documents/students/$(data.studentId)).data.classId == get(/databases/$(database)/documents/classes/$(data.classId)).data.classId && get(/databases/$(database)/documents/classes/$(data.classId)).data.openid == auth.uid"
      }
    },
    "notices": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$notice_id": {
        ".read": "auth != null",
        ".write": "auth != null && (data == null || data.openid == auth.uid)"
      }
    }
  }
}
```

## 8. 数据统计与分析

### 8.1 成绩统计

- 班级平均分、最高分、最低分
- 各分数段人数分布
- 优秀率、及格率
- 学生成绩趋势分析

### 8.2 考勤统计

- 学生出勤率
- 迟到、早退、缺勤统计
- 班级考勤趋势

### 8.3 使用统计

- 活跃用户数
- 功能使用频率
- 数据增长趋势

## 9. 数据导出与导入

### 9.1 导出格式

- Excel：支持导出学生信息、成绩、考勤等数据
- JSON：支持导出完整数据备份
- CSV：支持导出简单数据表格

### 9.2 导入功能

- 支持Excel批量导入学生信息
- 支持从备份文件恢复数据
- 导入数据验证与错误处理