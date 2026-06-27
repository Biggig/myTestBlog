"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";

export interface CommentData {
  id: string;
  content: string;
  authorName: string;
  authorEmail?: string | null;
  gravatarUrl?: string;
  createdAt: string;
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  postId: string;
  depth?: number;
}

export function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const dateStr = new Date(comment.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fallbackChar = comment.authorName.charAt(0).toUpperCase();

  return (
    <div className={depth > 0 ? "ml-11 border-l-2 border-border pl-4" : ""}>
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 shrink-0">
          {comment.gravatarUrl ? (
            <AvatarImage src={comment.gravatarUrl} alt={comment.authorName} />
          ) : null}
          <AvatarFallback>{fallbackChar}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {comment.authorName}
            </span>
            <time className="text-xs text-muted-foreground">{dateStr}</time>
          </div>

          <p className="text-sm text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-auto px-0 py-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? "取消回复" : "回复"}
          </Button>

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recursive replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
