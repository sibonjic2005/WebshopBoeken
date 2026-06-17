import { redis } from "./redis";

const VIEWS_KEY = "book:views";

export async function incrementBookView(bookId: number): Promise<void> {
  await redis.zincrby(VIEWS_KEY, 1, String(bookId));
}

export async function getBookViews(bookId: number): Promise<number> {
  const score = await redis.zscore(VIEWS_KEY, String(bookId));
  return score ? parseInt(score, 10) : 0;
}

export async function getPopularBooks(limit = 10): Promise<{ bookId: number; views: number }[]> {
  const rows = await redis.zrevrange(VIEWS_KEY, 0, limit - 1, "WITHSCORES");
  const result: { bookId: number; views: number }[] = [];
  for (let i = 0; i < rows.length; i += 2) {
    result.push({ bookId: parseInt(rows[i], 10), views: parseInt(rows[i + 1], 10) });
  }
  return result;
}
