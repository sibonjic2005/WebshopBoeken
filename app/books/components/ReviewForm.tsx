"use client";

import React, { useState } from "react";
import { createReview } from "@/app/books/actions";

interface ReviewFormProps {
  bookId: number;
  userId: number | null;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ bookId, userId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!userId) {
    return (
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800">Please log in to leave a review.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await createReview(bookId, userId, rating, text);
      setSuccess(true);
      setText("");
      setRating(5);
      onReviewSubmitted?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">Review submitted successfully!</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Rating (1-10)</label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-yellow-400 text-2xl">{"★".repeat(rating)}{"☆".repeat(10 - rating)}</span>
            <span className="font-semibold text-lg">{rating}</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Your Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this book..."
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            rows={5}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
