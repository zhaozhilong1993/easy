# 研发成本统计系统

## 项目简介

这是一个专门用于追踪和计算研发人员在各个项目上投入成本的管理平台。通过精确记录研发人员的工作时间和人工成本，系统能够自动计算每个项目需要分摊的研发费用，为项目成本管理和财务核算提供数据支撑。

## 系统功能

### 核心功能
- **用户管理**: 研发人员信息管理、角色权限控制
- **项目管理**: 项目创建、成员分配、进度跟踪
- **时间记录**: 工作时间录入、审核流程
- **日报周报**: 每日/每周工作报告填写和审核
- **成本计算**: 基于人工成本和时间比例的成本分摊
- **报表统计**: 个人、项目、全局成本报表

### 用户角色
1. **研发人员**: 记录工作时间、填写日报周报
2. **项目管理员**: 管理项目、审核时间记录和报告
3. **系统管理员**: 管理用户、角色、系统配置
4. **财务管理员**: 查看成本统计、生成财务报告

## 技术架构

### 后端技术栈
- **框架**: Flask 2.3.3
- **数据库**: SQLAlchemy + SQLite/MySQL
- **认证**: JWT (JSON Web Token)
- **权限**: RBAC (基于角色的访问控制)
- **密码加密**: Flask-Bcrypt
- **CORS**: Flask-CORS

### 前端技术栈
- **框架**: React + Ant Design
- **状态管理**: Redux Toolkit
- **路由**: React Router
- **HTTP客户端**: Axios
- **图表**: ECharts

## 项目结构

```
研发统计系统/
├── backend/              # Python后端
│   ├── app/             # 应用代码
│   ├── config/          # 配置文件
│   ├── requirements.txt # Python依赖
│   ├── run.py          # 启动文件
│   └── start.sh        # 启动脚本
├── frontend/            # React前端
│   ├── src/            # 源代码
│   ├── public/         # 静态资源
│   └── package.json    # Node.js依赖
├── docs/               # 文档
└── README.md          # 项目说明
```

## 快速开始

### 后端启动

1. **进入后端目录**
   ```bash
   cd backend
   ```

2. **使用启动脚本（推荐）**
   ```bash
   ./start.sh
   ```

3. **手动启动**
   ```bash
   # 安装依赖
   pip install -r requirements.txt
   
   # 复制环境变量文件
   cp env.example .env
   
   # 初始化数据库
   python3 -c "
   from app import create_app
   from app.services.init_data import init_database
   
   app = create_app()
   with app.app_context():
       init_database()
   "
   
   # 启动服务
   python run.py
   ```

### 前端启动

1. **进入前端目录**
   ```bash
   cd frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   ```

## 默认账户

系统初始化后会创建默认管理员账户：
- **用户名**: `admin`
- **密码**: `admin123`

**注意**: 生产环境中请及时修改默认密码！

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息

### 用户管理接口
- `GET /api/users/` - 获取用户列表
- `POST /api/users/` - 创建用户
- `PUT /api/users/<id>` - 更新用户

### 角色管理接口
- `GET /api/roles/` - 获取角色列表
- `POST /api/roles/` - 创建角色
- `GET /api/roles/permissions` - 获取权限列表

## 开发指南

### 添加新功能

1. **后端开发**
   - 在 `backend/app/models/` 创建数据模型
   - 在 `backend/app/routes/` 创建API路由
   - 在 `backend/app/services/` 编写业务逻辑

2. **前端开发**
   - 在 `frontend/src/components/` 创建组件
   - 在 `frontend/src/pages/` 创建页面
   - 在 `frontend/src/services/` 编写API调用

### 测试

**后端测试**
```bash
cd backend
pytest tests/
```

**API测试**
```bash
cd backend
python test_api.py
```

## 部署

### 开发环境
- 后端: `http://localhost:5000`
- 前端: `http://localhost:3000`

### 生产环境
1. 配置生产数据库
2. 设置环境变量
3. 使用WSGI服务器部署后端
4. 构建并部署前端

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至项目维护者 