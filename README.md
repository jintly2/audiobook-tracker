# 有声书追踪器 (Audiobook Tracker)

一个功能完整的听书记录与追踪应用，支持日历视图、列表管理、统计分析和推荐发现。

## 功能特性

- 📅 **日历视图**：按日查看听书记录，直观展示收听进度
- 📋 **列表管理**：支持搜索、筛选、排序，快速定位记录
- 📊 **数据统计**：总时长、记录数、平均分、状态分布一目了然
- ✨ **精选推荐**：内置猫耳/漫播 广播剧与有声剧推荐数据
- ⭐ **星级评分**：5 星评分系统，记录你的喜好
- 👤 **双模式使用**：
  - **游客模式**：免注册，数据保存在本地浏览器
  - **注册模式**：Supabase Auth 账号登录，数据云端同步
- 🔒 **行级安全**：基于 Supabase RLS，用户数据严格隔离

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite + Tailwind CSS 4 + shadcn/ui 风格 |
| 后端 | NestJS 10 + Drizzle ORM |
| 数据库 | PostgreSQL (Supabase) |
| 认证 | Supabase Auth (JWT) |
| 部署 | 前后端分离，前端可部署 Vercel，后端可部署 Railway/Fly.io |

## 快速开始

### 1. 准备 Supabase 项目

1. 前往 [Supabase](https://supabase.com) 创建一个新项目
2. 在项目设置中获取以下信息：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`（在 Settings → API → JWT Settings）

### 2. 执行数据库迁移

将 `supabase/migrations/0001_init.sql` 的内容复制到 Supabase SQL Editor 中执行。

该脚本包含：
- `audiobook_records` 表（用户听书记录）
- `recommendations` 表（推荐数据）
- RLS 行级安全策略
- 种子推荐数据

### 3. 配置环境变量

```bash
cp .env.example .env
```

然后在根 `.env` 和 `server/.env` 中填入你的 Supabase 配置。

客户端环境变量（`client/.env.local`）：
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001/api
```

### 4. 安装依赖并启动

```bash
# 安装所有依赖
npm run install:all

# 启动开发服务器（前后端同时启动）
npm run dev
```

- 前端地址：http://localhost:5173
- 后端地址：http://localhost:3001

## 目录结构

```
audiobook-tracker/
├── README.md                    # 项目说明
├── package.json                 # 根 package，concurrently 管理前后端
├── tsconfig.base.json           # 共享 tsconfig
├── .env.example                 # 环境变量模板
├── supabase/
│   └── migrations/
│       └── 0001_init.sql        # 建表 + RLS + 种子数据
├── server/                      # NestJS 后端
│   └── src/
│       ├── main.ts              # 应用入口
│       ├── app.module.ts        # 根模块
│       ├── config/              # 配置模块
│       ├── database/            # Drizzle ORM 配置
│       ├── auth/                # Supabase JWT 认证
│       ├── modules/
│       │   ├── audiobook/       # 听书记录模块
│       │   └── recommendation/  # 推荐模块（种子数据）
│       └── common/              # 公共模块
└── client/                      # React 前端
    └── src/
        ├── main.tsx             # 入口
        ├── App.tsx              # 路由配置
        ├── lib/                 # 工具函数 & Supabase 客户端
        ├── api/                 # API 请求封装
        ├── hooks/               # 自定义 Hooks
        ├── components/ui/       # shadcn 风格 UI 组件
        └── pages/               # 页面组件
```

## API 接口

### 认证
- `POST /api/auth/login` - 登录（邮箱+密码）
- `POST /api/auth/signup` - 注册（邮箱+密码）
- `GET /api/auth/me` - 获取当前用户信息

### 听书记录
- `GET /api/audiobook` - 获取记录列表（支持分页、筛选、排序）
- `GET /api/audiobook/stats` - 获取统计数据
- `GET /api/audiobook/:id` - 获取单条记录
- `POST /api/audiobook` - 创建记录（需登录）
- `PATCH /api/audiobook/:id` - 更新记录（需登录）
- `DELETE /api/audiobook/:id` - 删除记录（需登录）

### 推荐
- `GET /api/recommendation/batch` - 随机获取一批推荐
- `GET /api/recommendation/all` - 获取全部推荐

## 部署说明

### 前端部署（Vercel / Netlify）

1. 将 `client/` 目录作为项目根目录部署
2. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL`（后端 API 地址）
3. Build 命令：`npm run build`
4. Output 目录：`dist`

### 后端部署（Railway / Fly.io / Render）

1. 将 `server/` 目录部署
2. 配置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `NODE_ENV=production`
3. Build 命令：`npm run build`
4. Start 命令：`npm run start:prod`

## 开发说明

- 推荐模块使用种子数据 + 随机推荐，无需依赖外部 API
- 游客模式使用 localStorage 存储，无需后端
- 登录模式通过 JWT 调用后端 API，数据存入 Supabase
- 所有 UI 组件为 shadcn 风格，使用 Tailwind CSS 4 实现

## License

MIT
