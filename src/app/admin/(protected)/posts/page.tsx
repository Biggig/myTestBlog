"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  tags: { id: string; name: string }[];
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []));
  }, [filter]);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel = (s: string) =>
    s === "PUBLISHED" ? "已发布" : s === "DRAFT" ? "草稿" : "归档";

  const statusVariant = (s: string) =>
    s === "PUBLISHED" ? "default" : s === "DRAFT" ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">文章管理</h1>
        <Button asChild>
          <Link href="/admin/posts/new">+ 新建文章</Link>
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "全部" : statusLabel(s)}
          </Button>
        ))}
        <Input
          placeholder="搜索标题..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs ml-auto"
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">标题</th>
              <th className="text-left px-4 py-2">状态</th>
              <th className="text-left px-4 py-2">标签</th>
              <th className="text-left px-4 py-2">更新时间</th>
              <th className="text-left px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2 font-medium">{post.title}</td>
                <td className="px-4 py-2">
                  <Badge variant={statusVariant(post.status)}>
                    {statusLabel(post.status)}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1 flex-wrap">
                    {post.tags?.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {post.updatedAt
                    ? new Date(post.updatedAt).toLocaleDateString("zh-CN")
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admin/posts/${post.id}/edit`)
                      }
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm("确定删除？")) return;
                        await fetch(`/api/posts/${post.id}`, {
                          method: "DELETE",
                        });
                        setPosts((prev) =>
                          prev.filter((p) => p.id !== post.id)
                        );
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
