CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS address (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES customer(id),
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS publisher (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS book (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    isbn TEXT NOT NULL UNIQUE,
    price_cents INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    publisher_id INT NOT NULL REFERENCES publisher(id)
);

CREATE TABLE IF NOT EXISTS author (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    bio TEXT
);

CREATE TABLE IF NOT EXISTS book_author (
    book_id INT NOT NULL REFERENCES book(id),
    author_id INT NOT NULL REFERENCES author(id),
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS book_category (
    book_id INT NOT NULL REFERENCES book(id),
    category_id INT NOT NULL REFERENCES category(id),
    PRIMARY KEY (book_id, category_id)
);

CREATE TABLE IF NOT EXISTS cart (
    user_id INT NOT NULL REFERENCES customer(id),
    book_id INT NOT NULL REFERENCES book(id),
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS shop_order (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES customer(id),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS order_line (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES shop_order(id),
    book_id INT NOT NULL REFERENCES book(id),
    quantity INT NOT NULL,
    price_at_purchase NUMERIC(10,2) NOT NULL
);
