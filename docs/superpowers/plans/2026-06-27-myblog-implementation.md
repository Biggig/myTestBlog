# MyBlog 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个数据库驱动的个人技术博客，包含富文本编辑器、代码语法高亮、全文搜索、评论系统和 RSS 订阅。

**Architecture:** Next.js App Router 全栈应用。PostgreSQL + Prisma ORM 管理数据，NextAuth v5 处理单用户认证，TipTap 提供富文本编辑，Shiki 实现服务端代码高亮。公开页面（首页、文章详情、标签、搜索）SSG/ISR 预渲染，管理后台（`/admin`）通过 JWT Session 保护。

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, NextAuth v5, TipTap, Shiki, Zod, Vitest

---

## 文件结构总览

```
myBlog/
├── .env.example
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── components.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── robots.txt
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── posts/[slug]/page.tsx
│   │   ├── tags/page.tsx
│   │   ├── tags/[tag]/page.tsx
│   │   ├── search/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── posts/page.tsx
│   │   │   ├── posts/new/page.tsx
│   │   │   ├── posts/[id]/edit/page.tsx
│   │   │   └── comments/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── posts/route.ts
│   │   │   ├── posts/[id]/route.ts
│   │   │   ├── comments/route.ts
│   │   │   ├── comments/[id]/route.ts
│   │   │   ├── search/route.ts
│   │   │   └── tags/route.ts
│   │   └── rss.xml/route.ts
│   ├── components/
│   │   ├── ui/           # shadcn/ui generated
│   │   ├── editor/
│   │   │   ├── tip-tap-editor.tsx
│   │   │   └── editor-toolbar.tsx
│   │   ├── post/
│   │   │   ├── post-card.tsx
│   │   │   ├── post-content.tsx
│   │   │   └── reading-progress.tsx
│   │   ├── code/
│   │   │   └── code-block.tsx
│   │   ├── comment/
│   │   │   ├── comment-form.tsx
│   │   │   ├── comment-list.tsx
│   │   │   └── comment-item.tsx
│   │   ├── search/
│   │   │   └── search-dialog.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       ├── admin-sidebar.tsx
│   │       └── theme-toggle.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auth.config.ts
│   │   ├── search.ts
│   │   ├── rss.ts
│   │   ├── content.ts
│   │   ├── validators.ts
│   │   └── utils.ts
│   └── styles/
│       └── tokens.css
└── __tests__/
    ├── lib/
    │   ├── search.test.ts
    │   ├── rss.test.ts
    │   └── content.test.ts
    └── api/
        └── posts.test.ts
```

---

### Task 1: 项目脚手架与依赖安装

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `components.json`
- Create: `src/app/globals.css`, `src/styles/tokens.css`, `.env.example`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd E:\AI\myBlog
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```
Expected: Next.js 15 项目在 `E:\AI\myBlog` 创建完成。

- [ ] **Step 2: 安装核心依赖**

```bash
npm install prisma @prisma/client next-auth@beta bcryptjs zod react-hook-form @hookform/resolvers
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-code-block-lowlight @tiptap/extension-placeholder @tiptap/pm
npm install shiki next-themes next-sitemap
npm install -D @types/bcryptjs vitest @testing-library/react @testing-library/jest-dom next-test-api-route-handler
```
Expected: 所有依赖安装成功，无 peer dependency 冲突。

- [ ] **Step 3: 初始化 shadcn/ui**

```bash
npx shadcn@latest init
```
选择：TypeScript: yes, Style: New York, Base color: Slate, CSS variables: yes

- [ ] **Step 4: 添加 shadcn/ui 组件**

```bash
npx shadcn@latest add button card input label form dialog dropdown-menu command table badge separator sheet pagination toast textarea select skeleton avatar
```
Expected: 组件出现在 `src/components/ui/`。

- [ ] **Step 5: 初始化 Prisma**

```bash
npx prisma init --datasource-provider postgresql
```
Expected: `prisma/schema.prisma` 和 `.env` 创建完成。

- [ ] **Step 6: 创建环境变量模板**

写入 `E:\AI\myBlog\.env.example`：

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myblog"

# Auth
AUTH_SECRET="generate-with: openssl rand -base64 32"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me-on-deploy"

# Blog
NEXT_PUBLIC_BLOG_NAME="MyBlog"
NEXT_PUBLIC_BLOG_DESCRIPTION="前端 · 后端 · DevOps"
```

复制为 `.env.local` 并填入实际值。

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, shadcn/ui, and Prisma

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Prisma 数据模型

**Files:**
- Write: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: 编写 Prisma Schema**

写入 `prisma/schema.prisma`：

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id           String    @id @default(cuid())
  title        String
  slug         String    @unique
  content      String    @db.Text
  excerpt      String?   @db.Text
  coverImage   String?
  status       Status    @default(DRAFT)
  publishedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  authorId     String
  author       User      @relation(fields: [authorId], references: [id])
  tags         PostTag[]
  comments     Comment[]
  searchVector Unsupported("tsvector")?

  @@index([status, publishedAt])
  @@index([slug])
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  slug  String    @unique
  posts PostTag[]
}

model PostTag {
  postId String
  tagId  String
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}

model Comment {
  id          String    @id @default(cuid())
  content     String    @db.Text
  authorName  String
  authorEmail String?
  parentId    String?
  parent      Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies     Comment[] @relation("CommentReplies")
  postId      String
  post        Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  isApproved  Boolean   @default(false)
  createdAt   DateTime  @default(now())

  @@index([postId, isApproved])
}
```

- [ ] **Step 2: 创建全文搜索触发器迁移**

```bash
npx prisma migrate dev --name init --create-only
```

在生成的迁移 SQL 文件末尾添加：

```sql
CREATE OR REPLACE FUNCTION update_post_search_vector() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', COALESCE(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."content", '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_search_trigger
  BEFORE INSERT OR UPDATE ON "Post"
  FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();
```

```bash
npx prisma migrate dev
```
Expected: 迁移执行成功，数据库表创建完成。

- [ ] **Step 3: 创建 Prisma 客户端单例**

写入 `src/lib/prisma.ts`：

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations src/lib/prisma.ts
git commit -m "feat: add Prisma schema with User, Post, Tag, Comment models

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: 种子脚本

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: 编写种子脚本**

写入 `prisma/seed.ts`：

```typescript
import { PrismaClient, Status } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("ADMIN_PASSWORD environment variable is required");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists, skipping.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, password: hashed },
  });
  console.log(`Created admin user: ${user.username}`);

  // 创建示例标签
  const tagNames = ["React", "TypeScript", "Node.js", "DevOps", "API", "前端", "后端"];
  for (const name of tagNames) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/\./g, "-") },
    });
  }
  console.log("Seed tags created.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: 注册 seed 命令到 package.json**

编辑 `package.json`，在顶层添加：

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

```bash
npm install -D tsx
```

- [ ] **Step 3: 验证种子脚本**

```bash
npx prisma db seed
```
Expected: `Created admin user: admin` + `Seed tags created.`

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed script for admin user and initial tags

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: 认证系统（NextAuth v5）

**Files:**
- Create: `src/lib/auth.config.ts`, `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/lib/validators.ts` (login schema)

- [ ] **Step 1: 编写认证配置**

写入 `src/lib/auth.config.ts`：

```typescript
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname === "/admin/login";

      if (isOnAdmin) {
        if (isLoggedIn && isOnLogin) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        if (!isLoggedIn && !isOnLogin) {
          return Response.redirect(new URL("/admin/login", nextUrl));
        }
        return true;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

- [ ] **Step 2: 编写 auth 入口**

写入 `src/lib/auth.ts`：

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "./validators";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.username };
      },
    }),
  ],
  session: { strategy: "jwt" },
});
```

- [ ] **Step 3: 编写验证器**

写入 `src/lib/validators.ts`：

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

export const postSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "Slug 不能为空").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 格式无效"),
  content: z.string().min(1, "内容不能为空"),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tagIds: z.array(z.string()),
});

