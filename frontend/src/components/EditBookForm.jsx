import BookForm from './BookForm.jsx';
import { updateBook } from '../services/api.js';

// Edits an existing book (shown inside a pop-up on the Books page).
export default function EditBookForm({ book, onUpdated, onCancel }) {
  const handleSubmit = async (changes) => {
    const updated = await updateBook(book.id, changes);
    onUpdated(updated);
  };
  return <BookForm initial={book} editing submitLabel="Save changes" onSubmit={handleSubmit} onCancel={onCancel} />;
}
