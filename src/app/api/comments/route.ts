import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validators";
import { getGravatarUrl } from "@/lib/gravatar";

export const dynamic = "force-dynamic";

// Typed recursive comment tree with gravatar URLs attached
interface CommentWithGravatar {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string | null;
  parentId: string | null;
  postId: string;
  isApproved: boolean;
  createdAt: string;
  gravatarUrl?: string;
  replies?: CommentWithGravatar[];
  post?: { id: string; title: string; slug: string };
}

function attachGravatarUrls(comments: CommentWithGravatar[]): CommentWithGravatar[] {
  return comments.map((c) => ({
    ...c,
    gravatarUrl: getGravatarUrl(c.authorEmail),
    replies: c.replies ? attachGravatarUrls(c.replies) : [],
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const all = searchParams.get("all") === "true";

  // Admin "all" mode: return all comments (requires auth)
  if (all) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      );
    }

    const rawComments = await prisma.comment.findMany({
      include: {
        post: { select: { id: true, title: true, slug: true } },
        replies: {
          include: {
            replies: {
              include: {
                replies: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      where: { parentId: null },
      orderBy: { createdAt: "desc" },
    });

    // Serialize dates to strings (Next.js can't pass Date objects in JSON responses)
    const serialized = JSON.parse(JSON.stringify(rawComments)) as CommentWithGravatar[];
    const comments = attachGravatarUrls(serialized);
    return NextResponse.json({ comments });
  }

  // Public mode: return approved comments for a specific post
  if (!postId) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "postId 参数是必需的" } },
      { status: 400 }
    );
  }

  const topLevelComments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
      isApproved: true,
    },
    include: {
      replies: {
        where: { isApproved: true },
        include: {
          replies: {
            where: { isApproved: true },
            include: {
              replies: {
                where: { isApproved: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments: topLevelComments });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { content, authorName, authorEmail, parentId, postId, captchaAnswer } = parsed.data;

  // Simple math captcha: 3 + 5 = 8
  if (captchaAnswer !== 8) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "验证码错误，请重试" } },
      { status: 400 }
    );
  }

  // Verify the post exists
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "文章不存在" } },
      { status: 404 }
    );
  }

  // If parentId is provided, verify the parent comment exists and belongs to the same post,
  // and enforce the 2-level nesting limit (grandparent can't have a parentId).
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true, parentId: true, isApproved: true },
    });
    if (!parentComment || parentComment.postId !== postId) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "父评论不存在" } },
        { status: 404 }
      );
    }
    if (!parentComment.isApproved) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "无法回复未审核的评论" } },
        { status: 400 }
      );
    }
    if (parentComment.parentId) {
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

  return NextResponse.json({ comment }, { status: 201 });
}
