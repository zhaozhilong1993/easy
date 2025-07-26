# 研发成本统计系统 - 后端

## 项目简介

这是一个基于Flask的研发成本统计系统后端API，提供用户管理、权限控制、项目管理等核心功能。

## 技术栈

- **框架**: Flask 2.3.3
- **数据库**: SQLAlchemy + SQLite/MySQL
- **认证**: JWT (JSON Web Token)
- **密码加密**: Flask-Bcrypt
- **CORS**: Flask-CORS
- **序列化**: Marshmallow

## 项目结构

```
backend/
├── app/
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── middlewares/     # 中间件
│   ├── services/        # 业务逻辑
│   └── utils/           # 工具函数
├── config/              # 配置文件
├── migrations/          # 数据库迁移文件
├── tests/               # 测试文件
├── requirements.txt     # 依赖包
├── run.py              # 启动文件
└── README.md           # 说明文档
```

## 安装和运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 环境配置

复制环境变量文件：
```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息。

### 3. 初始化数据库

```bash
flask init-db
```

### 4. 启动服务

```bash
python run.py
```

服务将在 `http://localhost:5000` 启动。

## API接口

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/refresh` - 刷新token
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/change-password` - 修改密码

### 用户管理接口

- `GET /api/users/` - 获取用户列表
- `GET /api/users/<id>` - 获取用户详情
- `POST /api/users/` - 创建用户
- `PUT /api/users/<id>` - 更新用户
- `DELETE /api/users/<id>` - 删除用户
- `PUT /api/users/<id>/status` - 更新用户状态
- `GET /api/users/departments` - 获取部门列表

### 角色管理接口

- `GET /api/roles/` - 获取角色列表
- `GET /api/roles/<id>` - 获取角色详情
- `POST /api/roles/` - 创建角色
- `PUT /api/roles/<id>` - 更新角色
- `DELETE /api/roles/<id>` - 删除角色
- `GET /api/roles/permissions` - 获取权限列表
- `POST /api/roles/permissions` - 创建权限

## 角色和权限

### 系统角色

1. **admin** - 系统管理员
   - 拥有所有权限
   - 可以管理用户、角色、项目等

2. **project_manager** - 项目管理员
   - 可以管理项目
   - 可以审核时间记录和报告

3. **developer** - 研发人员
   - 可以记录工作时间和报告
   - 可以查看个人成本信息

4. **finance** - 财务管理员
   - 可以查看成本统计
   - 可以生成和导出报表

### 权限控制

系统使用RBAC（基于角色的访问控制）模型：
- 用户可以有多个角色
- 角色可以有多个权限
- 权限控制到具体的资源操作

## 默认账户

初始化后会创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

**注意**: 生产环境中请及时修改默认密码！

## 开发指南

### 添加新的模型

1. 在 `app/models/` 目录下创建模型文件
2. 在 `app/models/__init__.py` 中导入新模型
3. 运行数据库迁移

### 添加新的路由

1. 在 `app/routes/` 目录下创建路由文件
2. 在 `app/__init__.py` 中注册蓝图
3. 添加相应的权限控制

### 测试

```bash
pytest tests/
```

## 部署

### 生产环境配置

1. 设置环境变量 `FLASK_ENV=production`
2. 配置生产数据库连接
3. 设置安全的SECRET_KEY
4. 使用WSGI服务器（如Gunicorn）

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

## 许可证

MIT License 