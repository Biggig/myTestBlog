import { createHighlighter, type Highlighter } from "shiki";
import { CopyButton } from "./copy-button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

// ---------------------------------------------------------------------------
// Singleton highlighter — initialized once and reused across renders
// ---------------------------------------------------------------------------

let highlighter: Highlighter | null = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "typescript",
        "javascript",
        "tsx",
        "jsx",
        "python",
        "css",
        "html",
        "json",
        "bash",
        "sql",
        "yaml",
        "markdown",
        "rust",
        "go",
        "java",
        "text",
      ],
    });
  }
  return highlighter;
}

// ---------------------------------------------------------------------------
// CodeBlock — async server component
// ---------------------------------------------------------------------------

export async function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers: _showLineNumbers = true,
}: CodeBlockProps) {
  const h = await getHighlighter();
  const lang = h.getLoadedLanguages().includes(language)
    ? language
    : "text";

  const displayLabel = filename || language;

  try {
    const darkHtml = h.codeToHtml(code.trimEnd(), {
      lang,
      theme: "github-dark",
    });
    const lightHtml = h.codeToHtml(code.trimEnd(), {
      lang,
      theme: "github-light",
    });

    return (
      <div className="my-6 rounded-lg overflow-hidden border border-border group/code">
        {/* Top bar with filename + copy button */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border text-xs text-muted-foreground font-mono">
          <span>{displayLabel}</span>
          <CopyButton code={code.trimEnd()} />
        </div>

        {/* Light theme (visible in light mode) */}
        <div className="dark:hidden [&_pre]:!bg-muted [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm [&_.line]:pr-4">
          <div dangerouslySetInnerHTML={{ __html: lightHtml }} />
        </div>

        {/* Dark theme (visible in dark mode) */}
        <div className="hidden dark:block [&_pre]:!bg-muted [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm [&_.line]:pr-4">
          <div dangerouslySetInnerHTML={{ __html: darkHtml }} />
        </div>
      </div>
    );
  } catch {
    // Graceful fallback if highlighting fails
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border text-xs text-muted-foreground font-mono">
          <span>{displayLabel}</span>
          <CopyButton code={code.trimEnd()} />
        </div>
        <pre className="p-4 overflow-x-auto bg-muted text-sm font-mono">
          <code>{code.trimEnd()}</code>
        </pre>
      </div>
    );
  }
}