export const commentSchema = z.object({
  content: z.string().min(1, "评论不能为空").max(5000),
  authorName: z.string().min(1, "昵称不能为空").max(50),
  authorEmail: z.string().email("邮箱格式无效").optional().or(z.literal("")),
  parentId: z.string().optional(),
  postId: z.string(),
  captchaAnswer: z.number(),
});
```

- [ ] **Step 4: 创建 API 路由**

写入 `src/app/api/auth/[...nextauth]/route.ts`：

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 5: 创建登录页面**

写入 `src/app/admin/login/page.tsx`：

```typescript
"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError("");
    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("用户名或密码错误");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">管理后台登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" {...register("username")} autoFocus />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 6: 验证认证流程**

```bash
# 确保 .env.local 已填入 AUTH_SECRET
openssl rand -base64 32
```
Expected: 访问 `/admin/login` 显示登录页；输入正确凭据登录后跳转到 `/admin`；未登录访问 `/admin` 被重定向到 `/admin/login`。

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.config.ts src/lib/auth.ts src/lib/validators.ts src/app/api/auth src/app/admin/login
git commit -m "feat: add NextAuth v5 authentication with credentials provider

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Post CRUD API

**Files:**
- Create: `src/app/api/posts/route.ts`, `src/app/api/posts/[id]/route.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: 编写工具函数**

写入 `src/lib/utils.ts`：

```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function generateUniqueSlug(
  baseSlug: string,
  prisma: { post: { findUnique: Function } },
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) return slug;
    slug = `${baseSlug}-${++counter}`;
  }
}
```

- [ ] **Step 2: POST /api/posts（创建文章）**

写入 `src/app/api/posts/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { generateUniqueSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PUBLISHED";
  const tag = searchParams.get("tag");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Number(searchParams.get("limit")) || 10);

  const where: Record<string, unknown> = { status };
  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { tags: { include: { tag: true } }, _count: { select: { comments: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.tag),
      searchVector: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.errors[0].message } }, { status: 400 });
  }

  const { title, slug: rawSlug, content, excerpt, coverImage, status: postStatus, tagIds } = parsed.data;
  const slug = await generateUniqueSlug(rawSlug || slugify(title), prisma);

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      status: postStatus,
      publishedAt: postStatus === "PUBLISHED" ? new Date() : null,
      authorId: session.user.id as string,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json(
    { ...post, tags: post.tags.map((t) => t.tag), searchVector: undefined },
    { status: 201 }
  );
}
```

- [ ] **Step 3: GET/PUT/DELETE /api/posts/[id]**

写入 `src/app/api/posts/[id]/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { generateUniqueSlug, slugify } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!post) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "文章未找到" } }, { status: 404 });
  }
  return NextResponse.json({
    ...post,
    tags: post.tags.map((t) => t.tag),
    searchVector: undefined,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.errors[0].message } }, { status: 400 });
  }

  const { title, slug: rawSlug, content, excerpt, coverImage, status: postStatus, tagIds } = parsed.data;
  const slug = await generateUniqueSlug(rawSlug || slugify(title), prisma, id);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "文章未找到" } }, { status: 404 });
  }

  const publishedAt = postStatus === "PUBLISHED" && !existing.publishedAt
    ? new Date()
    : existing.publishedAt;

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      status: postStatus,
      publishedAt,
      tags: {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json({
    ...post,
    tags: post.tags.map((t) => t.tag),
    searchVector: undefined,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 });
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/posts src/lib/utils.ts
git commit -m "feat: add Post CRUD API with auth protection and slug deduplication

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: 管理后台布局与仪表盘

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/layout/admin-sidebar.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: 创建侧边栏组件**

写入 `src/components/layout/admin-sidebar.tsx`：

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/posts/new", label: "新建文章" },
  { href: "/admin/comments", label: "评论审核" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-bg-secondary border-r border-border p-4 flex flex-col">
      <Link href="/admin" className="text-xl font-bold mb-8 text-accent">
        MyBlog Admin
      </Link>
      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm transition-colors",
              pathname === link.href
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-primary"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 pt-4 border-t border-border">
        <Link
          href="/"
          className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
        >
          ← 返回博客
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-text-secondary"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          退出登录
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: 创建管理后台布局（含认证守卫）**

写入 `src/app/admin/layout.tsx`：

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      {/* 移动端汉堡菜单 */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-56">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: 创建仪表盘页面**

写入 `src/app/admin/page.tsx`：

```typescript
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboard() {
  const [publishedCount, draftCount, pendingComments, recentPosts] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.comment.findMany({
      where: { isApproved: false },
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-4xl">{publishedCount}</CardTitle></CardHeader>
          <CardContent><p className="text-text-secondary">已发布</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-4xl">{draftCount}</CardTitle></CardHeader>
          <CardContent><p className="text-text-secondary">草稿</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-4xl">{pendingComments.length}</CardTitle></CardHeader>
          <CardContent><p className="text-text-secondary">待审核评论</p></CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-text-primary">快捷操作</h2>
        <div className="flex gap-2">
          <Button asChild><Link href="/admin/posts/new">+ 新建文章</Link></Button>
          {pendingComments.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/admin/comments">审核评论 ({pendingComments.length})</Link>
            </Button>
          )}
        </div>
      </div>

      {pendingComments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">最新评论（待审核）</h2>
          {pendingComments.slice(0, 5).map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">{comment.authorName}</p>
                    <p className="text-sm text-text-secondary">{comment.content.slice(0, 100)}...</p>
                    <p className="text-xs text-text-secondary mt-1">
                      文章：《{comment.post.title}》
                      {comment.post.slug && <span> · {comment.post.slug}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/comments/${comment.id}`} method="PATCH">
                      <input type="hidden" name="isApproved" value="true" />
                      <Button type="submit" size="sm">通过</Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-text-primary">最近文章</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary">
              <tr>
                <th className="text-left px-4 py-2 text-text-secondary">标题</th>
                <th className="text-left px-4 py-2 text-text-secondary">状态</th>
                <th className="text-left px-4 py-2 text-text-secondary">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <Link href={`/admin/posts/${post.id}/edit`} className="text-accent hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                      {post.status === "PUBLISHED" ? "已发布" : post.status === "DRAFT" ? "草稿" : "归档"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-text-secondary">
                    {post.updatedAt.toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/page.tsx src/components/layout/admin-sidebar.tsx
git commit -m "feat: add admin layout with sidebar, auth guard, and dashboard

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: TipTap 编辑器组件

**Files:**
- Create: `src/components/editor/tip-tap-editor.tsx`, `src/components/editor/editor-toolbar.tsx`

- [ ] **Step 1: 创建编辑器组件**

写入 `src/components/editor/tip-tap-editor.tsx`：

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./editor-toolbar";
import { useEffect } from "react";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (json: string) => void;
  placeholder?: string;
}

export function TipTapEditor({ content, onChange, placeholder = "开始写作..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder }),
    ],
    content: content ? JSON.parse(content) : "",
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px]",
      },
    },
  });

  // 自动保存到 localStorage（防意外关闭丢失）
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor) {
        localStorage.setItem("draft-content", JSON.stringify(editor.getJSON()));
        localStorage.setItem("draft-saved-at", new Date().toISOString());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [editor]);

  return (
    <div className="border border-border rounded-lg bg-bg-secondary">
      <EditorToolbar editor={editor} />
      <div className="px-6 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建工具栏组件**

写入 `src/components/editor/editor-toolbar.tsx`：

```typescript
"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Code, Quote, Link, Image, Minus, List, ListOrdered
} from "lucide-react";

interface ToolbarButton {
  icon: React.ElementType;
  action: () => void;
  isActive: boolean;
  title: string;
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const buttons: ToolbarButton[] = [
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive("heading", { level: 1 }), title: "H1" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive("heading", { level: 2 }), title: "H2" },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive("heading", { level: 3 }), title: "H3" },
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold"), title: "加粗" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic"), title: "斜体" },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive("codeBlock"), title: "代码块" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive("blockquote"), title: "引用" },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), isActive: false, title: "分隔线" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-border bg-bg-primary rounded-t-lg sticky top-0 z-10">
      {buttons.map((btn) => (
        <Button
          key={btn.title}
          variant={btn.isActive ? "default" : "ghost"}
          size="sm"
          onClick={btn.action}
          title={btn.title}
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("链接 URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        title="链接"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("图片 URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        title="图片"
      >
        <Image className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: 安装 lowlight**

```bash
npm install lowlight
```
Expected: 安装成功。

- [ ] **Step 4: Commit**

```bash
git add src/components/editor
git commit -m "feat: add TipTap editor with toolbar and auto-save

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: 文章管理页面（列表、新建、编辑）

**Files:**
- Create: `src/app/admin/posts/page.tsx`
- Create: `src/app/admin/posts/new/page.tsx`
- Create: `src/app/admin/posts/[id]/edit/page.tsx`

- [ ] **Step 1: 文章列表管理页**

写入 `src/app/admin/posts/page.tsx`：

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Post {
  id: string; title: string; slug: string; status: string;
  publishedAt: string | null; updatedAt: string;
  tags: { id: string; name: string }[];
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts));
  }, [filter]);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel = (s: string) =>
    s === "PUBLISHED" ? "已发布" : s === "DRAFT" ? "草稿" : "归档";

  const statusVariant = (s: string) =>
    s === "PUBLISHED" ? "default" : s === "DRAFT" ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">文章管理</h1>
        <Button asChild><Link href="/admin/posts/new">+ 新建文章</Link></Button>
      </div>
      <div className="flex gap-2">
        {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s === "ALL" ? "全部" : statusLabel(s)}
          </Button>
        ))}
        <Input
          placeholder="搜索标题..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs ml-auto"
        />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="text-left px-4 py-2">标题</th>
              <th className="text-left px-4 py-2">状态</th>
              <th className="text-left px-4 py-2">标签</th>
              <th className="text-left px-4 py-2">更新时间</th>
              <th className="text-left px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id} className="border-t border-border hover:bg-bg-secondary/50">
                <td className="px-4 py-2 font-medium">{post.title}</td>
                <td className="px-4 py-2"><Badge variant={statusVariant(post.status)}>{statusLabel(post.status)}</Badge></td>
                <td className="px-4 py-2">
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.map((tag) => <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-2 text-text-secondary">{new Date(post.updatedAt).toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/posts/${post.id}/edit`)}>编辑</Button>
                    <Button size="sm" variant="ghost" className="text-red-500"
                      onClick={async () => {
                        if (!confirm("确定删除？")) return;
                        await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
                        setPosts((prev) => prev.filter((p) => p.id !== post.id));
                      }}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 新建文章页（含编辑器）**

写入 `src/app/admin/posts/new/page.tsx`：

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TipTapEditor } from "@/components/editor/tip-tap-editor";
import { slugify } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PostForm = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: { status: "DRAFT", tagIds: [] },
  });

  const title = watch("title");

  // 加载已有标签
  useState(() => {
    fetch("/api/tags").then((r) => r.json()).then(setAllTags);
  });

  function addTag(tag: { id: string; name: string }) {
    if (!tags.find((t) => t.id === tag.id)) {
      setTags([...tags, tag]);
      setValue("tagIds", [...tags.map((t) => t.id), tag.id]);
    }
    setTagInput("");
  }

  function removeTag(tagId: string) {
    const next = tags.filter((t) => t.id !== tagId);
    setTags(next);
    setValue("tagIds", next.map((t) => t.id));
  }

  async function onSubmit(data: PostForm, status: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    const body = { ...data, content, status, tagIds: tags.map((t) => t.id) };
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const post = await res.json();
      router.push(`/admin/posts/${post.id}/edit`);
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error?.message || "保存失败");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>← 返回文章列表</Button>
        <div className="flex gap-2">
          <Button variant="outline" disabled={saving} onClick={handleSubmit((d) => onSubmit(d, "DRAFT"))}>
            保存草稿
          </Button>
          <Button disabled={saving} onClick={handleSubmit((d) => onSubmit(d, "PUBLISHED"))}>
            发布
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Input
          {...register("title")}
          placeholder="文章标题"
          className="text-4xl font-bold border-none px-0 focus-visible:ring-0"
          onChange={(e) => {
            register("title").onChange(e);
            setValue("slug", slugify(e.target.value));
          }}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="flex flex-wrap gap-1 items-center">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag.id)}>
            {tag.name} ×
          </Badge>
        ))}
        <div className="relative">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="添加标签..."
            className="w-32 h-7 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput) {
                e.preventDefault();
                const existing = allTags.find((t) => t.name === tagInput);
                if (existing) { addTag(existing); }
                else {
                  fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: tagInput }) })
                    .then((r) => r.json())
                    .then((tag) => { setAllTags([...allTags, tag]); addTag(tag); });
                }
              }
            }}
          />
        </div>
      </div>

      <TipTapEditor content={content} onChange={setContent} />
      {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}

      <div className="space-y-2">
        <Label>摘要</Label>
        <Textarea {...register("excerpt")} placeholder="文章摘要（可选）" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input {...register("slug")} placeholder="article-slug" />
        {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 编辑文章页**

写入 `src/app/admin/posts/[id]/edit/page.tsx`：

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TipTapEditor } from "@/components/editor/tip-tap-editor";
import { Skeleton } from "@/components/ui/skeleton";

