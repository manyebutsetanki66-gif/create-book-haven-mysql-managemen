/*
 * Express 4 does not catch errors thrown inside async functions.
 * This wrapper sends any rejected promise to next(), so the central
 * errorHandler can answer with a proper JSON error.
 */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
