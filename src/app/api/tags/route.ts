import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "标签名不能为空" } },
      { status: 400 }
    );
  }

  const tag = await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name, slug: slugify(name) },
  });

  return NextResponse.json(tag, { status: 201 });
}
