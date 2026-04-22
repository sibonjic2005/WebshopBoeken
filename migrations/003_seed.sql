INSERT INTO publisher (id, name) VALUES
  (1, 'Scribner'),
  (2, 'Secker & Warburg'),
  (3, 'Harper & Brothers'),
  (4, 'T. Egerton'),
  (5, 'The Russian Messenger'),
  (6, 'Ballantine Books'),
  (7, 'Gallimard'),
  (8, 'Simon & Schuster'),
  (9, 'Microsoft Press')
ON CONFLICT DO NOTHING;

INSERT INTO author (id, first_name, last_name, bio) VALUES
  (1, 'George', 'Orwell', 'English novelist known for his social criticism.'),
  (2, 'Herman', 'Melville', 'American writer of the American Renaissance period.'),
  (3, 'Jane', 'Austen', 'English novelist known for her realism and social commentary.'),
  (4, 'Fyodor', 'Dostoevsky', 'Russian novelist and philosopher.'),
  (5, 'Ray', 'Bradbury', 'American author known for his dystopian works.'),
  (6, 'Ernest', 'Hemingway', 'American novelist and Nobel laureate.'),
  (7, 'Antoine', 'de Saint-Exupéry', 'French writer and aviator.'),
  (8, 'Samin', 'Nosrat', 'American chef and food writer.'),
  (9, 'Steve', 'McConnell', 'American software engineer and author.')
ON CONFLICT DO NOTHING;

INSERT INTO category (id, name, description) VALUES
  (1, 'Fiction', 'Literary fiction and novels'),
  (2, 'Science Fiction', 'Speculative and dystopian fiction'),
  (3, 'Adventure', 'Adventure and exploration'),
  (4, 'Romance', 'Romantic fiction'),
  (5, 'Philosophy', 'Philosophical and existential works'),
  (6, 'Cooking', 'Food, recipes, and culinary technique'),
  (7, 'Software', 'Software engineering and programming')
ON CONFLICT DO NOTHING;

INSERT INTO book (id, title, isbn, price_cents, stock, publisher_id) VALUES
  (1,  'Nineteen Eighty-Four',       '978-0-452-28423-4', 1195, 24, 2),
  (2,  'Moby-Dick',                  '978-0-14-243724-7', 1295, 12, 3),
  (3,  'Pride and Prejudice',        '978-0-19-953556-9',  995, 30, 4),
  (4,  'Crime and Punishment',       '978-0-14-044913-6', 1195, 15, 5),
  (5,  'Fahrenheit 451',             '978-1-4516-7331-8', 1095, 20, 6),
  (6,  'The Old Man and the Sea',    '978-0-684-80122-3',  895, 25, 1),
  (7,  'Le Petit Prince',            '978-2-07-061275-8',  895, 28, 7),
  (8,  'Salt, Fat, Acid, Heat',      '978-1-4767-5397-8', 2495, 16, 8),
  (9,  'Code Complete 2',            '978-0-7356-1967-8', 3995,  8, 9)
ON CONFLICT DO NOTHING;

INSERT INTO book_author (book_id, author_id) VALUES
  (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9)
ON CONFLICT DO NOTHING;

INSERT INTO book_category (book_id, category_id) VALUES
  (1, 2),
  (2, 3),
  (3, 4),
  (4, 1),
  (4, 5),
  (5, 2),
  (6, 1),
  (7, 1),
  (8, 6),
  (9, 7)
ON CONFLICT DO NOTHING;

INSERT INTO customer (id, email, password_hash, first_name, last_name) VALUES
  (1,  'alice.jansen@example.com',   'hashed_pw_1',  'Alice',   'Jansen'),
  (2,  'bob.devries@example.com',    'hashed_pw_2',  'Bob',     'de Vries'),
  (3,  'carla.smit@example.com',     'hashed_pw_3',  'Carla',   'Smit'),
  (4,  'david.bakker@example.com',   'hashed_pw_4',  'David',   'Bakker'),
  (5,  'emma.visser@example.com',    'hashed_pw_5',  'Emma',    'Visser'),
  (6,  'finn.meijer@example.com',    'hashed_pw_6',  'Finn',    'Meijer'),
  (7,  'lisa.mulder@example.com',    'hashed_pw_7',  'Lisa',    'Mulder'),
  (8,  'milan.dejong@example.com',   'hashed_pw_8',  'Milan',   'de Jong'),
  (9,  'noa.kok@example.com',        'hashed_pw_9',  'Noa',     'Kok'),
  (10, 'oliver.jacobs@example.com',  'hashed_pw_10', 'Oliver',  'Jacobs')
ON CONFLICT DO NOTHING;

INSERT INTO cart (user_id, book_id, quantity) VALUES
  (1, 1, 2),
  (1, 3, 1),
  (2, 5, 1),
  (2, 9, 1),
  (3, 7, 3)
ON CONFLICT DO NOTHING;

