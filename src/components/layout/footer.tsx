export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MyBlog ·{" "}
          <a href="/rss.xml" className="hover:text-primary" target="_blank" rel="noopener">
            RSS 订阅
          </a>
        </p>
      </div>
    </footer>
  );
}