type PostForm = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([post, tags]) => {
      setAllTags(tags);
      setTags(post.tags || []);
      setContent(post.content);
      setValue("title", post.title);
      setValue("slug", post.slug);
      setValue("excerpt", post.excerpt || "");
      setValue("status", post.status);
      setValue("tagIds", (post.tags || []).map((t: { id: string }) => t.id));
      setLoading(false);
    });
  }, [id, setValue]);

  function addTag(tag: { id: string; name: string }) {
    if (!tags.find((t) => t.id === tag.id)) {
      setTags([...tags, tag]);
      setValue("tagIds", [...tags.map((t) => t.id), tag.id]);
    }
    setTagInput("");
  }

  function removeTag(tagId: string) {
    const next = tags.filter((t) => t.id !== tagId);
    setTags(next);
    setValue("tagIds", next.map((t) => t.id));
  }

  async function onSubmit(data: PostForm, status: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    const body = { ...data, content, status, tagIds: tags.map((t) => t.id) };
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error?.message || "保存失败");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const title = watch("title");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/posts")}>← 返回文章列表</Button>
        <div className="flex gap-2 text-sm text-text-secondary items-center">
          字数：{content.replace(/<[^>]*>/g, "").length} 字
          <Button variant="outline" disabled={saving} onClick={handleSubmit((d) => onSubmit(d, "DRAFT"))}>
            保存草稿
          </Button>
          <Button disabled={saving} onClick={handleSubmit((d) => onSubmit(d, "PUBLISHED"))}>
            {saving ? "保存中..." : "发布"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Input
          {...register("title")}
          placeholder="文章标题"
          className="text-4xl font-bold border-none px-0 focus-visible:ring-0"
        />
      </div>

      <div className="flex flex-wrap gap-1 items-center">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag.id)}>
            {tag.name} ×
          </Badge>
        ))}
        <div className="relative">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="添加标签..."
            className="w-32 h-7 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput) {
                e.preventDefault();
                const existing = allTags.find((t) => t.name === tagInput);
                if (existing) { addTag(existing); }
                else {
                  fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: tagInput }) })
                    .then((r) => r.json())
                    .then((tag) => { setAllTags([...allTags, tag]); addTag(tag); });
                }
              }
            }}
          />
        </div>
      </div>

      <TipTapEditor content={content} onChange={setContent} />

      <div className="space-y-2">
        <Label>摘要</Label>
        <Textarea {...register("excerpt")} placeholder="文章摘要（可选）" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input {...register("slug")} />
      </div>

      <input type="hidden" {...register("status")} />
    </div>
  );
}
```

- [ ] **Step 4: 创建标签 API**

写入 `src/app/api/tags/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: { code: "VALIDATION", message: "标签名不能为空" } }, { status: 400 });
  }

  const tag = await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name, slug: slugify(name) },
  });

  return NextResponse.json(tag, { status: 201 });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/posts src/app/api/tags
