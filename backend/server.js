/*
 * server.js - entry point of the Express API.
 *  1. Load settings from .env (and refuse to start without a JWT secret).
 *  2. Middleware: cors() lets the React app (another port) call us;
 *     express.json() turns a JSON request body into req.body.
 *  3. Mount one router per resource: /auth, /dashboard, /books, /transactions, /users.
 *  4. Unknown routes get a 404 and every error ends up in errorHandler.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const bookRoutes = require('./routes/books');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');
const { notFound, errorHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET. Copy backend/.env.example to backend/.env and set it.');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json());

app.get('/', (req, res) => res.json({ success: true, message: 'Book Haven API is running' }));

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/books', bookRoutes);
app.use('/transactions', transactionRoutes);
app.use('/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Book Haven API running on http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1'); // check the database connection at start-up
    console.log('Database connection OK');
  } catch (err) {
    console.error(`Database connection FAILED (${err.code || err.message}). Check backend/.env and that MySQL is running.`);
  }
});
