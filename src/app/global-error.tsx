"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="max-w-3xl mx-auto py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">出错了</h1>
          <p className="text-muted-foreground mb-8">
            {error.message || "页面加载失败，请稍后重试"}
          </p>
          <button
            onClick={reset}
            className="text-primary hover:underline"
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
