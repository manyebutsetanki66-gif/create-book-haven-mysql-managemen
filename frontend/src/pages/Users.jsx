/*
 * Users - administrators only. Register, search, edit, delete users and assign roles.
 */
import { useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import useDebounce from '../hooks/useDebounce.js';
import { useAuth } from '../context/AuthContext.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const fetchUsers = useCallback(() => getUsers(debouncedSearch), [debouncedSearch]);
  const { data: users, loading, error, reload } = useAsync(fetchUsers, []);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleAdd = async (values) => {
    const created = await createUser(values);
    setNotice({ type: 'success', text: `${created.name} was registered.` });
    await reload();
  };

  const handleUpdate = async (values) => {
    const updated = await updateUser(editing.id, values);
    setEditing(null);
    setNotice({ type: 'success', text: `${updated.name} was updated.` });
    await reload();
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteUser(deleting.id);
      setNotice({ type: 'success', text: `${deleting.name} was deleted.` });
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

      <section className="form-card">
        <h2>Register a new user</h2>
        <UserForm formId="user-form" onSubmit={handleAdd} />
      </section>

      <section className="section-card">
        <div className="section-header">
          <h2>Users</h2>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, membership ID or role" label="Search users" />
        </div>
        <Alert message={error} />
        {loading ? <Loader text="Loading users..." /> : (
          <UserList users={users} currentUserId={currentUser.id} onEdit={setEditing} onDelete={setDeleting} />
        )}
      </section>

      {editing && (
        <Modal title="Edit user" onClose={closeEditor}>
          <UserForm formId="edit-user-form" initial={editing} onSubmit={handleUpdate} onCancel={closeEditor} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete user"
          message={`Delete ${deleting.name} (${deleting.membership_id})? Their past transactions stay in the history.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={closeDelete}
        />
      )}
    </>
  );
}
