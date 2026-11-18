/*
 * TransactionForm - record a BORROW (stock goes down) or a STOCK_ARRIVAL (stock goes up).
 * The page owns the book and user lists and passes them in as props (lifting state up), so
 * it can refresh them after every transaction.
 */
import { useState } from 'react';
import FormField from './FormField.jsx';
import Alert from './Alert.jsx';
import { createTransaction } from '../services/api.js';
import { validateTransactionFields } from '../utils/validators.js';

const EMPTY = { type: 'BORROW', book_id: '', user_id: '', quantity: '1' };

export default function TransactionForm({ books, users, onRecorded }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const borrowing = values.type === 'BORROW';

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateTransactionFields(values, books);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      const saved = await createTransaction({
        type: values.type,
        book_id: Number(values.book_id),
        user_id: borrowing ? Number(values.user_id) : null,
        quantity: Number(values.quantity),
      });
      setValues({ ...EMPTY, type: values.type });
      await onRecorded(saved);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="transaction-form" onSubmit={handleSubmit} noValidate>
      <Alert message={serverError} onClose={() => setServerError('')} />

      <div className="form-group">
        <span className="field-label">Transaction type</span>
        <div className="radio-group" role="radiogroup" aria-label="Transaction type">
          <label>
            <input type="radio" name="type" value="BORROW" checked={borrowing} onChange={handleChange} />
            Borrow book
          </label>
          <label>
            <input type="radio" name="type" value="STOCK_ARRIVAL" checked={!borrowing} onChange={handleChange} />
            Stock arrival
          </label>
        </div>
      </div>

      <div className="form-grid">
        <FormField label="Book" error={errors.book_id}>
          <select name="book_id" value={values.book_id} onChange={handleChange}>
            <option value="">Choose a book...</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.title} ({b.available_quantity} available)</option>
            ))}
          </select>
        </FormField>
        {borrowing && (
          <FormField label="Borrowing user" error={errors.user_id}>
            <select name="user_id" value={values.user_id} onChange={handleChange}>
              <option value="">Choose a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>
              ))}
            </select>
          </FormField>
        )}
        <FormField label={borrowing ? 'Quantity to borrow' : 'Quantity received'} error={errors.quantity}>
          <input name="quantity" type="number" min="1" value={values.quantity} onChange={handleChange} />
        </FormField>
      </div>

      <div className="form-actions">
        <button className="btn btn-add" disabled={submitting}>
          {submitting ? 'Saving...' : borrowing ? 'Confirm borrowing' : 'Confirm stock arrival'}
        </button>
      </div>
    </form>
  );
}
