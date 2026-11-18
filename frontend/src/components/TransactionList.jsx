import { formatDateTime } from '../utils/format.js';

// Read-only log of stock movements, newest first.
export default function TransactionList({ transactions, showRecorder = true }) {
  if (transactions.length === 0) return <p className="empty-state">No transactions recorded yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Book</th><th>User</th><th>Type</th><th>Quantity</th><th>Date and time</th>
            {showRecorder && <th>Recorded by</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="ID">#{t.id}</td>
              <td data-label="Book">{t.book_title}</td>
              <td data-label="User">{t.type === 'BORROW' ? (t.user_name || 'Deleted user') : '-'}</td>
              <td data-label="Type">
                <span className={`badge ${t.type === 'BORROW' ? 'badge-out' : 'badge-in'}`}>
                  {t.type === 'BORROW' ? 'Borrow' : 'Stock arrival'}
                </span>
              </td>
              <td data-label="Quantity">{t.type === 'BORROW' ? '-' : '+'}{t.quantity}</td>
              <td data-label="Date and time">{formatDateTime(t.created_at)}</td>
              {showRecorder && <td data-label="Recorded by">{t.recorded_by_name || '-'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