git commit -m "feat: add post management pages and tag API

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: 公开布局与首页

**Files:**
- Create: `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, `src/components/layout/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/components/post/post-card.tsx`

- [ ] **Step 1: 创建主题切换组件**

写入 `src/components/layout/theme-toggle.tsx`：

```typescript
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <Button variant="ghost" size="icon" disabled><Sun className="h-5 w-5" /></Button>;

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
```

- [ ] **Step 2: 创建 Header 组件**

写入 `src/components/layout/header.tsx`：

```typescript
"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-text-primary hover:text-accent transition-colors">
          MyBlog
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/tags" className="text-sm text-text-secondary hover:text-text-primary">标签</Link>
          <Link href="/search" className="text-sm text-text-secondary hover:text-text-primary">搜索</Link>
          <SearchDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 创建 Footer 组件**

写入 `src/components/layout/footer.tsx`：

```typescript
export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-text-secondary">
        <p>© {new Date().getFullYear()} MyBlog ·{" "}
          <a href="/rss.xml" className="hover:text-accent" target="_blank" rel="noopener">
            RSS 订阅
          </a>
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: 创建文章卡片组件**

写入 `src/components/post/post-card.tsx`：

```typescript
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  tags: { id: string; name: string; slug: string }[];
}

export function PostCard({ title, slug, excerpt, publishedAt, tags }: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`}>
      <Card className="p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-bg-secondary border-border">
        {publishedAt && (
          <time className="text-sm text-text-secondary mb-2 block">
            {new Date(publishedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })}
          </time>
        )}
        <h2 className="text-xl font-bold text-text-primary mb-2 hover:text-accent transition-colors">
          {title}
        </h2>
        {excerpt && (
          <p className="text-text-secondary text-sm line-clamp-2 mb-3">{excerpt}</p>
        )}
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 5: 更新根布局**

覆写 `src/app/layout.tsx`：

```typescript
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import "@/styles/tokens.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BLOG_NAME || "MyBlog",
  description: process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || "",
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary text-text-primary font-sans antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: 创建首页**

写入 `src/app/page.tsx`：

```typescript
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const limit = 10;
  const tagFilter = params.tag;

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (tagFilter) {
    where.tags = { some: { tag: { slug: tagFilter } } };
  }

  const [posts, total, allTags] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
    prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      {/* 标签筛选栏 */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/"
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            !tagFilter ? "bg-accent text-white" : "bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          全部
        </a>
        {allTags.map((tag) => (
          <a
            key={tag.id}
            href={`/?tag=${tag.slug}`}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              tagFilter === tag.slug ? "bg-accent text-white" : "bg-bg-secondary text-text-secondary hover:text-text-primary"
            }`}
          >
            {tag.name}
          </a>
        ))}
      </div>

      {/* 文章列表 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            title={post.title}
            slug={post.slug}
            excerpt={post.excerpt}
            publishedAt={post.publishedAt?.toISOString() || null}
            tags={post.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug }))}
          />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={`/?page=${page - 1}${tagFilter ? `&tag=${tagFilter}` : ""}`} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink href={`/?page=${p}${tagFilter ? `&tag=${tagFilter}` : ""}`} isActive={p === page}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={`/?page=${page + 1}${tagFilter ? `&tag=${tagFilter}` : ""}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {posts.length === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <p className="text-lg">暂无文章</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/footer.tsx src/components/layout/theme-toggle.tsx src/components/post/post-card.tsx src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add public layout with header, footer, theme toggle, and homepage

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: 文章详情页与内容渲染

**Files:**
- Create: `src/app/posts/[slug]/page.tsx`
- Create: `src/components/post/post-content.tsx`, `src/components/post/reading-progress.tsx`
- Create: `src/lib/content.ts`

- [ ] **Step 1: 内容渲染工具**

写入 `src/lib/content.ts`：

```typescript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

// 从 TipTap JSON 提取纯文本（用于 RSS、摘要等）
export function extractTextFromTipTap(json: string): string {
  try {
    const doc = JSON.parse(json);
    const texts: string[] = [];
    function walk(node: Record<string, unknown>) {
      if (node.text) texts.push(node.text as string);
      if (node.content && Array.isArray(node.content)) {
        (node.content as Array<Record<string, unknown>>).forEach(walk);
      }
    }
    walk(doc);
    return texts.join(" ").slice(0, 300);
  } catch {
    return "";
  }
}

// 从 HTML 提取纯文本（用于已有 HTML 内容）
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
```

```bash
npm install unified remark-parse remark-gfm
```

- [ ] **Step 2: 创建阅读进度条组件**

写入 `src/components/post/reading-progress.tsx`：

```typescript
"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-bg-secondary">
      <div
        className="h-full bg-accent transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 3: 创建文章内容渲染组件**

写入 `src/components/post/post-content.tsx`：

```typescript
import { CodeBlock } from "@/components/code/code-block";

interface PostContentProps {
  content: string; // TipTap JSON string
}

export function PostContent({ content }: PostContentProps) {
  const doc = JSON.parse(content);

  function renderNode(node: Record<string, unknown>, index: number): React.ReactNode {
    switch (node.type) {
      case "doc":
        return (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {(node.content as Array<Record<string, unknown>>)?.map((n, i) => renderNode(n, i))}
          </div>
        );

      case "heading": {
        const Tag = `h${node.attrs?.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <Tag key={index} className="scroll-mt-20" id={node.attrs?.id as string}>
            {(node.content as Array<Record<string, unknown>>)?.map((n, i) => renderNode(n, i))}
          </Tag>
        );
      }

      case "paragraph":
        return (
          <p key={index}>
            {(node.content as Array<Record<string, unknown>>)?.map((n, i) => renderNode(n, i))}
          </p>
        );

      case "text": {
        let el: React.ReactNode = (node.text as string) || "";
        if (node.marks) {
          for (const mark of node.marks as Array<Record<string, unknown>>) {
            switch (mark.type) {
              case "bold": el = <strong key={index}>{el}</strong>; break;
              case "italic": el = <em key={index}>{el}</em>; break;
              case "code": el = <code key={index} className="px-1 py-0.5 bg-bg-secondary rounded text-sm font-mono">{el}</code>; break;
              case "link":
                el = <a key={index} href={mark.attrs?.href as string} className="text-accent hover:underline" target="_blank" rel="noopener">{el}</a>;
                break;
            }
          }
        }
        return <span key={index}>{el}</span>;
      }

      case "codeBlock":
        return (
          <CodeBlock
            key={index}
            code={(node.content as Array<{ text: string }>)?.[0]?.text || ""}
            language={(node.attrs?.language as string) || "text"}
            filename={(node.attrs?.filename as string)}
          />
        );

      case "blockquote":
        return (
          <blockquote key={index} className="border-l-4 border-accent pl-4 italic">
            {(node.content as Array<Record<string, unknown>>)?.map((n, i) => renderNode(n, i))}
          </blockquote>
        );

      case "horizontalRule":
        return <hr key={index} className="my-8 border-border" />;

      case "image":
        return (
          <img
            key={index}
            src={node.attrs?.src as string}
            alt={node.attrs?.alt as string || ""}
            className="rounded-lg max-w-full"
          />
        );

      case "bulletList":
      case "orderedList": {
        const Tag = node.type === "bulletList" ? "ul" : "ol";
        return (
          <Tag key={index} className="pl-6 space-y-1">
            {(node.content as Array<Record<string, unknown>>)?.map((n, i) => renderNode(n, i))}
          </Tag>
        );
      }

      case "listItem":
        return (
          <li key={index}>
            {(node.content as Array<Record<string, unknown>>)?.map((n, i) => renderNode(n, i))}
          </li>
        );

      default:
        return null;
    }
  }

  return <>{renderNode(doc, 0)}</>;
}
```

- [ ] **Step 4: 创建文章详情页**

写入 `src/app/posts/[slug]/page.tsx`：

```typescript
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PostContent } from "@/components/post/post-content";
import { ReadingProgress } from "@/components/post/reading-progress";
import { Badge } from "@/components/ui/badge";
import { CommentList } from "@/components/comment/comment-list";
import { CommentForm } from "@/components/comment/comment-form";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "未找到" };

  return {
    title: `${post.title} | MyBlog`,
    description: post.excerpt || "",
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: { include: { tag: true } },
      comments: {
        where: { isApproved: true, parentId: null },
        include: { replies: { where: { isApproved: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post || (post.status !== "PUBLISHED")) {
    notFound();
  }

  const prev = await prisma.post.findFirst({
    where: { status: "PUBLISHED", publishedAt: { lt: post.publishedAt! } },
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true },
  });

  const next = await prisma.post.findFirst({
    where: { status: "PUBLISHED", publishedAt: { gt: post.publishedAt! } },
    orderBy: { publishedAt: "asc" },
    select: { title: true, slug: true },
  });

  return (
    <>
      <ReadingProgress />
      <article className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-4">
          <Link href="/" className="text-sm text-text-secondary hover:text-accent">← 返回首页</Link>
          <h1 className="text-4xl font-bold text-text-primary leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            {post.publishedAt && (
              <time>{post.publishedAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</time>
            )}
            <span>·</span>
            <span>{Math.ceil(post.content.length / 500)} 分钟阅读</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((t) => (
              <Link key={t.tag.id} href={`/tags/${t.tag.slug}`}>
                <Badge variant="secondary">{t.tag.name}</Badge>
              </Link>
            ))}
          </div>
        </header>

        <PostContent content={post.content} />

        {/* 分享按钮 */}
        <div className="flex gap-2 pt-8 border-t border-border">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`/posts/${post.slug}`)}`}
            target="_blank"
            rel="noopener"
            className="text-sm text-text-secondary hover:text-accent"
          >
            🐦 Twitter
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="text-sm text-text-secondary hover:text-accent"
          >
            📋 复制链接
          </button>
        </div>

        {/* 上一篇 / 下一篇 */}
        <nav className="flex justify-between pt-4 border-t border-border text-sm">
          {prev ? (
            <Link href={`/posts/${prev.slug}`} className="text-accent hover:underline">← {prev.title}</Link>
          ) : <div />}
          {next ? (
            <Link href={`/posts/${next.slug}`} className="text-accent hover:underline text-right">{next.title} →</Link>
          ) : <div />}
        </nav>

        {/* 评论区 */}
        <section className="space-y-6 pt-8 border-t border-border">
          <h2 className="text-xl font-bold text-text-primary">评论 ({post.comments.length})</h2>
          <CommentList comments={post.comments} />
          <CommentForm postId={post.id} />
        </section>
      </article>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/posts src/components/post/post-content.tsx src/components/post/reading-progress.tsx src/lib/content.ts
git commit -m "feat: add post detail page with content rendering, reading progress, and prev/next navigation

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 11: 代码高亮组件（Shiki）

**Files:**
- Create: `src/components/code/code-block.tsx`

- [ ] **Step 1: 编写 Shiki 代码块组件**

写入 `src/components/code/code-block.tsx`：

```typescript
import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: ["typescript", "javascript", "tsx", "jsx", "python", "css", "html", "json", "bash", "sql", "yaml", "markdown", "rust", "go", "java", "text"],
    });
  }
  return highlighter;
}

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export async function CodeBlock({ code, language, filename, showLineNumbers = true }: CodeBlockProps) {
  const h = await getHighlighter();

  const lang = h.getLoadedLanguages().includes(language) ? language : "text";

  try {
    const darkHtml = h.codeToHtml(code.trimEnd(), { lang, theme: "github-dark" });
    const lightHtml = h.codeToHtml(code.trimEnd(), { lang, theme: "github-light" });

    return (
      <div className="my-6 rounded-lg overflow-hidden border border-border group/code">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border text-xs text-text-secondary font-mono">
          <span>{filename || lang}</span>
          <CopyButton code={code.trimEnd()} />
        </div>
        {/* 深色主题（默认可见） */}
        <div className="dark:hidden [&_pre]:!bg-bg-secondary [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm [&_.line]:pr-4">
          <div dangerouslySetInnerHTML={{ __html: lightHtml }} />
        </div>
        {/* 浅色主题 */}
        <div className="hidden dark:block [&_pre]:!bg-bg-secondary [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm [&_.line]:pr-4">
          <div dangerouslySetInnerHTML={{ __html: darkHtml }} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border text-xs text-text-secondary">
          <span>{filename || language}</span>
          <CopyButton code={code.trimEnd()} />
        </div>
        <pre className="p-4 overflow-x-auto bg-bg-secondary text-sm font-mono">
          <code>{code.trimEnd()}</code>
        </pre>
      </div>
    );
  }
}

