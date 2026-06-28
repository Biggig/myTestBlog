"use client";

import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface CommentData {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string | null;
  gravatarUrl?: string;
  isApproved: boolean;
  createdAt: string;
  post: { id: string; title: string; slug: string } | null;
  replies?: CommentData[];
}

// Flatten nested replies into a list for display
function flattenComments(comments: CommentData[]): CommentData[] {
  const result: CommentData[] = [];
  for (const c of comments) {
    result.push(c);
    if (c.replies && c.replies.length > 0) {
      result.push(...flattenComments(c.replies));
    }
  }
  return result;
}

export default function AdminCommentsPage() {
  const [allComments, setAllComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comments?all=true");
      const data = await res.json();
      setAllComments(flattenComments(data.comments || []));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const pendingComments = allComments.filter((c) => !c.isApproved);
  const approvedComments = allComments.filter((c) => c.isApproved);

  const toggleApproval = async (comment: CommentData) => {
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !comment.isApproved }),
    });
    if (res.ok) {
      setAllComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, isApproved: !comment.isApproved }
            : c
        )
      );
    }
  };

  const deleteComment = async (comment: CommentData) => {
    if (!confirm("确定要删除这条评论吗？子回复也会一并删除。")) return;
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      // Remove the comment and all its nested replies
      const idsToRemove = new Set<string>();
      const collectIds = (c: CommentData) => {
        idsToRemove.add(c.id);
        if (c.replies) c.replies.forEach(collectIds);
      };
      collectIds(comment);
      setAllComments((prev) => prev.filter((c) => !idsToRemove.has(c.id)));
    }
  };

  const renderCommentRow = (comment: CommentData) => (
    <div
      key={comment.id}
      className="flex gap-3 p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
    >
      <Avatar className="h-9 w-9 shrink-0">
        {comment.gravatarUrl ? (
          <AvatarImage src={comment.gravatarUrl} alt={comment.authorName} />
        ) : null}
        <AvatarFallback>
          {comment.authorName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {comment.authorName}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {comment.post && (
            <Link
              href={`/posts/${comment.post.slug}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              来自《{comment.post.title}》
            </Link>
          )}
          <Badge variant={comment.isApproved ? "default" : "secondary"}>
            {comment.isApproved ? "已审核" : "待审核"}
          </Badge>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
          {comment.content}
        </p>

        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant={comment.isApproved ? "secondary" : "default"}
            onClick={() => toggleApproval(comment)}
          >
            {comment.isApproved ? "隐藏" : "通过审核"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => deleteComment(comment)}
          >
            删除
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">评论审核</h1>
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">评论审核</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            待审核 ({pendingComments.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            已审核 ({approvedComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="border rounded-lg overflow-hidden">
            {pendingComments.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">暂无待审核评论</p>
            ) : (
              pendingComments.map(renderCommentRow)
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="border rounded-lg overflow-hidden">
            {approvedComments.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">暂无已审核评论</p>
            ) : (
              approvedComments.map(renderCommentRow)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
