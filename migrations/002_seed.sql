INSERT INTO publisher (id, name) VALUES
  (1, 'Scribner'),
  (2, 'Secker & Warburg'),
  (3, 'Harper & Brothers'),
  (4, 'T. Egerton'),
  (5, 'The Russian Messenger'),
  (8, 'Ballantine Books'),
  (6, 'Gallimard'),
  (10, 'Simon & Schuster'),
  (11, 'Microsoft Press');

INSERT INTO author (id, first_name, last_name, bio) VALUES
  (2, 'George', 'Orwell', 'English novelist known for his social criticism.'),
  (3, 'Herman', 'Melville', 'American writer of the American Renaissance period.'),
  (4, 'Jane', 'Austen', 'English novelist known for her realism and social commentary.'),
  (5, 'Fyodor', 'Dostoevsky', 'Russian novelist and philosopher.'),
  (8, 'Ray', 'Bradbury', 'American author known for his dystopian works.'),
  (9, 'Ernest', 'Hemingway', 'American novelist and Nobel laureate.'),
  (10, 'Antoine', 'de Saint-Exupéry', 'French writer and aviator.'),
  (11, 'Samin', 'Nosrat', 'American chef and food writer.'),
  (12, 'Steve', 'McConnell', 'American software engineer and author.');

INSERT INTO category (id, name, description) VALUES
  (1, 'Fiction', 'Literary fiction and novels'),
  (2, 'Science Fiction', 'Speculative and dystopian fiction'),
  (3, 'Adventure', 'Adventure and exploration'),
  (4, 'Romance', 'Romantic fiction'),
  (5, 'Philosophy', 'Philosophical and existential works'),
  (7, 'Cooking', 'Food, recipes, and culinary technique'),
  (8, 'Software', 'Software engineering and programming');

INSERT INTO book (id, title, isbn, price_cents, stock, publisher_id) VALUES
  (2,  'Nineteen Eighty-Four',       '978-0-452-28423-4', 1195, 24, 2),
  (3,  'Moby-Dick',                  '978-0-14-243724-7', 1295, 12, 3),
  (4,  'Pride and Prejudice',        '978-0-19-953556-9',  995, 30, 4),
  (5,  'Crime and Punishment',       '978-0-14-044913-6', 1195, 15, 5),
  (8,  'Fahrenheit 451',             '978-1-4516-7331-8', 1095, 20, 8),
  (9,  'The Old Man and the Sea',    '978-0-684-80122-3',  895, 25, 1),
  (10, 'Le Petit Prince',            '978-2-07-061275-8',  895, 28, 6),
  (11, 'Salt, Fat, Acid, Heat',     '978-1-4767-5397-8', 2495, 16, 10),
  (12, 'Code Complete 2',            '978-0-7356-1967-8', 3995,  8, 11);

INSERT INTO book_author (book_id, author_id) VALUES
  (2, 2), (3, 3), (4, 4), (5, 5), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12);

INSERT INTO book_category (book_id, category_id) VALUES
  (2, 2),   -- Nineteen Eighty-Four: Science Fiction
  (3, 3),   -- Moby-Dick: Adventure
  (4, 4),   -- Pride and Prejudice: Romance
  (5, 1),   -- Crime and Punishment: Fiction
  (5, 5),   -- Crime and Punishment: Philosophy
  (8, 2),   -- Fahrenheit 451: Science Fiction
  (9, 1),   -- The Old Man and the Sea: Fiction
  (10, 1),  -- Le Petit Prince: Fiction
  (11, 7),  -- Salt, Fat, Acid, Heat: Cooking
  (12, 8);  -- Code Complete: Software