// 客户端复制按钮
function CopyButton({ code }: { code: string }) {
  return (
    <button
      onClick={async (e) => {
        await navigator.clipboard.writeText(code);
        const btn = e.currentTarget;
        btn.textContent = "✅ 已复制";
        setTimeout(() => { btn.textContent = "📋 复制"; }, 2000);
      }}
      className="opacity-0 group-hover/code:opacity-100 transition-opacity text-text-secondary hover:text-text-primary"
    >
      📋 复制
    </button>
  );
}
```

- [ ] **Step 2: 验证 Shiki 正确加载**

```bash
npm run dev
```
Expected: 访问包含代码块的文章，代码高亮正常显示，深色/浅色主题正确切换。

- [ ] **Step 3: Commit**

```bash
git add src/components/code/code-block.tsx
git commit -m "feat: add Shiki-based code block with dual theme, line numbers, and copy button

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 12: 标签页面

**Files:**
- Create: `src/app/tags/page.tsx`, `src/app/tags/[tag]/page.tsx`

- [ ] **Step 1: 标签云页面**

写入 `src/app/tags/page.tsx`：

```typescript
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "标签 | MyBlog" };

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  const maxCount = Math.max(...tags.map((t) => t._count.posts), 1);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">标签</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => {
          const ratio = tag._count.posts / maxCount;
          const size = ratio > 0.8 ? "text-2xl" : ratio > 0.5 ? "text-xl" : ratio > 0.3 ? "text-lg" : "text-base";
          return (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={`${size} px-3 py-1 rounded-full bg-bg-secondary hover:bg-accent hover:text-white transition-colors text-text-secondary hover:text-white`}
            >
              {tag.name}
              <span className="text-xs ml-1 opacity-60">({tag._count.posts})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 按标签筛选页面**

写入 `src/app/tags/[tag]/page.tsx`：

```typescript
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

