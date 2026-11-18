/*
 * userController.js - CRUD for the users table.
 * New passwords are hashed with bcrypt before they are saved.
 * The password column is never selected for API responses.
 */
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const SAFE_COLUMNS = 'id, name, membership_id, role, created_at'; // no password!
const SALT_ROUNDS = 10;

const getUserById = async (id) => {
  const [rows] = await pool.execute(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = ?`, [id]);
  return rows[0];
};

// GET /users?search=term - search name or membership ID
exports.getUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  if (!search) {
    const [rows] = await pool.execute(`SELECT ${SAFE_COLUMNS} FROM users ORDER BY name ASC`);
    return res.json(rows);
  }
  const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
  const [rows] = await pool.execute(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE name LIKE ? OR membership_id LIKE ? OR role LIKE ? ORDER BY name ASC`,
    [like, like, like]);
  res.json(rows);
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  res.json(user);
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, membership_id, role, password } = req.clean;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await pool.execute(
    'INSERT INTO users (name, membership_id, password, role) VALUES (?, ?, ?, ?)',
    [name, membership_id, hash, role]);
  res.status(201).json(await getUserById(result.insertId));
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { name, membership_id, role, password } = req.clean;
  const id = Number(req.params.id);
  if (!(await getUserById(id))) throw new HttpError(404, 'User not found.');
  if (id === req.user.id && role !== 'administrator') {
    throw new HttpError(400, 'You cannot remove your own administrator role.');
  }
  if (password) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.execute(
      'UPDATE users SET name = ?, membership_id = ?, role = ?, password = ? WHERE id = ?',
      [name, membership_id, role, hash, id]);
  } else {
    // No new password typed: keep the old hash untouched.
    await pool.execute(
      'UPDATE users SET name = ?, membership_id = ?, role = ? WHERE id = ?', [name, membership_id, role, id]);
  }
  res.json(await getUserById(id));
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) throw new HttpError(400, 'You cannot delete your own account.');
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new HttpError(404, 'User not found.');
  res.json({ success: true, message: 'User deleted.' });
});
