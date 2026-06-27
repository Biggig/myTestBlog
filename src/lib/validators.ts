import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

export const postSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 格式无效"),
  content: z.string().min(1, "内容不能为空"),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tagIds: z.array(z.string()),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(5000),
  authorName: z.string().min(1).max(50),
  authorEmail: z.string().email().optional().or(z.literal("")),
  parentId: z.string().optional(),
  postId: z.string(),
  captchaAnswer: z.number(),
});
