/*
 * Central error handling. Every error ends up here, so all failures share one JSON
 * shape: { success: false, message: "..." }.
 */
const HttpError = require('../utils/HttpError');

const DB_DOWN_CODES = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_DBACCESS_DENIED_ERROR'];

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Four arguments tell Express this is an error-handling middleware.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  if (err.code === 'ER_DUP_ENTRY') { // a UNIQUE column already has that value
    const field = /isbn/i.test(err.message) ? 'ISBN' : /membership/i.test(err.message) ? 'membership ID' : 'value';
    return res.status(409).json({ success: false, message: `That ${field} already exists.` });
  }
  if (DB_DOWN_CODES.includes(err.code)) {
    console.error('Database error:', err.code, err.message);
    return res.status(503).json({
      success: false,
      message: 'Cannot connect to the database. Check that MySQL is running and backend/.env is correct.',
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body.' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };
