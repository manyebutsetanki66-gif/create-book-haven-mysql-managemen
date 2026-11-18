/*
 * api.js - EVERY call to the backend lives here, using the Fetch API.
 * Components import these small functions and never write fetch() themselves, so the
 * URL, headers and error handling are in one place.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const SESSION_KEY = 'book_haven_session';

// Only the login session (user + token) is kept in the browser. All library data is in MySQL.
export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};
export const saveSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  const session = getSession();
  if (body) headers['Content-Type'] = 'application/json';
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // some responses have no body
  }

  if (!response.ok) {
    // An expired or invalid token: tell the app to log the user out.
    if (response.status === 401 && path !== '/auth/login') {
      clearSession();
      window.dispatchEvent(new Event('session-expired'));
    }
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data;
}

const withSearch = (path, search) => (search ? `${path}?search=${encodeURIComponent(search)}` : path);

// Authentication
export const login = (membership_id, password) => request('/auth/login', { method: 'POST', body: { membership_id, password } });
export const getMe = () => request('/auth/me');

// Dashboard
export const getDashboard = () => request('/dashboard');

// Books
export const getBooks = (search = '') => request(withSearch('/books', search));
export const createBook = (book) => request('/books', { method: 'POST', body: book });
export const updateBook = (id, book) => request(`/books/${id}`, { method: 'PUT', body: book });
export const deleteBook = (id) => request(`/books/${id}`, { method: 'DELETE' });

// Transactions
export const getTransactions = () => request('/transactions');
export const createTransaction = (transaction) => request('/transactions', { method: 'POST', body: transaction });

// Users
export const getUsers = (search = '') => request(withSearch('/users', search));
export const createUser = (user) => request('/users', { method: 'POST', body: user });
export const updateUser = (id, user) => request(`/users/${id}`, { method: 'PUT', body: user });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });
