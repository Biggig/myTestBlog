import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto py-24 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-8">页面未找到</p>
      <Link href="/" className="text-primary hover:underline">
        返回首页
      </Link>
    </div>
  );
}
