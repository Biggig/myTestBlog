import { prisma } from "./prisma";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  headline: string;
  publishedAt: Date | null;
  rank: number;
}

export async function searchPosts(
  query: string,
  limit = 10
): Promise<SearchResult[]> {
  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      ts_headline('simple', p."content", plainto_tsquery('simple', ${query}),
        'MaxWords=50, MinWords=20, ShortWord=3, MaxFragments=3, FragmentDelimiter="..."'
      ) as headline,
      p."publishedAt",
      ts_rank(p."searchVector", plainto_tsquery('simple', ${query})) as rank
    FROM "Post" p
    WHERE p.status = 'PUBLISHED'
      AND p."searchVector" @@ plainto_tsquery('simple', ${query})
    ORDER BY rank DESC
    LIMIT ${limit}
  `;

  return results;
}
