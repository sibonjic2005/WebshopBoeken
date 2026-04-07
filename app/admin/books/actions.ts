"use server";

import { query } from "@/app/db";
import { redirect } from "next/navigation";

async function resolvePublisher(value: string): Promise<number> {
  if (value.startsWith("new:")) {
    const name = value.slice(4);
    const rows = await query<{ id: number }>(
      "INSERT INTO publisher (name) VALUES ($1) RETURNING id",
      [name]
    );
    return rows[0].id;
  }
  return parseInt(value, 10);
}

async function resolveAuthorIds(values: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const value of values) {
    if (value.startsWith("new:")) {
      const fullName = value.slice(4).trim();
      const spaceIndex = fullName.lastIndexOf(" ");
      const firstName = spaceIndex > 0 ? fullName.slice(0, spaceIndex) : fullName;
      const lastName = spaceIndex > 0 ? fullName.slice(spaceIndex + 1) : "";
      const rows = await query<{ id: number }>(
        "INSERT INTO author (first_name, last_name) VALUES ($1, $2) RETURNING id",
        [firstName, lastName]
      );
      ids.push(rows[0].id);
    } else {
      ids.push(parseInt(value, 10));
    }
  }
  return ids;
}

async function resolveCategoryIds(values: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const value of values) {
    if (value.startsWith("new:")) {
      const name = value.slice(4);
      const rows = await query<{ id: number }>(
        "INSERT INTO category (name) VALUES ($1) RETURNING id",
        [name]
      );
      ids.push(rows[0].id);
    } else {
      ids.push(parseInt(value, 10));
    }
  }
  return ids;
}

export async function createBook(formData: FormData) {
  const title = formData.get("title") as string;
  const isbn = formData.get("isbn") as string;
  const priceCents = parseInt(formData.get("price_cents") as string, 10);
  const stock = parseInt(formData.get("stock") as string, 10);

  const publisherId = await resolvePublisher(formData.get("publisher") as string);
  const authorIds = await resolveAuthorIds(formData.getAll("authors") as string[]);
  const categoryIds = await resolveCategoryIds(formData.getAll("categories") as string[]);

  const rows = await query<{ id: number }>(
    "INSERT INTO book (title, isbn, price_cents, stock, publisher_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [title, isbn, priceCents, stock, publisherId]
  );
  const bookId = rows[0].id;

  for (const authorId of authorIds) {
    await query("INSERT INTO book_author (book_id, author_id) VALUES ($1, $2)", [
      bookId,
      authorId,
    ]);
  }
  for (const categoryId of categoryIds) {
    await query(
      "INSERT INTO book_category (book_id, category_id) VALUES ($1, $2)",
      [bookId, categoryId]
    );
  }

  redirect("/admin/books");
}

export async function updateBook(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const isbn = formData.get("isbn") as string;
  const priceCents = parseInt(formData.get("price_cents") as string, 10);
  const stock = parseInt(formData.get("stock") as string, 10);

  const publisherId = await resolvePublisher(formData.get("publisher") as string);
  const authorIds = await resolveAuthorIds(formData.getAll("authors") as string[]);
  const categoryIds = await resolveCategoryIds(formData.getAll("categories") as string[]);

  await query(
    "UPDATE book SET title = $1, isbn = $2, price_cents = $3, stock = $4, publisher_id = $5 WHERE id = $6",
    [title, isbn, priceCents, stock, publisherId, id]
  );

  await query("DELETE FROM book_author WHERE book_id = $1", [id]);
  for (const authorId of authorIds) {
    await query("INSERT INTO book_author (book_id, author_id) VALUES ($1, $2)", [
      id,
      authorId,
    ]);
  }

  await query("DELETE FROM book_category WHERE book_id = $1", [id]);
  for (const categoryId of categoryIds) {
    await query(
      "INSERT INTO book_category (book_id, category_id) VALUES ($1, $2)",
      [id, categoryId]
    );
  }

  redirect("/admin/books");
}

export async function deleteBook(formData: FormData) {
  const id = formData.get("id") as string;
  await query("DELETE FROM book_author WHERE book_id = $1", [id]);
  await query("DELETE FROM book_category WHERE book_id = $1", [id]);
  await query("DELETE FROM book WHERE id = $1", [id]);
  redirect("/admin/books");
}
