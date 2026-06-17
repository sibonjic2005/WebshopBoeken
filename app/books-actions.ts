"use server";

import { query } from "./db";
import { PAGE_SIZE, type BookRow, type CategoryRow, type BookDetail } from "./books-shared";

export async function loadBooks(offset: number, categoryId?: number): Promise<BookRow[]> {
  const popular = POPULAR_ISBNS.map((isbn) => isbn.replace(/-/g, ""));
  if (categoryId) {
    return query<BookRow>(
      `SELECT b.id, b.title, b.isbn, b.price_cents,
              STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
         FROM book b
         JOIN book_category bc ON bc.book_id = b.id AND bc.category_id = $3
         LEFT JOIN book_author ba ON ba.book_id = b.id
         LEFT JOIN author a ON a.id = ba.author_id
        GROUP BY b.id
        ORDER BY (REPLACE(b.isbn, '-', '') = ANY($4)) DESC, b.title, b.id
        LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset, categoryId, popular],
    );
  }
  return query<BookRow>(
    `SELECT b.id, b.title, b.isbn, b.price_cents,
            STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
       FROM book b
       LEFT JOIN book_author ba ON ba.book_id = b.id
       LEFT JOIN author a ON a.id = ba.author_id
      GROUP BY b.id
      ORDER BY (REPLACE(b.isbn, '-', '') = ANY($3)) DESC, b.title, b.id
      LIMIT $1 OFFSET $2`,
    [PAGE_SIZE, offset, popular],
  );
}

export async function loadCategories(): Promise<CategoryRow[]> {
  return query<CategoryRow>(
    `SELECT id, name FROM category WHERE id <= 7 ORDER BY id`,
  );
}

export async function loadBook(id: number): Promise<BookDetail | null> {
  const rows = await query<BookDetail>(
    `SELECT b.id, b.title, b.isbn, b.price_cents, b.stock,
            p.name AS publisher,
            STRING_AGG(DISTINCT a.first_name || ' ' || a.last_name, ', ') AS authors,
            STRING_AGG(DISTINCT c.name, ', ') AS categories
       FROM book b
       LEFT JOIN publisher p ON p.id = b.publisher_id
       LEFT JOIN book_author ba ON ba.book_id = b.id
       LEFT JOIN author a ON a.id = ba.author_id
       LEFT JOIN book_category bc ON bc.book_id = b.id
       LEFT JOIN category c ON c.id = bc.category_id
      WHERE b.id = $1
      GROUP BY b.id, p.name`,
    [id],
  );
  return rows[0] ?? null;
}

// ISBNs (compact, no hyphens) of well-known popular books.
// Includes multiple editions per title to maximise catalog matches.
const POPULAR_ISBNS = [
  // Seeded books — exact editions in the DB
  "9780452284234", // Nineteen Eighty-Four (Plume)
  "9780142437247", // Moby-Dick (Penguin)
  "9780199535569", // Pride and Prejudice (Oxford)
  "9780140449136", // Crime and Punishment (Penguin)
  "9781451673318", // Fahrenheit 451 (S&S)
  "9780684801223", // The Old Man and the Sea (Scribner)
  "9782070612758", // Le Petit Prince (Gallimard)
  "9781476753836", // Salt, Fat, Acid, Heat
  "9780735619678", // Code Complete 2
  // Additional popular editions
  "9780451524935", // Nineteen Eighty-Four (Signet)
  "9781784874155", // Nineteen Eighty-Four (Penguin Modern Classics)
  "9780743273565", // The Great Gatsby
  "9780061120084", // To Kill a Mockingbird
  "9780316769174", // The Catcher in the Rye
  "9780316769075", // The Catcher in the Rye (alt)
  "9780385333481", // The Handmaid's Tale
  "9780060850524", // Brave New World
  "9780060935467", // Fahrenheit 451 (Harper)
  "9781451673319", // Fahrenheit 451 (S&S alt)
  "9780060930448", // One Hundred Years of Solitude
  "9780679720203", // The Brothers Karamazov
  "9780140447934", // War and Peace
  "9780743297332", // Moby-Dick (S&S)
  "9780684801469", // The Old Man and the Sea (alt)
  "9780141439556", // Great Expectations
  "9780141187761", // Wuthering Heights
  "9780141439754", // Jane Eyre
  "9780140447620", // The Odyssey
  "9780140444438", // The Iliad
  "9780385490818", // The Name of the Rose
  "9780747532699", // Harry Potter and the Philosopher's Stone
  "9780439136365", // Harry Potter and the Goblet of Fire
  "9780590353427", // Harry Potter and the Sorcerer's Stone (US)
  "9780439064873", // Harry Potter and the Chamber of Secrets
  "9780439136358", // Harry Potter and the Prisoner of Azkaban
  "9780439785969", // Harry Potter and the Half-Blood Prince
  "9780545010221", // Harry Potter and the Deathly Hallows
  "9780618346257", // The Hobbit
  "9780618002221", // The Lord of the Rings
  "9780062315007", // The Alchemist
  "9781594489501", // The Kite Runner
  "9780385737951", // The Hunger Games
  "9780439023481", // The Hunger Games (alt)
  "9780307588371", // The Girl with the Dragon Tattoo
  "9780316346627", // Gone Girl
  "9780062409850", // Sapiens
  "9780062316110", // Thinking, Fast and Slow
  "9780385347952", // The Hitchhiker's Guide to the Galaxy
  "9780671027032", // How to Win Friends and Influence People
  "9780743223133", // Man's Search for Meaning
  "9781501156700", // Salt, Fat, Acid, Heat (alt)
  "9780735224292", // Educated
  "9780525559023", // Where the Crawdads Sing
  "9781250301697", // Normal People
  "9780735219090", // The Silent Patient
  "9780735224537", // The Midnight Library
  "9780525559177", // The Vanishing Half
  "9780062991331", // Circe
  "9780525432159", // Little Fires Everywhere
  "9780374528119", // Beloved
  "9780385490130", // The Unbearable Lightness of Being
  "9780679602880", // Lolita
  "9780679723202", // The Metamorphosis
  "9780679734475", // The Trial
  "9780140449174", // Madame Bovary
  "9780140449259", // The Divine Comedy
  "9780061743528", // Les Misérables
];

export async function loadFeaturedBooks(): Promise<BookRow[]> {
  const compact = POPULAR_ISBNS.map((isbn) => isbn.replace(/-/g, ""));
  return query<BookRow>(
    `SELECT b.id, b.title, b.isbn, b.price_cents,
            STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
       FROM book b
       LEFT JOIN book_author ba ON ba.book_id = b.id
       LEFT JOIN author a ON a.id = ba.author_id
      WHERE REPLACE(b.isbn, '-', '') = ANY($1)
      GROUP BY b.id
      LIMIT 8`,
    [compact],
  );
}

export async function loadRecommended(bookId: number): Promise<BookRow[]> {
  return query<BookRow>(
    `WITH chosen_categories AS (
        SELECT category_id
        FROM book_category
        WHERE book_id = $1
      )
    SELECT DISTINCT b.id, b.title, b.isbn, b.price_cents,
            STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
       FROM book b
       JOIN book_category bc ON bc.book_id = b.id
       LEFT JOIN book_author ba ON ba.book_id = b.id
       LEFT JOIN author a ON a.id = ba.author_id
      WHERE bc.category_id IN (
        SELECT category_id FROM chosen_categories)
        AND b.id != $1
      GROUP BY b.id
      LIMIT 3`,
    [bookId],
  );
}


//2 checks, is er wel ingelogd en zijn er aankopen gedaan.
export async function loadRecommendedBooks(userId: number | null): Promise<BookRow[]> {
  if (userId) {
    const personalizedRecommendation = await query<BookRow>(
      `WITH
        purchased_category_user AS (
          SELECT DISTINCT bc.category_id
          FROM order_line ol
          JOIN shop_order so ON so.id = ol.order_id
          JOIN book_category bc ON bc.book_id = ol.book_id
          WHERE so.user_id = $1
        ),
        already_bought AS (
          SELECT ol2.book_id
          FROM order_line ol2
          JOIN shop_order so2 ON so2.id = ol2.order_id
          WHERE so2.user_id = $1
        )
       SELECT b.id, b.title, b.isbn, b.price_cents,
              STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
         FROM book b
         JOIN book_category bc2 ON bc2.book_id = b.id
         JOIN order_line ol3 ON ol3.book_id = b.id
         JOIN shop_order so3 ON so3.id = ol3.order_id
         LEFT JOIN book_author ba ON ba.book_id = b.id
         LEFT JOIN author a ON a.id = ba.author_id
        WHERE bc2.category_id IN (SELECT category_id FROM purchased_category_user)
          AND b.id NOT IN (SELECT book_id FROM already_bought)
        GROUP BY b.id
        ORDER BY COUNT(ol3.id) DESC
        LIMIT 3`,
      [userId]
    );

    // DIT WAS NOG ZONDER CTE.
    // const personalizedRecommendation = await query<BookRow>(
    //   `SELECT b.id, b.title, b.isbn, b.price_cents,
    //           STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
    //      FROM book b
    //      JOIN book_category bc ON bc.book_id = b.id
    //      JOIN order_line ol ON ol.book_id = b.id
    //      JOIN shop_order so ON so.id = ol.order_id
    //      LEFT JOIN book_author ba ON ba.book_id = b.id
    //      LEFT JOIN author a ON a.id = ba.author_id
    //     WHERE bc.category_id IN (
    //       SELECT DISTINCT bc2.category_id
    //       FROM order_line ol2
    //       JOIN shop_order so2 ON so2.id = ol2.order_id
    //       JOIN book_category bc2 ON bc2.book_id = ol2.book_id
    //       WHERE so2.user_id = $1
    //     )
    //     AND b.id NOT IN (
    //       SELECT ol3.book_id
    //       FROM order_line ol3
    //       JOIN shop_order so3 ON so3.id = ol3.order_id
    //       WHERE so3.user_id = $1
    //     )
    //     GROUP BY b.id
    //     ORDER BY COUNT(ol.id) DESC
    //     LIMIT 3`,
    //   [userId]
    // );

    //deze check is om te kijken of er wel aankopen zijn gedaan. anders valt het neer naar de else hieronder.
    if (personalizedRecommendation.length > 0){
      return personalizedRecommendation;
    }
  }

  // dit is wat er runt als er geen user is of er geen aankopen zijn .
  return query<BookRow>(
    `SELECT b.id, b.title, b.isbn, b.price_cents,
            STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
       FROM book b
       JOIN order_line ol ON ol.book_id = b.id
       LEFT JOIN book_author ba ON ba.book_id = b.id
       LEFT JOIN author a ON a.id = ba.author_id
      GROUP BY b.id
      ORDER BY COUNT(ol.id) DESC
      LIMIT 3`,
    []
  );
}
