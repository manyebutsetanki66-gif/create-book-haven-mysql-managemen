/*
 * bookController.js - CRUD for the books table.
 * All SQL uses "?" placeholders (parameterised queries) so user input can never be
 * executed as SQL (prevents SQL injection).
 */
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const getBookById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM books WHERE id = ?', [id]);
  return rows[0];
};

// GET /books?search=term  - search title, author, genre or ISBN
exports.getBooks = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  if (!search) {
    const [rows] = await pool.execute('SELECT * FROM books ORDER BY title ASC');
    return res.json(rows);
  }
  const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`; // escape LIKE wildcards typed by the user
  const [rows] = await pool.execute(
    `SELECT * FROM books
     WHERE title LIKE ? OR author LIKE ? OR genre LIKE ? OR isbn LIKE ?
     ORDER BY title ASC`,
    [like, like, like, like]);
  res.json(rows);
});

exports.getBook = asyncHandler(async (req, res) => {
  const book = await getBookById(req.params.id);
  if (!book) throw new HttpError(404, 'Book not found.');
  res.json(book);
});

exports.createBook = asyncHandler(async (req, res) => {
  const { title, author, genre, isbn, initial_quantity, available_quantity } = req.clean;
  const [result] = await pool.execute(
    `INSERT INTO books (title, author, genre, isbn, initial_quantity, available_quantity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, author, genre, isbn, initial_quantity, available_quantity]);
  res.status(201).json(await getBookById(result.insertId));
});

exports.updateBook = asyncHandler(async (req, res) => {
  const { title, author, genre, isbn, initial_quantity, available_quantity } = req.clean;
  if (!(await getBookById(req.params.id))) throw new HttpError(404, 'Book not found.');
  await pool.execute(
    `UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?,
            initial_quantity = ?, available_quantity = ? WHERE id = ?`,
    [title, author, genre, isbn, initial_quantity, available_quantity, req.params.id]);
  res.json(await getBookById(req.params.id));
});

exports.deleteBook = asyncHandler(async (req, res) => {
  // transactions use ON DELETE CASCADE, so the book's history is removed with it.
  const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new HttpError(404, 'Book not found.');
  res.json({ success: true, message: 'Book deleted.' });
});
