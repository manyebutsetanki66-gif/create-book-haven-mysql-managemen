/*
 * Client-side validation for the forms. Each function returns an object of error
 * messages keyed by field name (an empty object means everything is valid).
 * The backend validates again, because the browser can never be trusted.
 */
const WHOLE = /^\d+$/;

export function validateBookFields(values, { editing = false } = {}) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Title is required.';
  if (!values.author.trim()) errors.author = 'Author is required.';
  if (!values.genre.trim()) errors.genre = 'Genre is required.';
  const isbn = values.isbn.replace(/[\s-]/g, '');
  if (!isbn) errors.isbn = 'ISBN is required.';
  else if (!/^(\d{9}[\dXx]|\d{13})$/.test(isbn)) errors.isbn = 'ISBN must be 10 or 13 digits.';
  const initial = String(values.initial_quantity).trim();
  if (!WHOLE.test(initial) || Number(initial) < 1) errors.initial_quantity = 'Initial quantity must be at least 1.';
  if (editing) {
    const available = String(values.available_quantity).trim();
    if (!WHOLE.test(available)) errors.available_quantity = 'Available quantity must be 0 or more.';
  }
  return errors;
}

export function validateUserFields(values, { creating }) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Full name is required.';
  if (!/^[A-Za-z0-9-]{3,20}$/.test(values.membership_id.trim())) {
    errors.membership_id = 'Use 3-20 letters, numbers or dashes.';
  }
  if (!values.role) errors.role = 'Please choose a role.';
  if (creating && !values.password) errors.password = 'Password is required.';
  if (values.password) {
    if (values.password.length < 8 || !/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
      errors.password = 'At least 8 characters, with a letter and a number.';
    }
    if (values.password !== values.confirm_password) errors.confirm_password = 'Passwords do not match.';
  } else if (creating) {
    errors.confirm_password = 'Please confirm the password.';
  }
  return errors;
}

export function validateTransactionFields(values, books) {
  const errors = {};
  if (!values.book_id) errors.book_id = 'Please choose a book.';
  if (values.type === 'BORROW' && !values.user_id) errors.user_id = 'Please choose the borrowing user.';
  const qty = String(values.quantity).trim();
  if (!/^[1-9]\d*$/.test(qty)) {
    errors.quantity = 'Quantity must be a whole number of 1 or more.';
  } else if (values.type === 'BORROW' && values.book_id) {
    const book = books.find((b) => b.id === Number(values.book_id));
    if (book && Number(qty) > book.available_quantity) {
      errors.quantity = `Only ${book.available_quantity} cop${book.available_quantity === 1 ? 'y' : 'ies'} available.`;
    }
  }
  return errors;
}
