import { generateRssFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = await generateRssFeed();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
