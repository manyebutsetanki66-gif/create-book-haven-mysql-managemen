import StockBadge from './StockBadge.jsx';
import { isLowStock } from '../utils/format.js';

// Table of books. Low-stock rows are highlighted. Edit/Delete buttons only appear when
// canEdit is true (staff). Members and the dashboard get a read-only table.
export default function BookList({ books, canEdit = false, onEdit, onDelete }) {
  if (books.length === 0) return <p className="empty-state">No books found.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th>
            <th>Initial</th><th>Available</th>
            {canEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className={isLowStock(book) ? 'row-low' : ''}>
              <td data-label="Title">{book.title}</td>
              <td data-label="Author">{book.author}</td>
              <td data-label="Genre">{book.genre}</td>
              <td data-label="ISBN">{book.isbn}</td>
              <td data-label="Initial">{book.initial_quantity}</td>
              <td data-label="Available"><StockBadge quantity={book.available_quantity} /></td>
              {canEdit && (
                <td data-label="Actions" className="actions">
                  <button className="btn btn-edit btn-small" onClick={() => onEdit(book)}>Edit</button>
                  <button className="btn btn-delete btn-small" onClick={() => onDelete(book)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
