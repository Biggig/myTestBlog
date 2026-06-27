import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { estimateReadingTime } from "@/lib/content";
import { PostContent } from "@/components/post/post-content";
import { ReadingProgress } from "@/components/post/reading-progress";
import { ShareButtons } from "@/components/post/share-buttons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CommentList } from "@/components/comment/comment-list";
import { CommentForm } from "@/components/comment/comment-form";
import { JsonLd } from "@/components/seo/json-ld";

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { username: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (!post) return { title: "文章未找到" };

  const tagNames = post.tags.map((pt) => pt.tag.name);

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [post.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
    keywords: tagNames,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  // Fetch the post with tags and author
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true } },
      tags: { include: { tag: true } },
    },
  });

  // 404 if not found or not published
  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const readingTime = estimateReadingTime(post.content);

  // Fetch approved top-level comments with nested replies (3 levels deep)
  const comments = await prisma.comment.findMany({
    where: {
      postId: post.id,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.username,
    },
    image: post.coverImage ?? undefined,
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_BLOG_NAME || "MyBlog",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
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

        {/* Comment section */}
        <section className="mt-10">
          <Separator className="mb-8" />
          <h2 className="text-xl font-bold mb-6">评论</h2>
          <CommentList
            comments={JSON.parse(JSON.stringify(comments))}
            postId={post.id}
          />
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">发表评论</h3>
            <CommentForm postId={post.id} />
          </div>
        </section>

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
