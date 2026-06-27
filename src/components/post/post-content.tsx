import React from "react";

// ---------------------------------------------------------------------------
// TipTap JSON types
// ---------------------------------------------------------------------------

interface TipTapMark {
  type: string;
  attrs?: Record<string, string>;
}

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
  attrs?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Inline marks renderer
// ---------------------------------------------------------------------------

function renderMarks(text: string, marks?: TipTapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  let result: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = <strong>{result}</strong>;
        break;
      case "italic":
        result = <em>{result}</em>;
        break;
      case "code":
        result = (
          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
            {result}
          </code>
        );
        break;
      case "link":
        result = (
          <a
            href={mark.attrs?.href ?? "#"}
            target={mark.attrs?.target ?? "_blank"}
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {result}
          </a>
        );
        break;
      case "strike":
        result = <s>{result}</s>;
        break;
      default:
        break;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Node heading → id slug helper
// ---------------------------------------------------------------------------

function headingId(node: TipTapNode): string | undefined {
  // Extract text content from the heading for use as an anchor id
  const texts: string[] = [];
  if (node.content) {
    for (const child of node.content) {
      if (child.text) texts.push(child.text);
    }
  }
  if (texts.length === 0) return undefined;
  return texts
    .join(" ")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ---------------------------------------------------------------------------
// Node renderer
// ---------------------------------------------------------------------------

interface RenderNodeOptions {
  /** Custom code block renderer — falls back to simple pre/code when omitted */
  renderCodeBlock?: (node: TipTapNode) => React.ReactNode;
}

function renderNode(node: TipTapNode, index: number, options?: RenderNodeOptions): React.ReactNode {
  switch (node.type) {
    // Document wrapper
    case "doc":
      return (
        <div className="prose prose-slate dark:prose-invert max-w-none" key={index}>
          {node.content?.map((child, i) => renderNode(child, i, options))}
        </div>
      );

    // Headings
    case "heading": {
      const level = Number(node.attrs?.level) || 1;
      const id = headingId(node);
      // Cap heading levels at h3 to maintain a shallow document hierarchy.
      // h4–h6 are flattened into h3 for better readability and SEO structure
      // in blog posts (deep nesting rarely improves the reading experience).
      const Tag = (`h${Math.min(level, 3)}` as keyof JSX.IntrinsicElements) as "h1" | "h2" | "h3";
      return (
        <Tag key={index} id={id} className="scroll-mt-20">
          {node.content?.map((child, i) => renderNode(child, i, options))}
        </Tag>
      );
    }

    // Paragraph
    case "paragraph":
      return (
        <p key={index}>
          {node.content?.map((child, i) => renderNode(child, i, options))}
        </p>
      );

    // Inline text with marks
    case "text":
      return <React.Fragment key={index}>{renderMarks(node.text ?? "", node.marks)}</React.Fragment>;

    // Code block — TODO Task 11: Replace with Shiki CodeBlock component
    case "codeBlock": {
      const language = node.attrs?.language ?? "";
      const code = node.content?.[0]?.text ?? "";
      return (
        // TODO Task 11: Replace with Shiki CodeBlock component
        <pre key={index} className="bg-muted rounded-lg p-4 overflow-x-auto my-4">
          <code className={`language-${language} text-sm font-mono`}>{code}</code>
        </pre>
      );
    }

    // Blockquote
    case "blockquote":
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-4">
          {node.content?.map((child, i) => renderNode(child, i, options))}
        </blockquote>
      );

    // Horizontal rule
    case "horizontalRule":
      return <hr key={index} className="my-8 border-border" />;

    // Image
    case "image":
      return (
        <img
          key={index}
          src={node.attrs?.src ?? ""}
          alt={node.attrs?.alt ?? ""}
          title={node.attrs?.title}
          className="rounded-lg my-4 max-w-full"
        />
      );

    // Bullet list
    case "bulletList":
      return (
        <ul key={index} className="list-disc pl-6 my-4 space-y-1">
          {node.content?.map((child, i) => renderNode(child, i, options))}
        </ul>
      );

    // Ordered list
    case "orderedList":
      return (
        <ol key={index} className="list-decimal pl-6 my-4 space-y-1">
          {node.content?.map((child, i) => renderNode(child, i, options))}
        </ol>
      );

    // List item
    case "listItem":
      return (
        <li key={index}>
          {node.content?.map((child, i) => renderNode(child, i, options))}
        </li>
      );

    // Catch-all for unknown node types
    default:
      if (node.content) {
        return (
          <React.Fragment key={index}>
            {node.content.map((child, i) => renderNode(child, i, options))}
          </React.Fragment>
        );
      }
      return null;
  }
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface PostContentProps {
  /** Raw TipTap JSON string from the database */
  content: string;
  /** Optional custom code block renderer (Shiki integration in Task 11) */
  renderCodeBlock?: (node: TipTapNode) => React.ReactNode;
}

/**
 * PostContent renders a TipTap JSON document string into React elements.
 * Handles headings, paragraphs, lists, blockquotes, code blocks, images,
 * and inline marks (bold, italic, code, link, strike).
 *
 * Pass `renderCodeBlock` to replace the default `<pre><code>` fallback
 * with a syntax-highlighted component (Task 11 — Shiki integration).
 */
export function PostContent({ content, renderCodeBlock }: PostContentProps) {
  let doc: TipTapNode;
  try {
    doc = JSON.parse(content);
  } catch {
    return <p className="text-muted-foreground">无法渲染内容。</p>;
  }

  return <>{renderNode(doc, 0, { renderCodeBlock })}</>;
}
