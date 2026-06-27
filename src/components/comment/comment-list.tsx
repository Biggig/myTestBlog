import { getGravatarUrl } from "@/lib/gravatar";
import { CommentItem, type CommentData } from "./comment-item";

interface CommentListProps {
  comments: CommentData[];
  postId: string;
}

export function CommentList({ comments, postId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">暂无评论，来抢沙发吧！</p>
      </div>
    );
  }

  // Attach gravatar URLs on the server side
  const commentsWithGravatar = comments.map((comment) =>
    attachGravatars(comment)
  );

  return (
    <div className="divide-y divide-border">
      {commentsWithGravatar.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}

function attachGravatars(comment: CommentData): CommentData {
  return {
    ...comment,
    gravatarUrl: getGravatarUrl(comment.authorEmail),
    replies: comment.replies?.map((reply) => attachGravatars(reply)),
  };
}
