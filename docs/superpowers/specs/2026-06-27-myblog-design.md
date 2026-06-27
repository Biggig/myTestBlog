# MyBlog 设计规格说明书

> 日期：2026-06-27 | 状态：已批准

---

## 一、项目概述

个人技术博客，数据库驱动 + 内置富文本编辑器，专注于代码展示体验。

| 维度 | 选择 |
|------|------|
| 类型 | 个人技术博客 |
| 技术栈 | Next.js (App Router) + Tailwind CSS + shadcn/ui |
| 内容管理 | 数据库驱动（PostgreSQL + Prisma）+ TipTap 富文本编辑器 |
| 认证 | 单用户密码登录（NextAuth v5 + bcrypt） |
| 部署 | Vercel + 托管 PostgreSQL（Supabase / Neon） |

---

## 二、功能需求

1. **代码语法高亮**：Shiki 服务端渲染，支持行号、文件名、高亮行、主题切换
2. **标签/分类体系**：多对多标签，标签云，按标签筛选
3. **全文搜索**：PostgreSQL tsvector 全文搜索，防抖搜索，高亮片段
4. **评论系统**：无需登录评论，嵌套回复（2 层），审核机制，Gravatar 头像
5. **RSS 订阅**：动态生成 RSS 2.0 XML，head 自动发现
6. **草稿/发布管理**：DRAFT / PUBLISHED / ARCHIVED 三态
7. **管理后台**：仪表盘、文章 CRUD、评论审核

---

## 三、项目架构

