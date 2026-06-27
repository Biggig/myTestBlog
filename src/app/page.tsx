import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
      {/* Tag filter bar */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/"
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            !tagFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          全部
        </Link>
        {allTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/?tag=${tag.slug}`}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              tagFilter === tag.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tag.name}
          </Link>
        ))}
      </div>

      {/* Post list */}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/?page=${page - 1}${tagFilter ? `&tag=${tagFilter}` : ""}`}
              className="px-3 py-1 rounded border text-sm hover:bg-muted">← 上一页</Link>
          )}
          <span className="px-3 py-1 text-sm text-muted-foreground">第 {page} 页 / 共 {totalPages} 页</span>
          {page < totalPages && (
            <Link href={`/?page=${page + 1}${tagFilter ? `&tag=${tagFilter}` : ""}`}
              className="px-3 py-1 rounded border text-sm hover:bg-muted">下一页 →</Link>
          )}
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground"><p className="text-lg">暂无文章</p></div>
      )}
    </div>
  );
}
