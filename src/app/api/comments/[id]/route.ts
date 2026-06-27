import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
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

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "评论不存在" } },
      { status: 404 }
    );
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: {
      ...(body.content !== undefined && { content: body.content }),
      ...(body.authorName !== undefined && { authorName: body.authorName }),
      ...(body.isApproved !== undefined && { isApproved: body.isApproved }),
    },
  });

  return NextResponse.json({ comment: updated });
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

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "评论不存在" } },
      { status: 404 }
    );
  }

  // Cascade delete will handle replies via the schema's onDelete: Cascade
  await prisma.comment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
