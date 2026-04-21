import React from "react";
import ReviewList, { type Review } from "@/app/books/components/ReviewList";
import ReviewForm from "@/app/books/components/ReviewForm";
import { getBookReviews, getAverageRating } from "@/app/books/actions";
import { query } from "@/app/db";

interface Book {
  id: number;
  title: string;
  price_cents: number;
}

interface BookDetailsProps {
  params: {
    id: string;
  };
}

export default async function BookDetails({ params }: BookDetailsProps) {
  const bookId = parseInt(params.id, 10);

  let book: Book | null = null;
  const reviews = await getBookReviews(bookId);
  const averageRating = await getAverageRating(bookId);

  try {
    const bookResults = await query<Book>(
      `SELECT b.id, b.title, b.price_cents FROM book b WHERE b.id = $1`,
      [bookId]
    );
    book = bookResults[0] || null;
  } catch (error) {
    console.error("Failed to fetch book:", error);
  }

  if (!book) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-red-600">Book not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-4">{book.title}</h1>

      <div className="space-y-1 text-gray-700">
        <p><span className="font-semibold">Price:</span> ${(book.price_cents / 100).toFixed(2)}</p>
      </div>

      <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Add to Cart
      </button>

      <ReviewList reviews={reviews as Review[]} averageRating={averageRating} />
      <ReviewForm bookId={bookId} userId={null} />
    </div>
  );
};
