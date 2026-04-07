CREATE TABLE review (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES customer(id),
    book_id INT NOT NULL REFERENCES book(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 10),
    text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
