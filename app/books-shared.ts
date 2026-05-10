export type BookRow = {
  id: number;
  title: string;
  isbn: string;
  price_cents: number;
  authors: string;
};

export type CategoryRow = {
  id: number;
  name: string;
};

export type BookDetail = {
  id: number;
  title: string;
  isbn: string;
  price_cents: number;
  stock: number;
  publisher: string;
  authors: string;
  categories: string;
};

export const PAGE_SIZE = 24;