interface Props { params: Promise<{ tag: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `${tag} | MyBlog` };
}

export default async function TagPage({ params }: Props) {
  const { tag: tagSlug } = await params;

  const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
  if (!tag) notFound();

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", tags: { some: { tagId: tag.id } } },
    include: { tags: { include: { tag: true } } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/tags" className="text-sm text-text-secondary hover:text-accent">← 标签云</Link>
        <h1 className="text-2xl font-bold text-text-primary">#{tag.name}</h1>
        <span className="text-sm text-text-secondary">({posts.length} 篇文章)</span>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            title={post.title}
            slug={post.slug}
            excerpt={post.excerpt}
            publishedAt={post.publishedAt?.toISOString() || null}
            tags={post.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug }))}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/tags
git commit -m "feat: add tag cloud and tag-filtered post pages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 13: 全文搜索

**Files:**
- Create: `src/app/api/search/route.ts`, `src/lib/search.ts`
- Create: `src/app/search/page.tsx`, `src/components/search/search-dialog.tsx`

- [ ] **Step 1: 搜索工具库**

写入 `src/lib/search.ts`：

```typescript
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  headline: string;
  publishedAt: Date | null;
  rank: number;
}

export async function searchPosts(query: string, limit = 10): Promise<SearchResult[]> {
  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      ts_headline('english', p."content", plainto_tsquery('english', ${query}),
        'MaxWords=50, MinWords=20, ShortWord=3, MaxFragments=3, FragmentDelimiter=\"...\"'
      ) as headline,
      p."publishedAt",
      ts_rank(p."searchVector"::tsvector, plainto_tsquery('english', ${query})) as rank
    FROM "Post" p
    WHERE p.status = 'PUBLISHED'
      AND p."searchVector"::tsvector @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT ${limit}
  `;

  return results;
}
```

- [ ] **Step 2: 搜索 API**

写入 `src/app/api/search/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchPosts(q.trim());
  return NextResponse.json({ results });
}
```

- [ ] **Step 3: 搜索页面**

写入 `src/app/search/page.tsx`：

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post/post-card";
import { useDebounce } from "use-debounce";
import Link from "next/link";

interface SearchResult {
  id: string; title: string; slug: string; excerpt: string | null;
  headline: string; publishedAt: string | null; rank: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debounced] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debounced.length < 2) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results));
  }, [debounced]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">搜索</h1>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索文章..."
        className="text-lg py-6"
        autoFocus
      />
      {loading && <p className="text-text-secondary">搜索中...</p>}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <p>未找到相关内容</p>
          <p className="text-sm mt-2">
            试试浏览 <Link href="/tags" className="text-accent hover:underline">标签云</Link>
          </p>
        </div>
      )}
      <div className="space-y-4">
        {results.map((r) => (
          <Link key={r.id} href={`/posts/${r.slug}`} className="block">
            <div className="p-4 rounded-lg border border-border bg-bg-secondary hover:bg-bg-primary transition-colors">
              <h3 className="text-lg font-bold text-text-primary">{r.title}</h3>
              {r.headline && (
                <p className="text-sm text-text-secondary mt-1" dangerouslySetInnerHTML={{ __html: r.headline }} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

```bash
npm install use-debounce
```

- [ ] **Step 4: 搜索弹窗组件（Cmd+K）**

写入 `src/components/search/search-dialog.tsx`：

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced] = useDebounce(query, 300);
  const [results, setResults] = useState<Array<{ id: string; title: string; slug: string }>>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (debounced.length < 2) { setResults([]); return; }
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || []));
  }, [debounced]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput value={query} onValueChange={setQuery} placeholder="搜索文章..." />
      <CommandList>
        <CommandEmpty>未找到结果</CommandEmpty>
        <CommandGroup heading="文章">
          {results.map((r) => (
            <CommandItem
              key={r.id}
              onSelect={() => { router.push(`/posts/${r.slug}`); setOpen(false); }}
            >
              {r.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/search src/app/search src/components/search src/lib/search.ts
git commit -m "feat: add full-text search with PostgreSQL tsvector, search page, and Cmd+K dialog

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 14: 评论系统

**Files:**
- Create: `src/app/api/comments/route.ts`, `src/app/api/comments/[id]/route.ts`
- Create: `src/components/comment/comment-form.tsx`, `src/components/comment/comment-list.tsx`, `src/components/comment/comment-item.tsx`
- Create: `src/app/admin/comments/page.tsx`

- [ ] **Step 1: 评论 API**

写入 `src/app/api/comments/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.errors[0].message } },
      { status: 400 }
    );
  }

  const { content, authorName, authorEmail, parentId, postId, captchaAnswer } = parsed.data;

  // 简单数学验证码
  if (captchaAnswer !== 8) {
    return NextResponse.json(
      { error: { code: "CAPTCHA", message: "验证码答案错误" } },
      { status: 400 }
    );
  }

  // 检查父评论是否在同一篇文章下，且层级不超过2层
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.postId !== postId) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "无效的父评论" } },
        { status: 400 }
      );
    }
    if (parent.parentId) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "最多支持两层嵌套回复" } },
        { status: 400 }
      );
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorName,
      authorEmail: authorEmail || null,
      parentId: parentId || null,
      postId,
      isApproved: false,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
```

写入 `src/app/api/comments/[id]/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const comment = await prisma.comment.update({
    where: { id },
    data: { isApproved: body.isApproved ?? true },
  });

  return NextResponse.json(comment);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 });
  }

  const { id } = await params;
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: 评论前端组件**

写入 `src/components/comment/comment-item.tsx`：

