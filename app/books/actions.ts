"use server";

import { query } from "@/app/db";
import { revalidatePath } from "next/cache";

export async function createReview(
  bookId: number,
  userId: number,
  rating: number,
  text: string,
) {
    
  if (text.trim().length === 0) {
    throw new Error("Review text cannot be empty");
  }

  try {
    await query(
      "INSERT INTO review (user_id, book_id, rating, text) VALUES ($1, $2, $3, $4)",
      [userId, bookId, 5, text]
    );

    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    throw new Error("Failed to create review");
  }
}

export async function getBookReviews(bookId: number) {
  try {
    const reviews = await query(
      `SELECT 
        r.id,
        r.text,
        r.created_at,
        c.first_name,
        c.last_name
      FROM review r
      JOIN customer c ON r.user_id = c.id
      WHERE r.book_id = $1
      ORDER BY r.created_at DESC`,
      [bookId]
    );

    return reviews;
  } catch (error) {
    throw new Error("Failed to fetch reviews");
  }
}

export async function getAverageRating(bookId: number) {
  try {
    const result = await query<{ avg_rating: number | null }>(
      `SELECT AVG(rating)::NUMERIC(3,1) as avg_rating FROM review WHERE book_id = $1`,
      [bookId]
    );

    return result[0]?.avg_rating || 0;
  } catch (error) {
    throw new Error("Failed to fetch average rating");
  }
}
