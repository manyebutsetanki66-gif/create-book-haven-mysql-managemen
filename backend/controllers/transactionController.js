/*
 * transactionController.js - stock movements: BORROW and STOCK_ARRIVAL.
 *
 * Why a database transaction?
 * Recording a movement needs TWO writes: change books.available_quantity AND insert a
 * row into transactions. If only one succeeded the data would be wrong. A database
 * transaction makes both succeed together (COMMIT) or both be undone (ROLLBACK).
 * "SELECT ... FOR UPDATE" also locks the book row, so two librarians borrowing the last
 * copy at the same moment cannot both succeed.
 */
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const SELECT_WITH_NAMES = `
  SELECT t.id, t.book_id, t.user_id, t.type, t.quantity, t.created_at,
         b.title AS book_title,
         u.name AS user_name, u.membership_id AS user_membership_id,
         r.name AS recorded_by_name
  FROM transactions t
  JOIN books b ON b.id = t.book_id
  LEFT JOIN users u ON u.id = t.user_id
  LEFT JOIN users r ON r.id = t.recorded_by`;

exports.getTransactions = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`${SELECT_WITH_NAMES} ORDER BY t.created_at DESC, t.id DESC LIMIT 200`);
  res.json(rows);
});

exports.getTransaction = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`${SELECT_WITH_NAMES} WHERE t.id = ?`, [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Transaction not found.');
  res.json(rows[0]);
});

exports.createTransaction = asyncHandler(async (req, res) => {
  const { type, book_id, user_id, quantity } = req.clean;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [books] = await connection.execute(
      'SELECT id, title, available_quantity FROM books WHERE id = ? FOR UPDATE', [book_id]);
    const book = books[0];
    if (!book) throw new HttpError(404, 'Book not found.');

    if (type === 'BORROW') {
      const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [user_id]);
      if (!users[0]) throw new HttpError(404, 'The borrowing user was not found.');
      if (book.available_quantity < quantity) {
        const n = book.available_quantity;
        throw new HttpError(400, `Not enough stock. Only ${n} cop${n === 1 ? 'y' : 'ies'} of "${book.title}" available.`);
      }
    }

    const change = type === 'BORROW' ? -quantity : quantity;
    await connection.execute(
      'UPDATE books SET available_quantity = available_quantity + ? WHERE id = ?', [change, book_id]);
    const [result] = await connection.execute(
      'INSERT INTO transactions (book_id, user_id, recorded_by, type, quantity) VALUES (?, ?, ?, ?, ?)',
      [book_id, user_id, req.user.id, type, quantity]);

    await connection.commit();

    const [rows] = await pool.execute(`${SELECT_WITH_NAMES} WHERE t.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    await connection.rollback(); // undo everything if any step failed
    throw err;
  } finally {
    connection.release(); // always hand the connection back to the pool
  }
});
