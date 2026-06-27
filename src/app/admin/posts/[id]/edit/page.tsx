"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";

type PostForm = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PostForm>({ resolver: zodResolver(postSchema) });

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ])
      .then(([post, tagsList]) => {
        setAllTags(Array.isArray(tagsList) ? tagsList : []);
        const postTags = post.tags || [];
        setTags(postTags);
        setContent(post.content || "{}");
        setValue("title", post.title || "");
        setValue("slug", post.slug || "");
        setValue("content", post.content || "{}");
        setValue("excerpt", post.excerpt || "");
        setValue("status", post.status || "DRAFT");
        setValue("tagIds", postTags.map((t: { id: string }) => t.id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, setValue]);

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
    };
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error?.message || "保存失败");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/posts")}>
          ← 返回文章列表
        </Button>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">
            字数：{content.replace(/<[^>]*>/g, "").length} 字
          </span>
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
            {saving ? "保存中..." : "发布"}
          </Button>
        </div>
      </div>
      <Input
        {...register("title")}
        placeholder="文章标题"
        className="text-4xl font-bold border-none px-0 focus-visible:ring-0"
      />
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
        <Input {...register("slug")} />
      </div>
      <input type="hidden" {...register("content")} value={content} />
      <input type="hidden" {...register("status")} />
    </div>
  );
}
