import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  tags: { id: string; name: string; slug: string }[];
}

export function PostCard({ title, slug, excerpt, publishedAt, tags }: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`}>
      <Card className="p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {publishedAt && (
          <time className="text-sm text-muted-foreground mb-2 block">
            {new Date(publishedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })}
          </time>
        )}
        <h2 className="text-xl font-bold mb-2 hover:text-primary transition-colors">{title}</h2>
        {excerpt && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{excerpt}</p>}
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag) => <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>)}
        </div>
      </Card>
    </Link>
  );
}
