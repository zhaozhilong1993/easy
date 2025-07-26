# 研发成本统计系统 - 使用说明

## 🚀 系统状态

✅ **系统已成功启动并运行正常！**

- **服务地址**: http://localhost:5001
- **API基础路径**: http://localhost:5001/api
- **默认管理员账户**: admin / admin123

## 📋 已实现的功能

### ✅ 用户管理系统
- [x] 用户注册和登录
- [x] JWT认证机制
- [x] 用户信息管理
- [x] 密码修改功能

### ✅ 权限管理系统
- [x] RBAC角色权限控制
- [x] 4种预设角色：admin、project_manager、developer、finance
- [x] 26种细粒度权限
- [x] 角色和权限管理API

### ✅ 数据库系统
- [x] SQLite数据库（开发环境）
- [x] 数据模型设计完整
- [x] 数据库初始化脚本

## 🔧 快速启动

### 方法1：使用启动脚本（推荐）
```bash
cd backend
./start.sh
```

### 方法2：手动启动
```bash
cd backend
source venv/bin/activate
python3 run.py
```

## 📡 API接口测试

### 1. 用户登录
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 获取用户列表
```bash
curl -X GET http://localhost:5001/api/users/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 获取角色列表
```bash
curl -X GET http://localhost:5001/api/roles/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. 运行完整测试
```bash
cd backend
source venv/bin/activate
python3 test_api.py
```

## 👥 系统角色说明

### 1. 系统管理员 (admin)
- **权限**: 所有权限
- **功能**: 用户管理、角色管理、系统配置

### 2. 项目管理员 (project_manager)
- **权限**: 项目管理、时间审核、报告审核
- **功能**: 管理项目、审核时间记录和报告

### 3. 研发人员 (developer)
- **权限**: 时间记录、报告填写、成本查看
- **功能**: 记录工作时间、填写日报周报

### 4. 财务管理员 (finance)
- **权限**: 成本计算、报表生成
- **功能**: 查看成本统计、生成财务报告

## 🔐 安全特性

- **密码加密**: 使用bcrypt进行密码哈希
- **JWT认证**: 基于Token的无状态认证
- **权限控制**: 基于角色的访问控制(RBAC)
- **CORS支持**: 跨域请求支持

## 📊 数据库结构

### 核心表
- `users`: 用户信息表
- `roles`: 角色表
- `permissions`: 权限表
- `user_roles`: 用户角色关联表
- `role_permissions`: 角色权限关联表

## 🛠️ 开发指南

### 添加新功能
1. 在 `app/models/` 创建数据模型
2. 在 `app/routes/` 创建API路由
3. 在 `app/services/` 编写业务逻辑
4. 添加相应的权限控制

### 数据库操作
```bash
# 初始化数据库
python3 init_db.py

# 查看数据库
sqlite3 dev.db
```

## 📝 下一步开发计划

### 第二阶段：项目管理模块
- [ ] 项目CRUD操作
- [ ] 项目成员管理
- [ ] 项目状态跟踪

### 第三阶段：时间记录模块
- [ ] 工作时间录入
- [ ] 时间审核流程
- [ ] 时间统计报表

### 第四阶段：日报周报模块
- [ ] 日报填写和审核
- [ ] 周报汇总和提交
- [ ] 报告统计分析

### 第五阶段：成本计算模块
- [ ] 个人成本计算
- [ ] 项目成本分摊
- [ ] 成本报表生成

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :5001
   
   # 修改端口
   # 编辑 run.py 文件中的端口号
   ```

2. **依赖包安装失败**
   ```bash
   # 重新创建虚拟环境
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **数据库初始化失败**
   ```bash
   # 删除数据库文件重新初始化
   rm dev.db
   python3 init_db.py
   ```

## 📞 技术支持

如有问题，请检查：
1. 虚拟环境是否正确激活
2. 依赖包是否完整安装
3. 数据库是否正确初始化
4. 服务是否正常启动

---

**系统状态**: ✅ 正常运行  
**最后更新**: 2025-01-26  
**版本**: v1.0.0 