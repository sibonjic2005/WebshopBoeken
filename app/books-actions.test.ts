import { jest, describe, it, expect, beforeEach } from "@jest/globals";

import { PAGE_SIZE, type BookDetail, type BookRow, type CategoryRow } from "./books-shared";
import { query } from "./db";
import {
  loadBook,
  loadBooks,
  loadCategories,
  loadFeaturedBooks,
  loadRecommended,
} from "./books-actions";

jest.mock("./db", () => ({
  query: jest.fn(),
}));

const queryMock = query as jest.MockedFunction<
  (sql: string, params?: unknown[]) => Promise<unknown[]>
>;

function lastQueryCall(): [string, unknown[] | undefined] {
  const call = queryMock.mock.calls.at(-1);
  expect(call).toBeDefined();
  return call as [string, unknown[] | undefined];
}

describe("books-actions", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  describe("loadBooks", () => {
    it("loads paginated books ordered with popular ISBNs first", async () => {
      const rows: BookRow[] = [
        {
          id: 1,
          title: "Nineteen Eighty-Four",
          isbn: "978-0452284234",
          price_cents: 1299,
          authors: "George Orwell",
        },
      ];
      queryMock.mockResolvedValue(rows);

      await expect(loadBooks(48)).resolves.toBe(rows);

      const [sql, params] = lastQueryCall();
      expect(sql).toContain("FROM book b");
      expect(sql).toContain("LEFT JOIN book_author ba ON ba.book_id = b.id");
      expect(sql).not.toContain("JOIN book_category bc");
      expect(sql).toContain("ORDER BY (REPLACE(b.isbn, '-', '') = ANY($3)) DESC, b.title, b.id");
      expect(sql).toContain("LIMIT $1 OFFSET $2");
      expect(params?.[0]).toBe(PAGE_SIZE);
      expect(params?.[1]).toBe(48);
      expect(params?.[2]).toEqual(expect.arrayContaining(["9780452284234", "9780142437247"]));
    });

    it("filters by category when a category id is provided", async () => {
      const rows: BookRow[] = [
        {
          id: 2,
          title: "Moby-Dick",
          isbn: "9780142437247",
          price_cents: 1599,
          authors: "Herman Melville",
        },
      ];
      queryMock.mockResolvedValue(rows);

      await expect(loadBooks(24, 7)).resolves.toBe(rows);

      const [sql, params] = lastQueryCall();
      expect(sql).toContain("JOIN book_category bc ON bc.book_id = b.id AND bc.category_id = $3");
      expect(sql).toContain("ORDER BY (REPLACE(b.isbn, '-', '') = ANY($4)) DESC, b.title, b.id");
      expect(params?.[0]).toBe(PAGE_SIZE);
      expect(params?.[1]).toBe(24);
      expect(params?.[2]).toBe(7);
      expect(params?.[3]).toEqual(expect.arrayContaining(["9780452284234", "9780142437247"]));
    });
  });

  it("loads top-level categories", async () => {
    const rows: CategoryRow[] = [{ id: 1, name: "Fiction" }];
    queryMock.mockResolvedValue(rows);

    await expect(loadCategories()).resolves.toBe(rows);

    const [sql, params] = lastQueryCall();
    expect(sql).toBe("SELECT id, name FROM category WHERE id <= 7 ORDER BY id");
    expect(params).toBeUndefined();
  });

  describe("loadBook", () => {
    it("returns the first matching book detail", async () => {
      const row: BookDetail = {
        id: 3,
        title: "Pride and Prejudice",
        isbn: "9780199535569",
        price_cents: 1099,
        stock: 12,
        publisher: "Oxford",
        authors: "Jane Austen",
        categories: "Classics",
      };
      queryMock.mockResolvedValue([row]);

      await expect(loadBook(3)).resolves.toBe(row);

      const [sql, params] = lastQueryCall();
      expect(sql).toContain("WHERE b.id = $1");
      expect(sql).toContain("GROUP BY b.id, p.name");
      expect(params).toEqual([3]);
    });

    it("returns null when the book is not found", async () => {
      queryMock.mockResolvedValue([]);

      await expect(loadBook(999)).resolves.toBeNull();
      expect(lastQueryCall()[1]).toEqual([999]);
    });
  });

  it("loads featured books from compact popular ISBNs", async () => {
    const rows: BookRow[] = [
      {
        id: 4,
        title: "Fahrenheit 451",
        isbn: "9781451673318",
        price_cents: 1399,
        authors: "Ray Bradbury",
      },
    ];
    queryMock.mockResolvedValue(rows);

    await expect(loadFeaturedBooks()).resolves.toBe(rows);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("WHERE REPLACE(b.isbn, '-', '') = ANY($1)");
    expect(sql).toContain("LIMIT 8");
    expect(params?.[0]).toEqual(expect.arrayContaining(["9780452284234", "9781451673318"]));
  });

  it("loads recommendations from the same categories excluding the current book", async () => {
    const rows: BookRow[] = [
      {
        id: 5,
        title: "Crime and Punishment",
        isbn: "9780140449136",
        price_cents: 1499,
        authors: "Fyodor Dostoevsky",
      },
    ];
    queryMock.mockResolvedValue(rows);

    await expect(loadRecommended(4)).resolves.toBe(rows);

    const [sql, params] = lastQueryCall();
    expect(sql).toContain("SELECT category_id FROM book_category WHERE book_id = $1");
    expect(sql).toContain("AND b.id != $1");
    expect(sql).toContain("LIMIT 3");
    expect(params).toEqual([4]);
  });
});
