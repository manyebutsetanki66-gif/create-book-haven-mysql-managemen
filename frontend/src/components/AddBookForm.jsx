import BookForm from './BookForm.jsx';
import { createBook } from '../services/api.js';

// Registers a new book. The page is told afterwards so it can reload the list.
export default function AddBookForm({ onAdded }) {
  const handleSubmit = async (book) => {
    const created = await createBook(book);
    onAdded(created);
  };
  return <BookForm submitLabel="Add book" onSubmit={handleSubmit} />;
}
