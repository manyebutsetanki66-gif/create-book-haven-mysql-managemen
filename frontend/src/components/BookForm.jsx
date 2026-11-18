/*
 * BookForm - the shared form behind AddBookForm and EditBookForm.
 * It is a CONTROLLED form: every input's value lives in React state, so React is the
 * single source of truth for what has been typed.
 */
import { useState } from 'react';
import FormField from './FormField.jsx';
import Alert from './Alert.jsx';
import { validateBookFields } from '../utils/validators.js';

const EMPTY = { title: '', author: '', genre: '', isbn: '', initial_quantity: '', available_quantity: '' };

export default function BookForm({ initial, editing = false, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initial ? { ...initial } : EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined }); // clear a field's error as the user fixes it
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateBookFields(values, { editing });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        title: values.title.trim(),
        author: values.author.trim(),
        genre: values.genre.trim(),
        isbn: values.isbn.replace(/[\s-]/g, ''),
        initial_quantity: Number(values.initial_quantity),
        available_quantity: editing ? Number(values.available_quantity) : undefined,
      });
      if (!editing) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Alert message={serverError} onClose={() => setServerError('')} />
      <div className="form-grid">
        <FormField label="Title" error={errors.title}>
          <input name="title" value={values.title} onChange={handleChange} />
        </FormField>
        <FormField label="Author" error={errors.author}>
          <input name="author" value={values.author} onChange={handleChange} />
        </FormField>
        <FormField label="Genre" error={errors.genre}>
          <input name="genre" value={values.genre} onChange={handleChange} placeholder="e.g. Fiction" />
        </FormField>
        <FormField label="ISBN" error={errors.isbn}>
          <input name="isbn" value={values.isbn} onChange={handleChange} placeholder="10 or 13 digits" />
        </FormField>
        <FormField label="Initial quantity" error={errors.initial_quantity}>
          <input name="initial_quantity" type="number" min="1" value={values.initial_quantity} onChange={handleChange} />
        </FormField>
        {editing && (
          <FormField label="Available quantity" error={errors.available_quantity}>
            <input name="available_quantity" type="number" min="0" value={values.available_quantity} onChange={handleChange} />
          </FormField>
        )}
      </div>
      <div className="form-actions">
        <button className="btn btn-add" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
