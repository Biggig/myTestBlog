import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validators";
import { getGravatarUrl } from "@/lib/gravatar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function attachGravatarUrls(comments: any[]): any[] {
  return comments.map((c: any) => ({
    ...c,
    gravatarUrl: getGravatarUrl(c.authorEmail),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments = attachGravatarUrls(rawComments as any[]);
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

  // If parentId is provided, verify the parent comment exists and belongs to the same post
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true, isApproved: true },
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
