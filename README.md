# MyBlog

一个基于 Next.js 15 构建的个人技术博客，支持文章管理、代码高亮、全文搜索、评论系统和 RSS 订阅。

## ✨ 功能

### 公开页面
- **首页**: 文章列表，支持分页和标签筛选
- **文章详情**: TipTap 富文本渲染，Shiki 双主题代码高亮，阅读进度条，分享按钮
- **标签云**: 按文章数量加权展示所有标签
- **全文搜索**: PostgreSQL Full-Text Search + Cmd+K 快捷键
- **RSS Feed**: RSS 2.0，自动发现
- **评论系统**: 嵌套回复（2层），数学验证码，审核机制，Gravatar 头像

### 管理后台
- **仪表盘**: 文章/草稿/待审核评论统计
- **文章管理**: 新建、编辑、发布、归档
- **标签管理**: 自动 slug 生成
- **评论审核**: 通过/删除待审核评论
- **认证**: NextAuth v5 + Credentials Provider

### 技术特性
- **双主题**: Light/Dark 自动切换，Shiki 代码高亮双主题
- **SEO**: Schema.org JSON-LD, Open Graph, Twitter Card, robots.txt
- **错误处理**: Error Boundary, 404 页面, 加载骨架屏
- **性能**: Reading Progress 指示器, 图片优化

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript 5.7 |
| 样式 | Tailwind CSS 3.4 + shadcn/ui |
| 数据库 | PostgreSQL + Prisma 7 |
| 认证 | NextAuth v5 (JWT + Credentials) |
| 编辑器 | TipTap 3.x (React ProseMirror) |
| 代码高亮 | Shiki 4.x (双主题) |
| 搜索 | PostgreSQL Full-Text Search + cmdk |
| 测试 | Vitest 4.x (32 tests) |
| 验证 | Zod 4.x |

## 📁 项目结构

```
src/
├── app/                        # Next.js App Router 页面
│   ├── admin/                  # 管理后台
│   │   ├── comments/           # 评论管理
│   │   ├── login/              # 登录页
│   │   └── posts/              # 文章管理（新建/编辑/列表）
│   ├── api/                    # API 路由
│   │   ├── auth/               # NextAuth 认证端点
│   │   ├── comments/           # 评论 CRUD
│   │   ├── posts/              # 文章 CRUD
│   │   ├── search/             # 全文搜索
│   │   └── tags/               # 标签管理
│   ├── posts/[slug]/           # 文章详情页
│   ├── search/                 # 搜索页
│   ├── tags/                   # 标签云 + 标签筛选
│   └── rss.xml/                # RSS 2.0 Feed
├── components/                 # React 组件
│   ├── code/                   # Shiki 代码块 + 复制按钮
│   ├── comment/                # 评论列表/表单/条目
│   ├── editor/                 # TipTap 编辑器 + 工具栏
│   ├── layout/                 # Header/Footer/Sidebar/ThemeToggle
│   ├── post/                   # PostCard/PostContent/ShareButtons/ReadingProgress
│   ├── search/                 # Cmd+K 搜索对话框
│   ├── seo/                    # JSON-LD 结构化数据
│   └── ui/                     # shadcn/ui 组件库
├── hooks/                      # React Hooks
├── lib/                        # 工具函数
│   ├── __tests__/              # 单元测试 (32 tests)
│   ├── auth.ts / auth.config.ts  # NextAuth 配置
│   ├── content.ts              # TipTap 文本提取 / 阅读时间估算
│   ├── gravatar.ts             # Gravatar URL 生成
│   ├── prisma.ts               # Prisma 客户端（pg 适配器）
│   ├── rss.ts                  # RSS 2.0 Feed 生成
│   ├── search.ts               # PostgreSQL 全文搜索
│   ├── utils.ts                # cn() / slugify / generateUniqueSlug
│   └── validators.ts           # Zod 验证 Schema
└── generated/prisma/           # Prisma 客户端（自定义输出路径）
```

## 🚀 快速开始

### 环境要求

- Node.js 20+
- PostgreSQL 16+

### 1. 克隆仓库

```bash
git clone https://github.com/Biggig/myTestBlog.git
cd myTestBlog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，设置以下变量：

```env
# 数据库（本地开发使用 trust 认证无需密码）
DATABASE_URL="postgresql://postgres@127.0.0.1:5432/myblog"

# 认证密钥（生产环境务必更换）
AUTH_SECRET="generate-with: openssl rand -base64 32"

# 管理员账户
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me-on-deploy"

# 博客信息
NEXT_PUBLIC_BLOG_NAME="MyBlog"
NEXT_PUBLIC_BLOG_DESCRIPTION="前端 · 后端 · DevOps"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. 创建数据库

```bash
# 初始化数据库（如果还没有）
npx prisma db push

# 填充种子数据
npx prisma db seed
```

种子数据包括：
- 管理员账户：`admin` / `change-me-on-deploy`
- 初始标签：前端、后端、DevOps、TypeScript、React、Next.js

### 5. 启动开发服务器

```bash
npm run dev
```

访问：
- **博客首页**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin/login
- **RSS Feed**: http://localhost:3000/rss.xml
- **搜索**: 按 `Ctrl+K` (Windows/Linux) 或 `⌘K` (Mac)

## 🧪 测试

```bash
npm run test        # 运行所有测试（32 tests）
npx tsc --noEmit    # TypeScript 类型检查
npm run build       # 生产构建
```

## 📦 部署

项目配置为 `output: "standalone"`，兼容 Docker 部署。

```bash
# 构建
npm run build

# 启动
npm start
```

### Vercel 部署

1. 将仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（DATABASE_URL, AUTH_SECRET 等）
4. 确保 PostgreSQL 数据库可访问（推荐使用 [Neon](https://neon.tech) 或 [Supabase](https://supabase.com)）

## 🗄 数据库模型

```
User ──┐
       │ 1:N
       ├────────── Post ──┬── PostTag ──┐
       │                  │              │
       │                  ├── Comment   Tag
       │
Tag ───┘ (M:N via PostTag)
```

- **User**: 管理员，拥有多篇文章
- **Post**: 文章（标题、Slug、内容、状态、标签、全文搜索向量）
- **Tag**: 标签（名称、Slug）
- **PostTag**: 文章-标签多对多关联
- **Comment**: 评论（支持2层嵌套回复，需审核）

## 🎨 主题

支持 Light/Dark 双主题，基于 shadcn/ui CSS 变量：

- **Light**: 蓝色主题 (Blue 500)，slate 背景
- **Dark**: slate-950 深色背景，蓝色强调

## 📄 许可

MIT License
