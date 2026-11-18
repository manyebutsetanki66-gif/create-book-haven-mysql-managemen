-- seed.sql: sample data. Run it AFTER schema.sql.
--
-- Demo logins (passwords are stored below as bcrypt hashes, never as plain text):
--   ADM001  / Admin@123      (administrator)
--   LIB001  / Librarian@123  (librarian)
--   MEM001, MEM002, MEM003 / Member@123 (members)
USE book_haven;

INSERT INTO users (name, membership_id, password, role) VALUES
 ('Thabo Mokoena',   'ADM001', '$2b$10$yHJgYrvEHfForY/MY2DPduoluY5YsbMGSAVBYuPhqHW5o2uQKSyKK', 'administrator'),
 ('Palesa Letsie',   'LIB001', '$2b$10$tPc25i27M9xoWfuMzh9UzOjFbwzTqtiJbPwdq5vpL8U7b.dhs8gv.', 'librarian'),
 ('Lerato Molapo',   'MEM001', '$2b$10$ZUyKv3GGUXLrRRhrixNO0e4xEoU/mMQO9oTj/pSyOpDqJcF0mv6D2', 'member'),
 ('Tumelo Khatleli', 'MEM002', '$2b$10$ZUyKv3GGUXLrRRhrixNO0e4xEoU/mMQO9oTj/pSyOpDqJcF0mv6D2', 'member'),
 ('Nthabiseng Sello','MEM003', '$2b$10$ZUyKv3GGUXLrRRhrixNO0e4xEoU/mMQO9oTj/pSyOpDqJcF0mv6D2', 'member');

-- available_quantity already reflects the sample transactions further down.
-- Three books (ids 3, 5 and 7) have fewer than 2 copies, so the low-stock highlight is visible.
INSERT INTO books (title, author, genre, isbn, initial_quantity, available_quantity) VALUES
 ('Things Fall Apart',          'Chinua Achebe',        'Fiction',    '9780385474542', 8, 6),
 ('Clean Code',                 'Robert C. Martin',     'Technology', '9780132350884', 5, 4),
 ('A Brief History of Time',    'Stephen Hawking',      'Science',    '9780553380163', 3, 1),
 ('Sapiens',                    'Yuval Noah Harari',    'History',    '9780062316110', 3, 3),
 ('The Pragmatic Programmer',   'Andrew Hunt',          'Technology', '9780135957059', 2, 0),
 ('Long Walk to Freedom',       'Nelson Mandela',       'Biography',  '9780316548182', 5, 5),
 ('Introduction to Algorithms', 'Thomas H. Cormen',     'Technology', '9780262046305', 2, 1),
 ('Born a Crime',               'Trevor Noah',          'Biography',  '9780399588174', 6, 7),
 ('The Alchemist',              'Paulo Coelho',         'Fiction',    '9780062315007', 2, 2),
 ('Database System Concepts',   'Abraham Silberschatz', 'Technology', '9780078022159', 3, 3),
 ('Cosmos',                     'Carl Sagan',           'Science',    '9780345539434', 4, 4),
 ('Eloquent JavaScript',        'Marijn Haverbeke',     'Technology', '9781593279509', 2, 2);

-- type BORROW: user_id is the borrower. type STOCK_ARRIVAL: user_id is NULL.
-- recorded_by is the librarian (id 2) who entered the record.
INSERT INTO transactions (book_id, user_id, recorded_by, type, quantity, created_at) VALUES
 (1, 3,    2, 'BORROW',        2, '2026-11-02 09:15:00'),
 (2, 4,    2, 'BORROW',        1, '2026-11-03 10:40:00'),
 (3, 3,    2, 'BORROW',        2, '2026-11-05 11:05:00'),
 (5, 4,    2, 'BORROW',        2, '2026-11-06 14:20:00'),
 (7, 5,    2, 'BORROW',        1, '2026-11-09 13:00:00'),
 (8, 5,    2, 'BORROW',        1, '2026-11-10 15:30:00'),
 (8, NULL, 2, 'STOCK_ARRIVAL', 2, '2026-11-12 08:45:00');
