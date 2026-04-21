import React from "react";

interface BookDetailsComponentProps {
  title: string;
  author: string;
  publisher: string;
  publishedDate: string;
  pageCount: number;
  categories: string[];
  description: string;
  price: number;
  rating?: number;
}

export default function BookDetailsComponent({
  title,
  author,
  publisher,
  publishedDate,
  pageCount,
  categories,
  description,
  price,
  rating,
}: BookDetailsComponentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>

        <div className="space-y-2 text-gray-700 mb-6">
          <p>
            <span className="font-semibold">Author(s):</span> {author}
          </p>
          <p>
            <span className="font-semibold">Publisher:</span> {publisher}
          </p>
          <p>
            <span className="font-semibold">Published Date:</span> {publishedDate}
          </p>
          <p>
            <span className="font-semibold">Page Count:</span> {pageCount}
          </p>
          <p>
            <span className="font-semibold">Categories:</span> {categories.join(", ")}
          </p>
        </div>

        {rating !== undefined && (
          <div className="mb-4">
            <p className="font-semibold mb-1">Rating:</p>
            <div className="text-yellow-400 text-lg">
              {"★".repeat(Math.round(rating))}{"☆".repeat(10 - Math.round(rating))} {rating}/10
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-lg">Description:</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg h-fit">
        <p className="text-3xl font-bold text-blue-600 mb-4">${(price / 100).toFixed(2)}</p>
        <button className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
