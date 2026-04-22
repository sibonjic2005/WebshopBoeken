import { loadBooks } from "./books-actions";
import { BooksList } from "./books-list";

export default async function Home() {
  const initialBooks = await loadBooks(0);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Books</h1>
      <BooksList initialBooks={initialBooks} />
    </>
  );
}
