import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync } from "fs";
import { rm } from "fs/promises";
import { createGunzip } from "zlib";
import { createInterface } from "readline";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { dirname } from "path";
import { Pool } from "pg";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
const TARGET = parseInt(args[0] || "10000", 10);
const FORCE_DOWNLOAD = flags.has("--force-download");
const SKIP_IMPORT = flags.has("--download-only");

const INSERT_BATCH = 500;
const EDITIONS_DUMP = process.env.EDITIONS_DUMP || "./dumps/editions.txt.gz";
const AUTHORS_DUMP = process.env.AUTHORS_DUMP || "./dumps/authors.txt.gz";
const EDITIONS_URL =
  process.env.EDITIONS_URL || "https://openlibrary.org/data/ol_dump_editions_latest.txt.gz";
const AUTHORS_URL =
  process.env.AUTHORS_URL || "https://openlibrary.org/data/ol_dump_authors_latest.txt.gz";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function download(url: string, dest: string) {
  mkdirSync(dirname(dest), { recursive: true });
  const tmp = `${dest}.partial`;
  console.log(`Downloading ${url}\n  -> ${dest}`);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }
  const total = Number(res.headers.get("content-length")) || 0;
  let received = 0;
  let lastLog = Date.now();
  const started = Date.now();

  const reporter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      received += chunk.length;
      const now = Date.now();
      if (now - lastLog > 2000) {
        const mb = (received / 1024 / 1024).toFixed(1);
        const pct = total ? ` (${((received / total) * 100).toFixed(1)}%)` : "";
        const mbps = (received / 1024 / 1024 / ((now - started) / 1000)).toFixed(1);
        console.log(`  ${mb} MB${pct} @ ${mbps} MB/s`);
        lastLog = now;
      }
      controller.enqueue(chunk);
    },
  });

  await pipeline(
    Readable.fromWeb(res.body.pipeThrough(reporter) as any),
    createWriteStream(tmp)
  );

  const size = statSync(tmp).size;
  if (size < 1024 * 1024) {
    await rm(tmp);
    throw new Error(`Downloaded file too small (${size} bytes) — likely not the real dump`);
  }
  await rm(dest, { force: true });
  await pipeline(createReadStream(tmp), createWriteStream(dest));
  await rm(tmp);
  console.log(`  done (${(size / 1024 / 1024).toFixed(1)} MB)`);
}

async function ensureDumps() {
  for (const [path, url] of [
    [EDITIONS_DUMP, EDITIONS_URL],
    [AUTHORS_DUMP, AUTHORS_URL],
  ] as const) {
    if (FORCE_DOWNLOAD || !existsSync(path)) {
      await download(url, path);
    } else {
      console.log(`Using existing ${path} (${(statSync(path).size / 1024 / 1024).toFixed(1)} MB)`);
    }
  }
}

interface Book {
  title: string;
  isbn: string;
  publisher: string;
  authorKeys: string[];
  subjects: string[];
}

function pickIsbn13(isbns: string[] | undefined): string | null {
  if (!isbns) return null;
  for (const raw of isbns) {
    const clean = raw.replace(/[-\s]/g, "");
    if (/^97[89]\d{10}$/.test(clean)) return clean;
  }
  return null;
}

function splitAuthorName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  const lastName = parts.pop()!;
  return { firstName: parts.join(" "), lastName };
}

function randomPrice(): number {
  return 499 + Math.floor(Math.random() * 3500);
}

function randomStock(): number {
  return 1 + Math.floor(Math.random() * 50);
}

function openDumpLines(path: string): AsyncIterable<string> {
  const stream = createReadStream(path).pipe(createGunzip());
  return createInterface({ input: stream, crlfDelay: Infinity });
}

async function collectEditions(): Promise<{
  books: Book[];
  authorKeys: Set<string>;
}> {
  console.log(`Scanning editions dump: ${EDITIONS_DUMP}`);
  const books: Book[] = [];
  const authorKeys = new Set<string>();
  const seenIsbns = new Set<string>();
  let scanned = 0;

  for await (const line of openDumpLines(EDITIONS_DUMP)) {
    scanned++;
    if (scanned % 500000 === 0) {
      console.log(`  scanned ${scanned.toLocaleString()} editions, collected ${books.length}/${TARGET}`);
    }

    const tab = line.indexOf("\t", line.indexOf("\t", line.indexOf("\t", line.indexOf("\t") + 1) + 1) + 1);
    if (tab < 0) continue;
    const json = line.slice(tab + 1);

    let doc: any;
    try {
      doc = JSON.parse(json);
    } catch {
      continue;
    }

    if (!doc.title || !doc.publishers?.length || !doc.authors?.length) continue;
    const isbn = pickIsbn13(doc.isbn_13);
    if (!isbn || seenIsbns.has(isbn)) continue;

    const keys: string[] = [];
    for (const a of doc.authors.slice(0, 3)) {
      const k = typeof a === "string" ? a : a?.key;
      if (typeof k === "string" && k.startsWith("/authors/")) keys.push(k);
    }
    if (!keys.length) continue;

    seenIsbns.add(isbn);
    for (const k of keys) authorKeys.add(k);

    books.push({
      title: String(doc.title).slice(0, 500),
      isbn,
      publisher: String(doc.publishers[0]).slice(0, 255),
      authorKeys: keys,
      subjects: Array.isArray(doc.subjects)
        ? doc.subjects.slice(0, 5).map((s: any) => String(s).slice(0, 100))
        : [],
    });

    if (books.length >= TARGET) break;
  }

  console.log(`  collected ${books.length} editions, ${authorKeys.size} unique authors to resolve`);
  return { books, authorKeys };
}

