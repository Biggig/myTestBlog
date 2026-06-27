import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { generateUniqueSlug, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "文章未找到" } },
      { status: 404 }
    );
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
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { title, slug: rawSlug, content, excerpt, coverImage, status: postStatus, tagIds } = parsed.data;
  const slug = await generateUniqueSlug(rawSlug || slugify(title), prisma, id);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "文章未找到" } },
      { status: 404 }
    );
  }

  const publishedAt =
    postStatus === "PUBLISHED" && !existing.publishedAt
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
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