```typescript
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";
import { createHash } from "crypto";

interface CommentData {
  id: string; content: string; authorName: string; authorEmail: string | null;
  createdAt: string; replies?: CommentData[];
}

export function CommentItem({ comment, postId }: { comment: CommentData; postId: string }) {
  const [showReply, setShowReply] = useState(false);
  const gravatarUrl = comment.authorEmail
    ? `https://www.gravatar.com/avatar/${createHash("md5").update(comment.authorEmail.trim().toLowerCase()).digest("hex")}?d=identicon`
    : undefined;

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={gravatarUrl} />
          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-text-primary">{comment.authorName}</span>
            <time className="text-xs text-text-secondary">
              {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
            </time>
          </div>
          <p className="text-sm text-text-primary">{comment.content}</p>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowReply(!showReply)}>
            回复
          </Button>
          {showReply && (
            <div className="pt-2">
              <CommentForm postId={postId} parentId={comment.id} onSuccess={() => setShowReply(false)} />
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-border pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
```

写入 `src/components/comment/comment-form.tsx`：

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type CommentFormData = z.infer<typeof commentSchema>;

export function CommentForm({ postId, parentId, onSuccess }: {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { postId, parentId: parentId || undefined, captchaAnswer: 0 },
  });

  async function onSubmit(data: CommentFormData) {
    setSubmitting(true);
    setMessage("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("评论已提交，审核通过后显示");
      reset();
      onSuccess?.();
      router.refresh();
    } else {
      const err = await res.json();
      setMessage(err.error?.message || "提交失败");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <Input {...register("authorName")} placeholder="昵称 *" className="h-9" />
          {errors.authorName && <p className="text-xs text-red-500">{errors.authorName.message}</p>}
        </div>
        <div className="flex-1 space-y-1">
          <Input {...register("authorEmail")} placeholder="邮箱（可选，用于头像）" className="h-9" />
          {errors.authorEmail && <p className="text-xs text-red-500">{errors.authorEmail.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <Textarea {...register("content")} placeholder="写下你的评论..." rows={3} />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-text-secondary whitespace-nowrap">3 + 5 = ?</Label>
          <Input {...register("captchaAnswer", { valueAsNumber: true })} type="number" className="w-16 h-8" />
          {errors.captchaAnswer && <p className="text-xs text-red-500">{errors.captchaAnswer.message}</p>}
        </div>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "提交中..." : "提交评论"}
        </Button>
      </div>
      {message && <p className="text-sm text-text-secondary">{message}</p>}
      <input type="hidden" {...register("postId")} />
      <input type="hidden" {...register("parentId")} />
    </form>
  );
}
```

写入 `src/components/comment/comment-list.tsx`：

```typescript
import { CommentItem } from "./comment-item";

interface CommentData {
  id: string; content: string; authorName: string; authorEmail: string | null;
  createdAt: string; replies?: CommentData[];
}

export function CommentList({ comments }: { comments: CommentData[] }) {
  if (comments.length === 0) {
    return <p className="text-text-secondary text-sm">暂无评论，来抢沙发吧！</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId="" />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 评论管理页**

写入 `src/app/admin/comments/page.tsx`：

```typescript
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Comment {
  id: string; content: string; authorName: string; authorEmail: string | null;
  isApproved: boolean; createdAt: string;
  post: { title: string; slug: string };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetchComments();
  }, []);

  function fetchComments() {
    fetch("/api/comments?all=true").then((r) => r.json()).then(setComments);
  }

  async function toggleApproval(id: string, isApproved: boolean) {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    fetchComments();
  }

  const pending = comments.filter((c) => !c.isApproved);
  const approved = comments.filter((c) => c.isApproved);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-text-primary">评论审核</h1>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">待审核 ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">已通过 ({approved.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-2 mt-4">
          {pending.map((c) => (
            <CommentRow key={c.id} comment={c} onToggle={toggleApproval} />
          ))}
          {pending.length === 0 && <p className="text-text-secondary py-8 text-center">没有待审核评论</p>}
        </TabsContent>
        <TabsContent value="approved" className="space-y-2 mt-4">
          {approved.map((c) => (
            <CommentRow key={c.id} comment={c} onToggle={toggleApproval} />
          ))}
          {approved.length === 0 && <p className="text-text-secondary py-8 text-center">没有已通过评论</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommentRow({ comment, onToggle }: { comment: Comment; onToggle: (id: string, approved: boolean) => void }) {
  return (
    <div className="flex items-start justify-between p-4 border border-border rounded-lg bg-bg-secondary">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6"><AvatarFallback>{comment.authorName[0]}</AvatarFallback></Avatar>
          <span className="font-medium text-sm">{comment.authorName}</span>
          <span className="text-xs text-text-secondary">
            {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
        <p className="text-sm text-text-primary">{comment.content}</p>
        <p className="text-xs text-text-secondary">文章：《{comment.post.title}》</p>
      </div>
      <div className="flex gap-1">
        {!comment.isApproved ? (
          <Button size="sm" onClick={() => onToggle(comment.id, true)}>通过</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onToggle(comment.id, false)}>隐藏</Button>
        )}
        <Button size="sm" variant="ghost" className="text-red-500"
          onClick={async () => {
            if (!confirm("确定删除？")) return;
            await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
            window.location.reload();
          }}>
          删除
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 更新评论 API GET 以支持管理端**

在 `src/app/api/comments/route.ts` 添加 GET：

```typescript
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const all = req.nextUrl.searchParams.get("all") === "true";

  const where: Record<string, unknown> = {};
  if (!session?.user || !all) {
    where.isApproved = true;
  }

  const comments = await prisma.comment.findMany({
    where,
    include: { post: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: all ? 100 : 50,
  });

  return NextResponse.json(comments);
}
```

需要在该文件顶部 import `auth`（已存在于其他 API）。

- [ ] **Step 5: Commit**

```bash
git add src/app/api/comments src/components/comment src/app/admin/comments
git commit -m "feat: add comment system with nested replies, approval workflow, and spam protection

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 15: RSS Feed

**Files:**
- Create: `src/app/rss.xml/route.ts`, `src/lib/rss.ts`

- [ ] **Step 1: RSS 生成工具**

写入 `src/lib/rss.ts`：

```typescript
import { prisma } from "./prisma";
import { extractTextFromTipTap } from "./content";

export async function generateRssFeed(): Promise<string> {
  const blogName = process.env.NEXT_PUBLIC_BLOG_NAME || "MyBlog";
  const blogDesc = process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || "";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { tags: { include: { tag: true } } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const items = posts.map((post) => {
    const excerpt = post.excerpt || extractTextFromTipTap(post.content).slice(0, 300);
    const pubDate = post.publishedAt?.toUTCString() || "";

    return `<item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${excerpt}]]></description>
      ${post.tags.map((t) => `<category>${t.tag.name}</category>`).join("\n      ")}
    </item>`;
  }).join("\n");

  const lastBuildDate = posts[0]?.publishedAt?.toUTCString() || new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${blogName}</title>
    <link>${baseUrl}</link>
    <description>${blogDesc}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}
```

- [ ] **Step 2: RSS Route Handler**

写入 `src/app/rss.xml/route.ts`：

```typescript
import { generateRssFeed } from "@/lib/rss";

export async function GET() {
  const xml = await generateRssFeed();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/rss.ts src/app/rss.xml
git commit -m "feat: add RSS 2.0 feed with post excerpts

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 16: Design Tokens 与主题系统

**Files:**
- Write: `src/styles/tokens.css`
- Modify: `src/app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: 写入 Design Tokens CSS**

写入 `src/styles/tokens.css`：

```css
/* ===== Primitive Tokens ===== */
:root {
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-white: #ffffff;

  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

/* ===== Semantic Tokens ===== */
[data-theme="dark"] {
  --bg-primary: var(--color-slate-950);
  --bg-secondary: var(--color-slate-900);
  --border-color: var(--color-slate-800);
  --text-primary: var(--color-slate-100);
  --text-secondary: var(--color-slate-400);
  --accent: var(--color-blue-500);
  --accent-hover: var(--color-blue-600);
  --code-bg: #0d1117;
}

[data-theme="light"] {
  --bg-primary: var(--color-white);
  --bg-secondary: var(--color-slate-50);
  --border-color: var(--color-slate-200);
  --text-primary: var(--color-slate-900);
  --text-secondary: var(--color-slate-500);
  --accent: var(--color-blue-600);
  --accent-hover: var(--color-blue-500);
  --code-bg: var(--color-slate-50);
}
```

- [ ] **Step 2: 更新全局样式**

覆写 `src/app/globals.css`：

```css
@import "tailwindcss";
@import "../styles/tokens.css";

@plugin "@tailwindcss/typography";

@theme {
  --color-bg-primary: var(--bg-primary);
  --color-bg-secondary: var(--bg-secondary);
  --color-border: var(--border-color);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --font-family-sans: var(--font-sans);
  --font-family-mono: var(--font-mono);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
}

@layer base {
  * { border-color: var(--border-color); }
  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
}

/* 代码块滚动条样式 */
pre::-webkit-scrollbar { height: 6px; }
pre::-webkit-scrollbar-track { background: transparent; }
pre::-webkit-scrollbar-thumb { background: var(--color-slate-500); border-radius: 3px; }

/* TipTap 编辑器占位符 */
.tiptap p.is-editor-empty:first-child::before {
  color: var(--color-slate-400);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
```

- [ ] **Step 3: 导入 Inter 和 JetBrains Mono 字体**

在 `src/app/layout.tsx` 的 `<head>` 中添加：

```tsx
// 添加在 <head> 中：
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css src/app/globals.css src/app/layout.tsx
git commit -m "feat: add design tokens system with dark/light theme support

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 17: SEO 与 Sitemap

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/robots.ts`
- Create: `public/robots.txt`

- [ ] **Step 1: 配置 next-sitemap**

编辑 `next.config.ts`：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
};

export default nextConfig;
```

创建 `src/app/robots.ts`：

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

创建 `src/app/sitemap.ts`：

```typescript
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const postsEntries = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const tags = await prisma.tag.findMany({ select: { slug: true } });
  const tagEntries = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/search`, changeFrequency: "monthly", priority: 0.3 },
    ...postsEntries,
    ...tagEntries,
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts src/app/robots.ts src/app/sitemap.ts
git commit -m "feat: add SEO with dynamic sitemap, robots.txt, and Open Graph metadata

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 18: 错误处理与加载状态

**Files:**
- Create: `src/app/not-found.tsx`, `src/app/error.tsx`
- Modify: various pages to add loading states

- [ ] **Step 1: 创建 404 页面**

写入 `src/app/not-found.tsx`：

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-6xl font-bold text-text-secondary">404</h1>
      <p className="text-xl text-text-primary">页面未找到</p>
      <p className="text-text-secondary">你访问的页面不存在或已被移除。</p>
      <Button asChild><Link href="/">返回首页</Link></Button>
    </div>
  );
}
```

- [ ] **Step 2: 创建 Error Boundary**

写入 `src/app/error.tsx`：

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-4xl font-bold text-text-primary">出错了</h1>
      <p className="text-text-secondary">请稍后重试。</p>
      <Button onClick={reset}>重试</Button>
    </div>
  );
}
```

- [ ] **Step 3: 文章详情页加载状态**

写入 `src/app/posts/[slug]/loading.tsx`：

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
```

- [ ] **Step 4: 管理后台通用加载状态**

写入 `src/app/admin/loading.tsx`：

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
```

- [ ] **Step 5: API 统一错误处理中间件**

在 `src/lib/utils.ts` 追加：

```typescript
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown) {
  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "该值已存在，请使用其他值" } },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "记录未找到" } },
        { status: 404 }
      );
    }
  }

  return NextResponse.json(
    { error: { code: "INTERNAL", message: "服务器内部错误" } },
    { status: 500 }
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/not-found.tsx src/app/error.tsx src/app/posts/\[slug\]/loading.tsx src/app/admin/loading.tsx src/lib/utils.ts
git commit -m "feat: add error boundaries, loading skeletons, and 404 page

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 19: 测试

**Files:**
- Create: `__tests__/lib/content.test.ts`, `__tests__/lib/rss.test.ts`, `__tests__/lib/search.test.ts`
- Create: `__tests__/api/posts.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Vitest 配置**

写入 `vitest.config.ts`：

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 2: content.ts 单元测试**

写入 `__tests__/lib/content.test.ts`：

```typescript
import { describe, it, expect } from "vitest";
import { extractTextFromTipTap, stripHtml } from "@/lib/content";

describe("extractTextFromTipTap", () => {
  it("extracts text from TipTap JSON", () => {
    const json = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hello World" }] },
      ],
    });
    expect(extractTextFromTipTap(json)).toBe("Hello World");
  });

  it("returns empty for empty doc", () => {
    const json = JSON.stringify({ type: "doc", content: [] });
    expect(extractTextFromTipTap(json)).toBe("");
  });

  it("truncates to 300 chars", () => {
    const longText = "a".repeat(500);
    const json = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: longText }] }],
    });
    expect(extractTextFromTipTap(json).length).toBeLessThanOrEqual(300);
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello <b>World</b></p>")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });
});
```

- [ ] **Step 3: RSS 生成测试**

写入 `__tests__/lib/rss.test.ts`：

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateRssFeed } from "@/lib/rss";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: vi.fn().mockResolvedValue([
        {
          title: "Test Post",
          slug: "test-post",
          content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}',
          excerpt: "An excerpt",
          publishedAt: new Date("2024-06-26"),
          tags: [{ tag: { name: "React" } }, { tag: { name: "TypeScript" } }],
        },
      ]),
    },
  },
}));

