-- schema.sql: creates the Book Haven database and its tables.
-- Run this first, then seed.sql. (CHECK constraints need MySQL 8.0.16+ or MariaDB 10.2+.)

CREATE DATABASE IF NOT EXISTS book_haven
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_haven;

-- Drop in this order because transactions depends on the other two tables.
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  membership_id VARCHAR(20)  NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,                 -- bcrypt hash, never plain text
  role          ENUM('administrator', 'librarian', 'member') NOT NULL DEFAULT 'member',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE books (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title              VARCHAR(200) NOT NULL,
  author             VARCHAR(150) NOT NULL,
  genre              VARCHAR(60)  NOT NULL,
  isbn               VARCHAR(13)  NOT NULL UNIQUE,
  initial_quantity   INT NOT NULL,                     -- copies when the book was first registered
  available_quantity INT NOT NULL,                     -- copies on the shelf right now
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_books_initial   CHECK (initial_quantity >= 1),
  CONSTRAINT chk_books_available CHECK (available_quantity >= 0),   -- stock can never go negative
  INDEX idx_books_title (title),
  INDEX idx_books_genre (genre)
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  book_id     INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NULL,                       -- the borrower (NULL for stock arrivals)
  recorded_by INT UNSIGNED NULL,                       -- the staff member who entered it
  type        ENUM('BORROW', 'STOCK_ARRIVAL') NOT NULL,
  quantity    INT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_transactions_quantity CHECK (quantity > 0),
  -- Deleting a book removes its history. Deleting a user keeps the history (the user becomes NULL).
  CONSTRAINT fk_transactions_book     FOREIGN KEY (book_id)     REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_transactions_recorder FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_transactions_created (created_at),
  INDEX idx_transactions_book (book_id)
) ENGINE=InnoDB;
