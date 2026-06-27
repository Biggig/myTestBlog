"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import { Search, Loader2, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SearchResult } from "@/lib/search";

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debounced] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setSearched(true);

    fetch(`/api/search?q=${encodeURIComponent(debounced.trim())}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data) => {
        if (!cancelled) {
          setResults(data.results || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debounced]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">搜索文章</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="输入关键词搜索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">搜索中...</span>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">没有找到相关文章</p>
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Tags className="h-4 w-4" />
            浏览标签云
          </Link>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            找到 {results.length} 条结果
          </p>
          {results.map((r) => (
            <Link key={r.id} href={`/posts/${r.slug}`}>
              <div className="p-4 rounded-lg border border-border bg-muted hover:bg-background transition-colors">
                <h3 className="text-lg font-bold text-foreground">{r.title}</h3>
                {r.headline && (
                  <p
                    className="text-sm text-muted-foreground mt-1 [&_b]:bg-yellow-200 dark:[&_b]:bg-yellow-800 [&_b]:px-0.5 [&_b]:rounded"
                    dangerouslySetInnerHTML={{ __html: r.headline }}
                  />
                )}
                {r.publishedAt && (
                  <time className="text-xs text-muted-foreground mt-2 block">
                    {new Date(r.publishedAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </time>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !searched && (
        <p className="text-center text-muted-foreground py-16">
          输入至少2个字符开始搜索
        </p>
      )}
    </div>
  );
}
