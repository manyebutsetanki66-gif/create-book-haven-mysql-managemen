import { roleLabel } from '../utils/format.js';

export default function UserList({ users, currentUserId, onEdit, onDelete }) {
  if (users.length === 0) return <p className="empty-state">No users found.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Full name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td data-label="Full name">{u.name}</td>
              <td data-label="Membership ID">{u.membership_id}</td>
              <td data-label="Role"><span className={`badge role-${u.role}`}>{roleLabel(u.role)}</span></td>
              <td data-label="Actions" className="actions">
                <button className="btn btn-edit btn-small" onClick={() => onEdit(u)}>Edit</button>
                <button
                  className="btn btn-delete btn-small"
                  onClick={() => onDelete(u)}
                  disabled={u.id === currentUserId}
                  title={u.id === currentUserId ? 'You cannot delete your own account' : undefined}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
