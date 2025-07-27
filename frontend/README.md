# 研发成本统计系统 - 前端

## 项目简介

这是一个现代化的企业研发成本管理和统计分析平台的前端部分，采用 Next.js 14 和 Ant Design 5 构建，参考了 FlowLong 项目的设计风格。

## 技术栈

- **框架**: Next.js 14.0.0
- **UI 库**: Ant Design 5.12.0
- **状态管理**: Zustand 4.4.0
- **图表库**: ECharts 5.4.0 + echarts-for-react 3.0.2
- **HTTP 客户端**: Axios 1.6.0
- **样式**: Tailwind CSS 3.3.0
- **表单处理**: react-hook-form 7.48.0
- **数据获取**: react-query 3.39.0
- **日期处理**: dayjs 1.11.0
- **语言**: TypeScript

## 设计特色

参考 FlowLong 项目的设计风格，具有以下特点：

- 🎨 **现代化设计**: 采用渐变色彩和卡片式布局
- 📱 **响应式设计**: 完美适配桌面端和移动端
- ⚡ **高性能**: 基于 Next.js 的 SSR/SSG 优化
- 🎯 **用户体验**: 流畅的动画效果和交互反馈
- 🎨 **视觉层次**: 清晰的信息架构和视觉引导

## 功能模块

### 1. 用户认证
- 现代化登录界面
- JWT 令牌管理
- 权限控制

### 2. 仪表盘
- 数据统计卡片
- 实时图表展示
- 项目进度跟踪
- 最近活动列表

### 3. 用户管理
- 用户 CRUD 操作
- 角色权限管理
- 批量操作支持

### 4. 项目管理
- 项目创建和编辑
- 成员管理
- 状态跟踪

### 5. 工时记录
- 工时录入
- 工作类型分类
- 审批流程

### 6. 日报周报
- 日报/周报提交
- 内容编辑器
- 审批状态管理

### 7. 成本统计
- 个人成本计算
- 项目成本分析
- 成本报表生成

## 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 仪表盘页面
│   ├── login/            # 登录页面
│   ├── users/            # 用户管理页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/            # 可复用组件
│   └── Layout/           # 布局组件
├── services/             # API 服务
│   └── api.ts           # API 客户端
├── stores/              # 状态管理
│   └── auth.ts          # 认证状态
└── types/               # TypeScript 类型定义
```

## 设计系统

### 颜色方案

- **主色调**: #1890ff (蓝色)
- **成功色**: #52c41a (绿色)
- **警告色**: #faad14 (橙色)
- **错误色**: #ff4d4f (红色)
- **渐变**: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

### 组件样式

- **卡片**: 圆角 8px，阴影效果
- **按钮**: 圆角 6px，渐变背景
- **输入框**: 圆角 6px，聚焦效果
- **表格**: 悬停效果，斑马纹

### 动画效果

- **页面切换**: fadeIn 动画
- **卡片悬停**: translateY 变换
- **按钮点击**: 缩放效果

## 开发指南

### 添加新页面

1. 在 `src/app/` 下创建新目录
2. 添加 `page.tsx` 文件
3. 在 `MainLayout` 中添加导航菜单项

### 添加新组件

1. 在 `src/components/` 下创建组件文件
2. 使用 TypeScript 定义 Props 接口
3. 添加必要的样式和动画

### API 集成

1. 在 `src/services/api.ts` 中添加新的 API 方法
2. 在组件中使用 `useQuery` 或 `useMutation`
3. 处理加载状态和错误状态

## 部署

### Vercel 部署

```bash
npm run build
vercel --prod
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。 