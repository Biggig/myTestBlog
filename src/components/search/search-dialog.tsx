"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Search, FileText } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/search";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }

    if (debounced.trim().length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);

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
  }, [debounced, open]);

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      router.push(`/posts/${slug}`);
    },
    [router]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
      <CommandInput
        placeholder="搜索文章..."
        aria-label="搜索文章"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4 animate-pulse" />
              搜索中...
            </div>
          ) : (
            "没有找到相关文章"
          )}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="搜索结果">
            {results.map((r) => (
              <CommandItem
                key={r.id}
                value={r.title}
                onSelect={() => handleSelect(r.slug)}
                className="flex items-start gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{r.title}</span>
                  <span
                    className="text-xs text-muted-foreground line-clamp-1 [&_b]:bg-yellow-200 dark:[&_b]:bg-yellow-800 [&_b]:px-0.5 [&_b]:rounded"
                    dangerouslySetInnerHTML={{
                      __html: r.headline || r.excerpt || "",
                    }}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
