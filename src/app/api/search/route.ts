import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchPosts(q.trim());
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message: "搜索失败" } },
      { status: 500 }
    );
  }
}
