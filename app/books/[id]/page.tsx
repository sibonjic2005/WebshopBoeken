import React from "react";

const BookDetails = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-4">📖 Book Details (Placeholder)</h1>

      <h2 className="text-2xl font-semibold mb-2">Book Title Placeholder</h2>

      <div className="space-y-1 text-gray-700">
        <p><span className="font-semibold">Author(s):</span> Author Name Placeholder</p>
        <p><span className="font-semibold">Publisher:</span> Publisher Placeholder</p>
        <p><span className="font-semibold">Published Date:</span> YYYY-MM-DD</p>
        <p><span className="font-semibold">Page Count:</span> 123</p>
        <p><span className="font-semibold">Categories:</span> Category 1, Category 2</p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Description:</h3>
        <p className="text-gray-600">
          This is a placeholder description for the book.
        </p>
      </div>

      <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Add to Cart
      </button>
    </div>
  );
};

export default BookDetails;