```
myBlog/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 根布局（主题、字体）
│   │   ├── page.tsx                  # 首页（文章列表）
│   │   ├── posts/
│   │   │   ├── [slug]/page.tsx       # 文章详情页
│   │   │   └── [slug]/loading.tsx    # 加载态
│   │   ├── tags/
│   │   │   ├── page.tsx              # 标签云
│   │   │   └── [tag]/page.tsx        # 按标签过滤
│   │   ├── search/page.tsx           # 搜索页面
│   │   ├── admin/
│   │   │   ├── layout.tsx            # 管理后台布局（认证守卫）
│   │   │   ├── page.tsx              # 仪表盘
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx          # 文章列表管理
│   │   │   │   ├── new/page.tsx      # 新建文章
│   │   │   │   └── [id]/edit/page.tsx# 编辑文章
│   │   │   └── draft/page.tsx        # 草稿箱
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # NextAuth 认证端点
│   │   │   ├── posts/                # 文章 CRUD API
│   │   │   ├── comments/             # 评论 API
│   │   │   └── search/               # 搜索 API
│   │   └── rss.xml/route.ts          # RSS feed 路由
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── editor/                   # TipTap 编辑器组件
│   │   ├── post/                     # 文章卡片、内容渲染
│   │   ├── code/                     # 代码高亮组件（Shiki）
│   │   ├── comment/                  # 评论组件
│   │   ├── search/                   # 搜索组件
│   │   └── layout/                   # 导航栏、页脚
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma 客户端单例
│   │   ├── auth.ts                   # NextAuth 配置
│   │   ├── search.ts                 # PostgreSQL 全文搜索
│   │   ├── rss.ts                    # RSS 生成工具
│   │   └── markdown.ts              # 内容渲染管线
│   └── styles/
│       └── globals.css               # Tailwind + CSS 变量
├── prisma/
│   ├── schema.prisma                 # 数据模型
│   ├── seed.ts                       # 管理员账户种子
│   └── migrations/                   # 迁移文件
├── public/                           # 静态资源
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 四、数据模型

### User
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| username | String (unique) | 用户名 |
| password | String | bcrypt 哈希 |
| createdAt | DateTime | 创建时间 |

### Post
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| title | String | 标题 |
| slug | String (unique) | URL 别名 |
| content | Text | TipTap JSON |
| excerpt | Text? | 摘要 |
| coverImage | String? | 封面图 URL |
| status | Status enum | DRAFT/PUBLISHED/ARCHIVED |
| publishedAt | DateTime? | 发布时间 |
| authorId | String (FK) | 作者 |
| searchVector | tsvector | PostgreSQL 全文搜索 |

索引：`@@index([status, publishedAt])`、`@@index([slug])`

### Tag
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String (unique) | 标签名 |
| slug | String (unique) | URL 别名 |

### PostTag（多对多）
联合主键 `@@id([postId, tagId])`，级联删除。

### Comment
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| content | Text | 评论内容 |
| authorName | String | 昵称 |
| authorEmail | String? | 邮箱（Gravatar） |
| parentId | String? | 父评论（嵌套回复） |
| postId | String (FK) | 所属文章 |
| isApproved | Boolean | 审核状态 |
| createdAt | DateTime | 创建时间 |

索引：`@@index([postId, isApproved])`

---

## 五、认证与权限

- **方案**：NextAuth.js v5 + Credentials Provider + JWT Session
- **密码**：bcryptjs 哈希存储
- **路由保护**：`/admin/*` 和写操作 API 需认证；读操作和评论创建为公开
- **种子脚本**：`prisma/seed.ts` 从环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 创建管理员

### 环境变量
```
DATABASE_URL=postgresql://...
AUTH_SECRET=xxx
ADMIN_USERNAME=admin
ADMIN_PASSWORD=xxx
NEXT_PUBLIC_BLOG_NAME=MyBlog
NEXT_PUBLIC_BLOG_DESCRIPTION=前端 · 后端 · DevOps
```

---

## 六、编辑器与内容渲染

### 编辑器：TipTap
- 基于 ProseMirror，输出 JSON 格式
- 工具栏：标题 H1-H3、加粗、斜体、代码块、引用、链接、图片、内联代码、分隔线
- 代码块节点元数据：`language`、`filename`、`showLineNumbers`、`highlightedLines`
- 自动保存：每 30 秒存草稿 + localStorage 备份（防意外关闭丢失）

### 渲染管线
```
TipTap JSON → 服务端解析 → React 组件
  ├── 代码块 → Shiki 语法高亮
  ├── 普通文本 → Tailwind Typography prose
  └── 图片 → next/image 优化
```

### 代码高亮：Shiki
- TextMate 语法（VS Code 同款准确性）
- 深色主题：`github-dark`；浅色主题：`github-light`
- 代码块顶部显示文件名 + 语言标签
- 右上角复制按钮（悬停显现）
- 移动端：水平滚动，不折行

---

## 七、标签系统与全文搜索

### 标签系统
- 多对多关系（Post ↔ PostTag ↔ Tag）
- 写作时自动补全已有标签 + 新建标签
- `/tags` 标签云（按文章数量加权字号）
- `/tags/[tag]` 按标签过滤的分页文章列表

### 全文搜索
- PostgreSQL `tsvector` + `tsquery`，无外部服务
- 触发器自动更新 `searchVector` 列
- API：`GET /api/search?q=xxx`，返回 `ts_rank` 排序结果 + `ts_headline` 高亮片段
- 前端：搜索框 + `useDebounce`（300ms），结果列表展示高亮片段
- 仅搜索已发布文章（`status = 'PUBLISHED'`）

---

## 八、评论系统

- 无需登录，填写昵称 + 可选邮箱即可评论
- 嵌套回复最多 2 层（`parentId` 自引用）
- 新评论默认 `isApproved = false`，管理员在仪表盘审核
- 头像：Gravatar（基于邮箱 MD5），无邮箱显示默认头像
- 简单验证码（数学题）防 spam

---

## 九、RSS 订阅

- Route Handler 动态生成 RSS 2.0 XML
- 最多 20 篇文章，按发布时间降序
- 内容：纯文本摘要（`stripHtml` 截取前 300 字）
- `<head>` 自动添加 `<link rel="alternate" type="application/rss+xml">`
- CDN 缓存 1 小时（`Cache-Control: s-maxage=3600`）

---

## 十、SEO 与性能

- `generateMetadata` 逐页设置 title、description、Open Graph、Twitter Card
- Schema.org Article JSON-LD 结构化数据
- `next-sitemap` 自动生成 sitemap.xml
- 静态生成（`generateStaticParams`）+ ISR 按需更新
- 标签页和搜索页动态渲染

---

## 十一、视觉识别

### 色彩方案

| 令牌 | 深色（默认） | 浅色 |
|------|------------|------|
| 背景层 | slate-950 `#020617` | white `#ffffff` |
| 表面层 | slate-900 `#0f172a` | slate-50 `#f8fafc` |
| 边框 | slate-800 `#1e293b` | slate-200 |
| 正文 | slate-100 `#f1f5f9` | slate-900 `#0f172a` |
| 次要文字 | slate-400 `#94a3b8` | slate-500 |
| 强调色 | blue-500 `#3b82f6` | blue-600 `#2563eb` |

### 字体
- 正文/标题：`Inter`
- 代码：`JetBrains Mono`
- 中文：系统默认 fallback

### Design Tokens
三层架构：Primitive（原始值）→ Semantic（语义别名）→ Component（组件级）。通过 CSS 变量实现，Tailwind 配置引用 CSS 变量。深色/浅色通过 `[data-theme]` 选择器切换。

---

## 十二、页面布局

### 首页
- 导航栏 sticky + 毛玻璃效果（`backdrop-blur`）
- 标签筛选栏（水平滚动，移动端友好）
- 文章卡片：悬停上浮 2px + 阴影增强
- shadcn/ui Pagination 分页
- 搜索框：`Cmd+K` 弹出搜索面板

### 文章详情页
- 阅读进度条（顶部细线，0% → 100%，accent 色）
- 桌面端右侧 sticky TOC，移动端顶部折叠
- 代码块：文件名标题栏 + 语言标签 + 复制按钮 + 行号
- 分享按钮 + 上一篇/下一篇导航
- 底部评论区域

### 管理后台
- 桌面端：固定左侧边栏 + 右侧主内容区
- 移动端：汉堡菜单收缩侧边栏
- 仪表盘：统计卡片 + 待审核评论 + 最近文章
- 编辑器：全屏沉浸模式，移除侧边栏和导航栏
- 标题无边框大字体输入，工具栏 sticky，实时字数统计

---

## 十三、错误处理

三层错误处理：

| 层 | 策略 |
|----|------|
| UI 层 | ErrorBoundary + toast 提示 |
| API 层 | 统一格式 `{ error: { code, message } }` + HTTP 状态码 |
| 数据层 | Prisma 异常捕获与转换 |

### 关键场景
- slug 重复：自动追加 `-2` 后缀
- 文章未找到：调用 `notFound()` → 404 页
- 认证失败：401 + redirect `/admin/login`
- 搜索无结果：空状态提示 + 推荐标签

---

## 十四、测试策略

| 层级 | 工具 | 覆盖 |
|------|------|------|
| 单元测试 | Vitest | `lib/` 工具函数（markdown 渲染、RSS 生成、搜索查询构建） |
| API 测试 | Vitest + next-test-api-route-handler | 文章 CRUD、评论审核、搜索端点 |
| 组件测试 | Vitest + @testing-library/react | 编辑器、代码块、评论表单 |
| E2E | 暂不引入 | 个人博客，手动验证 + API 测试足够 |

最低及格线：`lib/` 工具函数全量单元测试 + 文章 CRUD API 集成测试。

---

## 十五、技术依赖清单

| 类别 | 包 | 用途 |
|------|---|------|
| 框架 | next, react, typescript | 核心 |
| 样式 | tailwindcss, @tailwindcss/typography, shadcn/ui | UI |
| 数据库 | prisma, @prisma/client | ORM |
| 认证 | next-auth v5, bcryptjs | 认证 |
| 编辑器 | @tiptap/react, @tiptap/starter-kit, @tiptap/extension-code-block | 富文本 |
| 代码高亮 | shiki | 语法高亮 |
| 搜索 | PostgreSQL tsvector（无额外包） | 全文搜索 |
| RSS | 原生 Route Handler 生成 | RSS |
| SEO | next-sitemap | 站点地图 |
| 测试 | vitest, @testing-library/react, next-test-api-route-handler | 测试 |
| 验证 | zod, react-hook-form, @hookform/resolvers | 表单验证 |
| 主题 | next-themes | 主题切换 |
