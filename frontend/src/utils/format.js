export const LOW_STOCK_LIMIT = 2; // fewer than 2 available copies = low stock
export const isLowStock = (book) => book.available_quantity < LOW_STOCK_LIMIT;

const ROLE_LABELS = { administrator: 'Administrator', librarian: 'Librarian', member: 'Member' };
export const roleLabel = (role) => ROLE_LABELS[role] || role;

export const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