async function resolveAuthors(needed: Set<string>): Promise<Map<string, string>> {
  console.log(`Scanning authors dump: ${AUTHORS_DUMP}`);
  const names = new Map<string, string>();
  let scanned = 0;

  for await (const line of openDumpLines(AUTHORS_DUMP)) {
    scanned++;
    if (scanned % 500000 === 0) {
      console.log(`  scanned ${scanned.toLocaleString()} authors, resolved ${names.size}/${needed.size}`);
    }

    const parts = line.split("\t");
    if (parts.length < 5) continue;
    const key = parts[1];
    if (!needed.has(key)) continue;

    let doc: any;
    try {
      doc = JSON.parse(parts[4]);
    } catch {
      continue;
    }

    const name = doc.name || doc.personal_name;
    if (typeof name === "string" && name.trim()) {
      names.set(key, name.trim());
      if (names.size === needed.size) break;
    }
  }

  console.log(`  resolved ${names.size}/${needed.size} authors`);
  return names;
}

async function insertAll(books: Book[], authorNames: Map<string, string>) {
  console.log(`Inserting ${books.length} books...`);
  const client = await pool.connect();

  try {
    const publisherIds = new Map<string, number>();
    const categoryIds = new Map<string, number>();
    const authorIds = new Map<string, number>();

    const publishers = new Set(books.map((b) => b.publisher));
    const categories = new Set(books.flatMap((b) => b.subjects));
    const authors = new Set<string>();
    for (const b of books) for (const k of b.authorKeys) {
      const n = authorNames.get(k);
      if (n) authors.add(n);
    }

    await client.query("BEGIN");

    for (const name of publishers) {
      const r = await client.query(
        `INSERT INTO publisher (name) VALUES ($1) RETURNING id`,
        [name]
      );
      publisherIds.set(name, r.rows[0].id);
    }

    for (const name of categories) {
      const r = await client.query(
        `INSERT INTO category (name) VALUES ($1) RETURNING id`,
        [name]
      );
      categoryIds.set(name, r.rows[0].id);
    }

    for (const fullName of authors) {
      const { firstName, lastName } = splitAuthorName(fullName);
      const r = await client.query(
        `INSERT INTO author (first_name, last_name) VALUES ($1, $2) RETURNING id`,
        [firstName, lastName]
      );
      authorIds.set(fullName, r.rows[0].id);
    }

    let inserted = 0;
    for (let i = 0; i < books.length; i += INSERT_BATCH) {
      const batch = books.slice(i, i + INSERT_BATCH);
      const values: any[] = [];
      const placeholders: string[] = [];
      batch.forEach((b, idx) => {
        const o = idx * 5;
        placeholders.push(`($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5})`);
        values.push(b.title, b.isbn, randomPrice(), randomStock(), publisherIds.get(b.publisher));
      });

      const r = await client.query(
        `INSERT INTO book (title, isbn, price_cents, stock, publisher_id)
         VALUES ${placeholders.join(",")}
         ON CONFLICT (isbn) DO NOTHING
         RETURNING id, isbn`,
        values
      );

      const idByIsbn = new Map<string, number>(r.rows.map((row: any) => [row.isbn, row.id]));

      const baLinks: any[] = [];
      const bcLinks: any[] = [];
      for (const b of batch) {
        const bookId = idByIsbn.get(b.isbn);
        if (!bookId) continue;
        for (const k of b.authorKeys) {
          const n = authorNames.get(k);
          const aId = n ? authorIds.get(n) : undefined;
          if (aId) baLinks.push([bookId, aId]);
        }
        for (const s of b.subjects) {
          const cId = categoryIds.get(s);
          if (cId) bcLinks.push([bookId, cId]);
        }
      }

      if (baLinks.length) {
        const ph = baLinks.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(",");
        await client.query(
          `INSERT INTO book_author (book_id, author_id) VALUES ${ph} ON CONFLICT DO NOTHING`,
          baLinks.flat()
        );
      }
      if (bcLinks.length) {
        const ph = bcLinks.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(",");
        await client.query(
          `INSERT INTO book_category (book_id, category_id) VALUES ${ph} ON CONFLICT DO NOTHING`,
          bcLinks.flat()
        );
      }

      inserted += idByIsbn.size;
      console.log(`  inserted ${inserted}/${books.length}`);
    }

    await client.query("COMMIT");
    console.log(`Done. Inserted ${inserted} books, ${publishers.size} publishers, ${authors.size} authors, ${categories.size} categories.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  await ensureDumps();
  if (SKIP_IMPORT) {
    console.log("Download-only mode, skipping import.");
    await pool.end();
    return;
  }
  const { books, authorKeys } = await collectEditions();
  if (!books.length) {
    console.log("No books collected.");
    await pool.end();
    return;
  }
  const authorNames = await resolveAuthors(authorKeys);
  await insertAll(books, authorNames);
  await pool.end();
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await pool.end().catch(() => {});
  process.exit(1);
});
