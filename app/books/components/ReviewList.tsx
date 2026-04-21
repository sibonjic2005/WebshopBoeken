"use client";

import React from "react";

export interface Review {
  id: number;
  rating: number;
  text: string;
  created_at: string;
  first_name: string;
  last_name: string;
}

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
}

export default function ReviewList({ reviews, averageRating }: ReviewListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Reviews</h3>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-lg">
            {renderStars(Math.round(averageRating))}
          </div>
          <span className="text-gray-600">
            {averageRating > 0 ? `${averageRating}/10 (${reviews.length} reviews)` : "No reviews yet"}
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet. Be the first to review this book!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold">
                    {review.first_name} {review.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                </div>
                <div className="flex text-yellow-400">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
