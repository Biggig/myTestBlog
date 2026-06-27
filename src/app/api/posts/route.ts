import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { generateUniqueSlug, slugify } from "@/lib/utils";

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
      include: {
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
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
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
      { status: 400 }
    );
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
