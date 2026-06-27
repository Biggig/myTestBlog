import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "标签 | MyBlog",
  description: "浏览所有标签",
};

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  const maxCount = Math.max(1, ...tags.map((t) => t._count.posts));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">标签</h1>

      {tags.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">暂无标签</p>
      ) : (
        <div className="flex gap-3 flex-wrap">
          {tags.map((tag) => {
            const ratio = tag._count.posts / maxCount;
            const size =
              ratio > 0.8
                ? "text-2xl"
                : ratio > 0.5
                  ? "text-xl"
                  : ratio > 0.3
                    ? "text-lg"
                    : "text-base";

            return (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className={`${size} px-3 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground`}
              >
                {tag.name}
                <span className="text-xs ml-1 opacity-60">
                  ({tag._count.posts})
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
