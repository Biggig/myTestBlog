import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: tagSlug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug: tagSlug },
    select: { name: true },
  });

  if (!tag) return { title: "标签未找到" };

  return {
    title: `标签: ${tag.name}`,
  };
}

export default async function TagPostsPage({ params }: Props) {
  const { tag: tagSlug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug: tagSlug },
    select: { id: true, name: true },
  });

  if (!tag) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: { some: { tag: { slug: tagSlug } } },
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/tags"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; 所有标签
        </Link>
      </div>

      <h1 className="text-3xl font-bold">
        标签: {tag.name}
        <span className="text-lg font-normal text-muted-foreground ml-2">
          ({posts.length} 篇文章)
        </span>
      </h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          暂无相关文章
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              publishedAt={post.publishedAt?.toISOString() || null}
              tags={post.tags.map((t) => ({
                id: t.tag.id,
                name: t.tag.name,
                slug: t.tag.slug,
              }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
