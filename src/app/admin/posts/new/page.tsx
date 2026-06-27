"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TipTapEditor } from "@/components/editor/tip-tap-editor";
import { slugify } from "@/lib/utils";

type PostForm = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: "DRAFT",
      tagIds: [],
      slug: "",
      title: "",
      content: "{}",
    },
  });

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setAllTags)
      .catch(() => {});
  }, []);

  function addTag(tag: { id: string; name: string }) {
    if (!tags.find((t) => t.id === tag.id)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setValue("tagIds", newTags.map((t) => t.id));
    }
    setTagInput("");
  }

  function removeTag(tagId: string) {
    const next = tags.filter((t) => t.id !== tagId);
    setTags(next);
    setValue("tagIds", next.map((t) => t.id));
  }

  async function onSubmit(data: PostForm, status: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    const body = {
      ...data,
      content,
      status,
      tagIds: tags.map((t) => t.id),
      slug: data.slug || slugify(data.title),
    };
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const post = await res.json();
      router.push(`/admin/posts/${post.id}/edit`);
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error?.message || "保存失败");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回文章列表
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={saving}
            onClick={handleSubmit((d) => onSubmit(d, "DRAFT"))}
          >
            保存草稿
          </Button>
          <Button
            disabled={saving}
            onClick={handleSubmit((d) => onSubmit(d, "PUBLISHED"))}
          >
            发布
          </Button>
        </div>
      </div>

      <Input
        {...register("title")}
        placeholder="文章标题"
        className="text-4xl font-bold border-none px-0 focus-visible:ring-0"
        onChange={(e) => {
          register("title").onChange(e);
          setValue("slug", slugify(e.target.value));
        }}
      />
      {errors.title && (
        <p className="text-sm text-destructive">{errors.title.message}</p>
      )}

      <div className="flex flex-wrap gap-1 items-center">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => removeTag(tag.id)}
          >
            {tag.name} ×
          </Badge>
        ))}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="添加标签..."
          className="w-32 h-7 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput) {
              e.preventDefault();
              const existing = allTags.find((t) => t.name === tagInput);
              if (existing) {
                addTag(existing);
              } else {
                fetch("/api/tags", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: tagInput }),
                })
                  .then((r) => r.json())
                  .then((tag) => {
                    setAllTags([...allTags, tag]);
                    addTag(tag);
                  })
                  .catch(() => {});
              }
            }
          }}
        />
      </div>

      <TipTapEditor content={content} onChange={setContent} />

      <div className="space-y-2">
        <Label>摘要</Label>
        <Textarea
          {...register("excerpt")}
          placeholder="文章摘要（可选）"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input {...register("slug")} placeholder="article-slug" />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>
      <input type="hidden" {...register("content")} value={content} />
    </div>
  );
}
