"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/posts/new", label: "新建文章" },
  { href: "/admin/comments", label: "评论审核" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-muted border-r border-border p-4 flex flex-col">
      <Link href="/admin" className="text-xl font-bold mb-8 text-primary">
        MyBlog Admin
      </Link>
      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm transition-colors",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 pt-4 border-t border-border">
        <Link
          href="/"
          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ← 返回博客
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          退出登录
        </Button>
      </div>
    </aside>
  );
}
