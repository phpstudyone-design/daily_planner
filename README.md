# Daily Planner

一个基于 **React + Express + PostgreSQL** 的全栈日常计划管理应用。用户可以从任务池中挑选任务生成每日计划，并使用模板快速创建标准化日程。

<img width="869" height="843" alt="image" src="https://github.com/user-attachments/assets/f0b1b6fc-e7ba-4a93-8141-39b36a532374" />

<img width="881" height="796" alt="image" src="https://github.com/user-attachments/assets/130faf9d-f4fa-490b-91a0-fe6af5a022c3" />

<img width="1000" height="843" alt="image" src="https://github.com/user-attachments/assets/9fdaf621-66b5-47d8-bab9-1db5e5710850" />

整个代码用本地安装的 ollama + codex + qwen3.6:27 自动生成， 除了运行速度令人发指之外， 一切都好。😂😂😂😂   
电脑配置  Ultra 7 265kf,  16G ddr5 内存， 5060ti 16G显卡

<img width="1290" height="505" alt="image" src="https://github.com/user-attachments/assets/b8c60141-b4f0-48ad-b8f9-1a59be7ef8bc" />

## 功能

- **任务池管理**：添加、编辑、删除可复用的任务项，作为每日计划的素材来源
- **每日计划**：根据日期生成/查看当日计划，支持从任务池勾选任务加入计划
- **计划模板**：创建和管理计划模板，一键套用生成每日日程
- **全栈 SPA 架构**：前端 React（Vite）单页应用，后端 Express RESTful API，PostgreSQL 数据库

## 项目结构

```
daily_planner/
├── client/                      # React 前端源码
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── api/                 # API 请求封装 (axios)
│       ├── components/          # 公共组件 (Navbar 等)
│       ├── pages/               # 页面组件 (IndexPage, DashboardPage, AdminPage)
│       ├── utils/               # 工具函数
│       ├── App.jsx              # 路由入口
│       ├── main.jsx             # React 挂载入口
│       └── index.css            # 全局样式
├── server/                      # Express 后端源码
│   ├── server.js                # Express 应用入口
│   ├── config/
│   │   └── db.js                # 数据库连接配置
│   ├── controllers/             # 路由控制器
│   │   ├── dailyPlanController.js
│   │   ├── taskPoolController.js
│   │   └── templateController.js
│   ├── routes/                  # Express 路由定义
│   │   ├── dailyPlanRoutes.js
│   │   ├── taskPoolRoutes.js
│   │   └── templateRoutes.js
│   ├── services/                # 业务逻辑层
│   │   ├── dailyPlanService.js
│   │   ├── taskPoolService.js
│   │   └── templateService.js
│   └── db/
│       └── migrations/          # Knex 数据库迁移文件
│           ├── 001_create_task_pool.js
│           ├── 002_create_plan_template.js
│           └── 003_create_daily_plan.js
├── dist/                        # 前端构建输出目录 (Vite build产物)
├── .env                         # 环境变量配置 (勿提交到版本控制)
├── .env.example                 # 环境变量模板
├── knexfile.js                  # Knex 迁移配置
├── vite.config.js               # Vite 构建配置
└── package.json                 # 项目依赖与脚本
```

## API 接口

| 方法   | 路径                        | 说明             |
| ------ | --------------------------- | ---------------- |
| GET    | `/api/daily-plan/today`     | 获取今日计划     |
| GET    | `/api/daily-plan/:date`     | 按日期获取计划   |
| PUT    | `/api/daily-plan/`          | 更新计划项       |
| GET    | `/api/daily-plan/all`       | 获取所有计划     |
| GET    | `/api/tasks/`               | 获取任务池列表   |
| POST   | `/api/tasks/`               | 添加任务到任务池 |
| PUT    | `/api/tasks/:id`            | 更新任务         |
| DELETE | `/api/tasks/:id`            | 删除任务         |
| GET    | `/api/templates/`           | 获取所有模板     |
| POST   | `/api/templates/`           | 创建模板         |
| PUT    | `/api/templates/:id`        | 更新模板         |
| PUT    | `/api/templates/:id/set-default` | 设为默认模板  |
| DELETE | `/api/templates/:id`        | 删除模板         |

## 如何运行

### 前置要求

- **Node.js** >= 18
- **PostgreSQL** >= 14

### 安装与启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填写数据库连接信息

# 3. 执行数据库迁移
npx knex migrate:latest

# 4. 启动开发环境
# 终端 A — 后端服务 (默认端口 3000)
npm run dev:server

# 终端 B — 前端热重载 (默认端口 5173)
npm run dev:client
```

打开浏览器访问 http://localhost:5173 即可使用开发模式（API 请求自动代理至后端）。

### 生产环境

```bash
# 1. 构建前端静态文件 (输出到 dist/)
npm run build

# 2. 启动生产服务器 (内置静态文件服务 + SPA 回退)
npm start
```

访问 http://localhost:3000 即可。Express 会自动提供 `dist/` 目录下的静态资源并对所有非 `/api` 路由返回 `index.html` 以支持前端路由。

### 数据库迁移管理

```bash
# 执行最新迁移
npx knex migrate:latest

# 回滚最近一次迁移
npx knex migrate:rollback
```

## 环境变量

| 变量          | 说明                   | 默认值          |
| ------------- | ---------------------- | --------------- |
| `NODE_ENV`    | 运行环境               | `development`   |
| `PORT`        | Express 服务端口       | `3000`          |
| `DB_HOST`     | PostgreSQL 主机地址    | `localhost`     |
| `DB_PORT`     | PostgreSQL 端口        | `5432`          |
| `DB_NAME`     | 数据库名               | `daily_planner` |
| `DB_USER`     | 数据库用户名           | `postgres`      |
| `DB_PASSWORD` | 数据库密码             | *(必填)*        |
