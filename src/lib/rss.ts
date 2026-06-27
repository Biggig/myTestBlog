import { prisma } from "./prisma";
import { extractTextFromTipTap } from "./content";

/**
 * Format a Date to RFC 822 (UTC) for RSS pubDate / lastBuildDate.
 */
function toRfc822(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const pad = (n: number) => String(n).padStart(2, "0");

  const dayName = days[date.getUTCDay()];
  const day = pad(date.getUTCDate());
  const mon = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const h = pad(date.getUTCHours());
  const m = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());

  return `${dayName}, ${day} ${mon} ${year} ${h}:${m}:${s} GMT`;
}

/**
 * Escape XML special characters in text content.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Wrap text in a CDATA section.
 */
function cdata(text: string): string {
  return `<![CDATA[${text}]]>`;
}

/**
 * Generate a full RSS 2.0 XML feed string.
 * Fetches the latest 20 PUBLISHED posts (with tags), ordered by publishedAt descending.
 */
export async function generateRssFeed(): Promise<string> {
  const blogName = process.env.NEXT_PUBLIC_BLOG_NAME || "MyBlog";
  const blogDesc = process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || "";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const rssUrl = `${baseUrl}/rss.xml`;

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  const now = toRfc822(new Date());

  const items = posts
    .map((post) => {
      const link = `${baseUrl}/posts/${post.slug}`;
      const pubDate = post.publishedAt
        ? toRfc822(post.publishedAt)
        : toRfc822(post.createdAt);

      const rawText = extractTextFromTipTap(post.content);
      const description =
        post.excerpt || (rawText ? rawText.slice(0, 300) : "");

      const categories = post.tags
        .map(
          (pt) => `    <category>${escapeXml(pt.tag.name)}</category>`,
        )
        .join("\n");

      return [
        "  <item>",
        `    <title>${cdata(post.title)}</title>`,
        `    <link>${escapeXml(link)}</link>`,
        `    <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `    <pubDate>${pubDate}</pubDate>`,
        `    <description>${cdata(description)}</description>`,
        categories,
        "  </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(blogName)}</title>`,
    `    <link>${escapeXml(baseUrl)}</link>`,
    `    <description>${escapeXml(blogDesc)}</description>`,
    "    <language>zh-CN</language>",
    `    <lastBuildDate>${now}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(rssUrl)}" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}
