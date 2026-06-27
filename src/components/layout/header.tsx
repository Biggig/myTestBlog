import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold hover:text-primary transition-colors">
          MyBlog
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/tags" className="text-sm text-muted-foreground hover:text-foreground">标签</Link>
          <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">搜索</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
