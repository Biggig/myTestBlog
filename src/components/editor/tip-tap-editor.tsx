"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./editor-toolbar";
import { useEffect } from "react";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (json: string) => void;
  placeholder?: string;
}

export function TipTapEditor({ content, onChange, placeholder = "开始写作..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        inline: false,
      }),
    ],
    content: content ? JSON.parse(content) : "",
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px]",
      },
    },
  });

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor) {
        localStorage.setItem("draft-content", JSON.stringify(editor.getJSON()));
        localStorage.setItem("draft-saved-at", new Date().toISOString());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [editor]);

  return (
    <div className="border rounded-lg bg-muted">
      <EditorToolbar editor={editor} />
      <div className="px-6 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
