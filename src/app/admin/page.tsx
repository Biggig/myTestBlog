import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [publishedCount, draftCount, pendingComments, recentPosts] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.comment.findMany({
      where: { isApproved: false },
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-4xl">{publishedCount}</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">已发布</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-4xl">{draftCount}</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">草稿</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-4xl">{pendingComments.length}</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">待审核评论</p></CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">快捷操作</h2>
        <div className="flex gap-2">
          <Button asChild><Link href="/admin/posts/new">+ 新建文章</Link></Button>
          {pendingComments.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/admin/comments">审核评论 ({pendingComments.length})</Link>
            </Button>
          )}
        </div>
      </div>

      {pendingComments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">最新评论（待审核）</h2>
          {pendingComments.slice(0, 5).map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{comment.authorName}</p>
                    <p className="text-sm text-muted-foreground">{comment.content.slice(0, 100)}...</p>
                    <p className="text-xs text-muted-foreground mt-1">文章：《{comment.post.title}》</p>
                  </div>
                  <form action={`/api/comments/${comment.id}`} method="POST">
                    <input type="hidden" name="isApproved" value="true" />
                    <input type="hidden" name="_method" value="PATCH" />
                    <Button type="submit" size="sm">通过</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">最近文章</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 text-muted-foreground">标题</th>
                <th className="text-left px-4 py-2 text-muted-foreground">状态</th>
                <th className="text-left px-4 py-2 text-muted-foreground">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <Link href={`/admin/posts/${post.id}/edit`} className="text-primary hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                      {post.status === "PUBLISHED" ? "已发布" : post.status === "DRAFT" ? "草稿" : "归档"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {post.updatedAt.toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
