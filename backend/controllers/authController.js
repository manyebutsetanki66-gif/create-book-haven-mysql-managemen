/*
 * authController.js - login and "who am I".
 * Passwords are stored only as bcrypt hashes. bcrypt.compare() checks the typed password
 * against the stored hash; nothing is ever decrypted. Hashes are never sent to the browser.
 */
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { signToken } = require('../middleware/auth');

exports.login = asyncHandler(async (req, res) => {
  const membershipId = String(req.body.membership_id || '').trim().toUpperCase();
  const password = String(req.body.password || '');
  if (!membershipId || !password) throw new HttpError(400, 'Membership ID and password are required.');

  const [rows] = await pool.execute('SELECT * FROM users WHERE membership_id = ?', [membershipId]);
  const user = rows[0];
  // One message for "no such user" and "wrong password", so attackers learn nothing.
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new HttpError(401, 'Invalid membership ID or password.');

  const { password: _hash, ...safeUser } = user;
  res.json({ user: safeUser, token: signToken(user) });
});

// Used by the React app after a page refresh to confirm the saved token is still valid.
exports.me = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, name, membership_id, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!rows[0]) throw new HttpError(401, 'This account no longer exists.');
  res.json({ user: rows[0] });
});
