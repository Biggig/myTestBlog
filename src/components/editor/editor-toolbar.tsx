"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Code, Quote, Link, Image, Minus, List, ListOrdered
} from "lucide-react";

interface ToolbarButton {
  icon: React.ElementType;
  action: () => void;
  isActive: boolean;
  title: string;
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const buttons: ToolbarButton[] = [
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive("heading", { level: 1 }), title: "H1" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive("heading", { level: 2 }), title: "H2" },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive("heading", { level: 3 }), title: "H3" },
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold"), title: "加粗" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic"), title: "斜体" },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive("codeBlock"), title: "代码块" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive("blockquote"), title: "引用" },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), isActive: false, title: "分隔线" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-border bg-muted rounded-t-lg sticky top-0 z-10">
      {buttons.map((btn) => (
        <Button
          key={btn.title}
          variant={btn.isActive ? "default" : "ghost"}
          size="sm"
          onClick={btn.action}
          title={btn.title}
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("链接 URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        title="链接"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("图片 URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        title="图片"
      >
        <Image className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}