describe("generateRssFeed", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BLOG_NAME = "MyBlog";
    process.env.NEXT_PUBLIC_BLOG_DESCRIPTION = "技术博客";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
  });

  it("generates valid RSS XML with required elements", async () => {
    const xml = await generateRssFeed();

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<title>MyBlog</title>');
    expect(xml).toContain('<link>https://example.com</link>');
    expect(xml).toContain('<language>zh-CN</language>');
    expect(xml).toContain('</channel>');
    expect(xml).toContain('</rss>');
  });

  it("includes post items in the feed", async () => {
    const xml = await generateRssFeed();

    expect(xml).toContain("<item>");
    expect(xml).toContain("<title><![CDATA[Test Post]]></title>");
    expect(xml).toContain("<link>https://example.com/posts/test-post</link>");
    expect(xml).toContain("<category>React</category>");
    expect(xml).toContain("<category>TypeScript</category>");
    expect(xml).toContain("</item>");
  });
});
```

- [ ] **Step 4: 搜索 API 测试**

写入 `__tests__/api/posts.test.ts`：

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";

describe("GET /api/posts", () => {
  it("returns published posts", async () => {
    await testApiHandler({
      url: "/api/posts",
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty("posts");
        expect(body).toHaveProperty("total");
        expect(body).toHaveProperty("page");
        expect(body).toHaveProperty("totalPages");
      },
    });
  });
});

describe("POST /api/posts", () => {
  it("returns 401 without auth", async () => {
    await testApiHandler({
      url: "/api/posts",
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Test", slug: "test", content: "{}", status: "DRAFT", tagIds: [] }),
        });
        expect(res.status).toBe(401);
      },
    });
  });
});
```

- [ ] **Step 5: 运行测试**

```bash
npx vitest run
```
Expected: 至少 content 和 posts API 的测试通过。

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts __tests__/
git commit -m "test: add unit tests for content utils and API integration tests for posts

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 20: 最终配置与部署准备

**Files:**
- Modify: `package.json`
- Create: `.env.example`

- [ ] **Step 1: 完善 package.json scripts**

编辑 `package.json` 的 `scripts`：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "test": "vitest run",
    "test:watch": "vitest",
    "postinstall": "prisma generate"
  }
}
```

- [ ] **Step 2: 更新 .env.example**

确保 `.env.example` 完整：

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myblog"

# Auth
AUTH_SECRET="generate-with: openssl rand -base64 32"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me-on-deploy"

# Blog
NEXT_PUBLIC_BLOG_NAME="MyBlog"
NEXT_PUBLIC_BLOG_DESCRIPTION="前端 · 后端 · DevOps"
NEXT_PUBLIC_SITE_URL="https://myblog.com"
```

- [ ] **Step 3: 构建验证**

```bash
npm run build
```
Expected: 构建成功，无 TypeScript 错误。

- [ ] **Step 4: 最终提交**

```bash
git add package.json .env.example
git commit -m "chore: finalize config, build scripts, and deployment preparation

Co-Authored-By: Claude <noreply@anthropic.com>"
```
