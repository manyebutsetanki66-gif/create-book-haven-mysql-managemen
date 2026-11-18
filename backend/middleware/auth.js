/*
 * Authentication and role-based access control.
 *  - signToken: creates a JWT after a successful login.
 *  - authenticate: reads "Authorization: Bearer <token>", verifies it and puts the
 *    logged-in user on req.user. Missing or bad token -> 401.
 *  - requireRole('administrator', ...): only lets those roles through. Else -> 403.
 */
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/HttpError');

const getSecret = () => process.env.JWT_SECRET;

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Please log in first.'));
  try {
    req.user = jwt.verify(token, getSecret());
    next();
  } catch {
    next(new HttpError(401, 'Your session has expired. Please log in again.'));
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to do that.'));
  }
  next();
};

const STAFF = ['administrator', 'librarian'];

module.exports = { signToken, authenticate, requireRole, STAFF };
