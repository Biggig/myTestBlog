import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { estimateReadingTime } from "@/lib/content";
import { PostContent } from "@/components/post/post-content";
import { ReadingProgress } from "@/components/post/reading-progress";
import { ShareButtons } from "@/components/post/share-buttons";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });

  if (!post) return { title: "文章未找到" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  // Fetch the post with tags
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: { include: { tag: true } },
    },
  });

  // 404 if not found or not published
  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const readingTime = estimateReadingTime(post.content);

  // Fetch prev and next posts (nearest by publishedAt).
  // Skip when publishedAt is null (shouldn't happen for PUBLISHED posts, but guard defensively).
  const [prevPost, nextPost] =
    post.publishedAt
      ? await Promise.all([
          prisma.post.findFirst({
            where: {
              status: "PUBLISHED",
              publishedAt: { lt: post.publishedAt },
            },
            orderBy: { publishedAt: "desc" },
            select: { title: true, slug: true },
          }),
          prisma.post.findFirst({
            where: {
              status: "PUBLISHED",
              publishedAt: { gt: post.publishedAt },
            },
            orderBy: { publishedAt: "asc" },
            select: { title: true, slug: true },
          }),
        ])
      : [null, null];

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; 返回首页
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {post.publishedAt.toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            <span>&middot;</span>
            <span>阅读时间 {readingTime} 分钟</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((pt) => (
                <Badge key={pt.tag.id} variant="secondary">
                  <Link href={`/?tag=${pt.tag.slug}`}>{pt.tag.name}</Link>
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Article content */}
        <PostContent content={post.content} />

        {/* Share buttons */}
        <ShareButtons title={post.title} slug={post.slug} />

        {/* TODO Task 14: Add comment section */}

        {/* Prev / Next navigation */}
        <nav className="grid grid-cols-2 gap-4 pt-8 mt-8 border-t border-border">
          <div className="text-left">
            {prevPost ? (
              <Link
                href={`/posts/${prevPost.slug}`}
                className="group"
              >
                <span className="text-xs text-muted-foreground">&larr; 上一篇</span>
                <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">没有更早的文章</span>
            )}
          </div>
          <div className="text-right">
            {nextPost ? (
              <Link
                href={`/posts/${nextPost.slug}`}
                className="group"
              >
                <span className="text-xs text-muted-foreground">下一篇 &rarr;</span>
                <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {nextPost.title}
                </p>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">没有更新的文章</span>
            )}
          </div>
        </nav>
      </article>
    </>
  );
}
