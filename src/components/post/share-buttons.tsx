"use client";

import { useEffect, useState } from "react";

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
  const [twitterUrl, setTwitterUrl] = useState("");

  // Build Twitter share URL on mount — uses window.location.origin which is
  // unavailable during SSR, so we defer to a useEffect.
  useEffect(() => {
    setTwitterUrl(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(`${window.location.origin}/posts/${slug}`)}`
    );
  }, [title, slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — try execCommand fallback
      try {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Both methods failed — silently ignore
      }
    }
  };

  return (
    <div className="flex gap-4 pt-8 border-t border-border">
      {twitterUrl && (
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Twitter
        </a>
      )}
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
