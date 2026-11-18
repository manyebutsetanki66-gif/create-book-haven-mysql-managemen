/*
 * Books - search, add, edit and delete books.
 * The search word lives in the URL (?search=...) so the navbar search box and this page
 * share it. The typed word is "debounced" so we only ask the server once typing pauses.
 * Members can search and view; only staff see the add form and the Edit/Delete buttons.
 */
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBooks, deleteBook } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import useDebounce from '../hooks/useDebounce.js';
import { useAuth } from '../context/AuthContext.jsx';
import AddBookForm from '../components/AddBookForm.jsx';
import EditBookForm from '../components/EditBookForm.jsx';
import BookList from '../components/BookList.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';

export default function Books() {
  const { isStaff } = useAuth();
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const debouncedSearch = useDebounce(search, 300);

  const fetchBooks = useCallback(() => getBooks(debouncedSearch), [debouncedSearch]);
  const { data: books, loading, error, reload } = useAsync(fetchBooks, []);

  const [editing, setEditing] = useState(null);   // book being edited
  const [deleting, setDeleting] = useState(null); // book waiting for delete confirmation
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);     // { type, text }

  const handleSearch = (value) => setParams(value ? { search: value } : {}, { replace: true });

  const handleAdded = async (book) => {
    setNotice({ type: 'success', text: `"${book.title}" was added.` });
    await reload();
  };

  const handleUpdated = async (book) => {
    setEditing(null);
    setNotice({ type: 'success', text: `"${book.title}" was updated.` });
    await reload();
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteBook(deleting.id);
      setNotice({ type: 'success', text: `"${deleting.title}" was deleted.` });
      await reload();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  const closeEditor = useCallback(() => setEditing(null), []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  return (
    <>
      <Alert type={notice?.type} message={notice?.text} onClose={() => setNotice(null)} />

      {isStaff && (
        <section className="form-card">
          <h2>Add a new book</h2>
          <AddBookForm onAdded={handleAdded} />
        </section>
      )}

      <section className="section-card">
        <div className="section-header">
          <h2>Books</h2>
          <SearchBar value={search} onChange={handleSearch} placeholder="Search title, author, genre or ISBN" label="Search books" />
        </div>
        <Alert message={error} />
        {loading ? <Loader text="Loading books..." /> : (
          <BookList books={books} canEdit={isStaff} onEdit={setEditing} onDelete={setDeleting} />
        )}
      </section>

      {editing && (
        <Modal title="Edit book" onClose={closeEditor}>
          <EditBookForm book={editing} onUpdated={handleUpdated} onCancel={closeEditor} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete book"
          message={`Delete "${deleting.title}"? Its transaction history will also be deleted. This cannot be undone.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={closeDelete}
        />
      )}
    </>
  );
}
