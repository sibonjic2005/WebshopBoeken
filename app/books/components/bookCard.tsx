import React from "react";

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  price: number;
  image?: string;
  rating?: number;
}

export default function BookCard({ id, title, author, price, image, rating }: BookCardProps) {
  return (
    <div className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition p-4">
      {image && (
        <img src={image} alt={title} className="w-full h-40 object-cover rounded mb-3" />
      )}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-600 text-sm mb-2">{author}</p>
      {rating && (
        <p className="text-yellow-500 text-sm mb-2">
          {"★".repeat(Math.round(rating))}{"☆".repeat(10 - Math.round(rating))} {rating}/10
        </p>
      )}
      <p className="text-lg font-semibold text-blue-600 mb-3">${(price / 100).toFixed(2)}</p>
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
        View Details
      </button>
    </div>
  );
}
