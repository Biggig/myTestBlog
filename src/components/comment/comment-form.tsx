"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  authorName: z.string().min(1, "昵称不能为空").max(50, "昵称不能超过50个字符"),
  authorEmail: z
    .string()
    .email("邮箱格式不正确")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(1, "评论内容不能为空")
    .max(5000, "评论内容不能超过5000个字符"),
  captchaAnswer: z.string().min(1, "请填写验证码"),
});

type FormValues = z.infer<typeof formSchema>;

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({ postId, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
      captchaAnswer: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: values.authorName,
          authorEmail: values.authorEmail || undefined,
          content: values.content,
          postId,
          parentId: parentId || undefined,
          captchaAnswer: Number(values.captchaAnswer),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        form.setError("root", {
          message: data.error?.message || "提交失败，请重试",
        });
        return;
      }

      setSuccessMsg("评论已提交，审核通过后显示");
      form.reset();
      onSuccess?.();
    } catch {
      form.setError("root", {
        message: "网络错误，请重试",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">{successMsg}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {parentId && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">回复评论</p>
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                取消回复
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>昵称 *</FormLabel>
                <FormControl>
                  <Input placeholder="你的昵称" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱（选填，用于 Gravatar 头像）</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>评论内容 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="写下你的评论..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="captchaAnswer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>验证码：3 + 5 = ?</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="请输入答案"
                  className="max-w-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? "提交中..." : "提交评论"}
        </Button>
      </form>
    </Form>
  );
}
