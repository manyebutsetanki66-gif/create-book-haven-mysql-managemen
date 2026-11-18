/*
 * dashboardController.js - every number comes from a real SQL query (nothing hardcoded).
 */
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { STAFF } = require('../middleware/auth');

const LOW_STOCK_LIMIT = 2; // fewer than 2 available copies = low stock

exports.getDashboard = asyncHandler(async (req, res) => {
  const [[books]] = await pool.execute(
    'SELECT COUNT(*) AS total_books, COALESCE(SUM(available_quantity), 0) AS total_available FROM books');
  const [[users]] = await pool.execute('SELECT COUNT(*) AS total_users FROM users');
  const [lowStock] = await pool.execute(
    `SELECT id, title, author, genre, isbn, initial_quantity, available_quantity
     FROM books WHERE available_quantity < ? ORDER BY available_quantity ASC, title ASC LIMIT 20`,
    [LOW_STOCK_LIMIT]);

  // Only staff may see transaction records (members get null and the page hides the section).
  let recentTransactions = null;
  if (STAFF.includes(req.user.role)) {
    const [rows] = await pool.execute(
      `SELECT t.id, t.type, t.quantity, t.created_at, b.title AS book_title, u.name AS user_name
       FROM transactions t
       JOIN books b ON b.id = t.book_id
       LEFT JOIN users u ON u.id = t.user_id
       ORDER BY t.created_at DESC, t.id DESC LIMIT 8`);
    recentTransactions = rows;
  }

  res.json({
    totalBooks: Number(books.total_books),
    totalAvailableCopies: Number(books.total_available),
    totalUsers: Number(users.total_users),
    lowStockCount: lowStock.length,
    lowStockLimit: LOW_STOCK_LIMIT,
    lowStockBooks: lowStock,
    recentTransactions,
  });
});
