import React from "react";
import BookCard from "@/app/books/components/bookCard";
import { query } from "@/app/db";

interface Book {
  id: number;
  title: string;
  price_cents: number;
}

export default async function BooksPage() {
  let books: Book[] = [];
  
  try {
    books = await query<Book>(
      `SELECT b.id, b.title, b.price_cents 
       FROM book b 
       ORDER BY b.title ASC`
    );
  } catch (error) {
    console.error("Failed to fetch books:", error);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Browse Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.length === 0 ? (
          <p className="text-gray-500 col-span-full">No books available.</p>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author="Author Name"
              price={book.price_cents}
            />
          ))
        )}
      </div>
    </div>
  );
}
