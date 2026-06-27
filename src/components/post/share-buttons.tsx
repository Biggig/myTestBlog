"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

/**
 * ShareButtons — client component for Twitter share and copy-to-clipboard.
 * Rendered inside the post detail page after the article content.
 */
export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers or non-HTTPS contexts
      setCopied(false);
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(`${window.location.origin}/posts/${slug}`)}`;

  return (
    <div className="flex gap-4 pt-8 border-t border-border">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        Twitter
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        {copied ? "链接已复制" : "复制链接"}
      </button>
    </div>
  );
}
