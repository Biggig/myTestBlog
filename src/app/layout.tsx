import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchDialog } from "@/components/search/search-dialog";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_BLOG_NAME || "MyBlog",
    template: `%s | ${process.env.NEXT_PUBLIC_BLOG_NAME || "MyBlog"}`,
  },
  description: process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || "",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
  openGraph: {
    type: "website",
    siteName: process.env.NEXT_PUBLIC_BLOG_NAME || "MyBlog",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <SearchDialog />
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
