/*
 * Server-side validation. The browser validates too, but the server must never trust
 * the browser: anyone can call the API directly. Each validator returns
 * { errors: [...], data: {...clean values} }. validateBody() turns a validator into
 * middleware that answers 400 on problems and otherwise stores clean data in req.clean.
 */
const ROLES = ['administrator', 'librarian', 'member'];
const TRANSACTION_TYPES = ['BORROW', 'STOCK_ARRIVAL'];
const MAX_QUANTITY = 10000;

const text = (v) => (typeof v === 'string' ? v.trim() : '');
const isWholeNumber = (v) => /^-?\d+$/.test(String(v).trim());

function validateBook(body, { editing = false } = {}) {
  const errors = [];
  const data = {
    title: text(body.title),
    author: text(body.author),
    genre: text(body.genre),
    isbn: text(body.isbn).replace(/[\s-]/g, '').toUpperCase(),
    initial_quantity: body.initial_quantity,
    available_quantity: body.available_quantity,
  };
  if (!data.title) errors.push('Title is required.');
  if (!data.author) errors.push('Author is required.');
  if (!data.genre) errors.push('Genre is required.');
  if (!/^(\d{9}[\dX]|\d{13})$/.test(data.isbn)) errors.push('ISBN must be 10 or 13 digits (an ISBN-10 may end in X).');
  if (!isWholeNumber(data.initial_quantity) || Number(data.initial_quantity) < 1 || Number(data.initial_quantity) > MAX_QUANTITY) {
    errors.push(`Initial quantity must be a whole number from 1 to ${MAX_QUANTITY}.`);
  }
  data.initial_quantity = Number(data.initial_quantity);
  if (editing) {
    if (!isWholeNumber(data.available_quantity) || Number(data.available_quantity) < 0 || Number(data.available_quantity) > MAX_QUANTITY) {
      errors.push(`Available quantity must be a whole number from 0 to ${MAX_QUANTITY}.`);
    }
    data.available_quantity = Number(data.available_quantity);
  } else {
    data.available_quantity = data.initial_quantity; // a new book starts fully available
  }
  return { errors, data };
}

function validateUser(body, { creating }) {
  const errors = [];
  const data = {
    name: text(body.name),
    membership_id: text(body.membership_id).toUpperCase(),
    role: text(body.role),
    password: typeof body.password === 'string' ? body.password : '',
    confirm_password: typeof body.confirm_password === 'string' ? body.confirm_password : '',
  };
  if (!data.name) errors.push('Full name is required.');
  if (!/^[A-Z0-9-]{3,20}$/.test(data.membership_id)) errors.push('Membership ID must be 3-20 letters, numbers or dashes.');
  if (!ROLES.includes(data.role)) errors.push('Role must be administrator, librarian or member.');
  if (creating && !data.password) errors.push('Password is required.');
  if (data.password) {
    if (data.password.length < 8 || !/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
      errors.push('Password must be at least 8 characters and contain a letter and a number.');
    }
    if (data.password !== data.confirm_password) errors.push('Password and confirmation do not match.');
  }
  return { errors, data };
}

function validateTransaction(body) {
  const errors = [];
  const data = {
    type: text(body.type),
    book_id: Number(body.book_id),
    user_id: body.user_id ? Number(body.user_id) : null,
    quantity: body.quantity,
  };
  if (!TRANSACTION_TYPES.includes(data.type)) errors.push('Type must be BORROW or STOCK_ARRIVAL.');
  if (!Number.isInteger(data.book_id) || data.book_id < 1) errors.push('Please choose a book.');
  if (data.type === 'BORROW' && (!Number.isInteger(data.user_id) || data.user_id < 1)) errors.push('Please choose the borrowing user.');
  if (!isWholeNumber(data.quantity) || Number(data.quantity) < 1 || Number(data.quantity) > MAX_QUANTITY) {
    errors.push(`Quantity must be a whole number from 1 to ${MAX_QUANTITY}.`);
  }
  data.quantity = Number(data.quantity);
  if (data.type !== 'BORROW') data.user_id = null; // stock arrivals have no borrower
  return { errors, data };
}

const validateBody = (validator, options) => (req, res, next) => {
  const { errors, data } = validator(req.body || {}, options);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });
  req.clean = data;
  next();
};

module.exports = { validateBook, validateUser, validateTransaction, validateBody };
