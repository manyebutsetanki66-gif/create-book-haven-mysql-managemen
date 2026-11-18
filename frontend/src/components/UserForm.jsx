/*
 * UserForm - used for both "Register user" and "Edit user".
 * When editing, the password boxes are optional: leave them empty to keep the old password.
 * When creating, the password must be confirmed by typing it twice.
 */
import { useState } from 'react';
import FormField from './FormField.jsx';
import Alert from './Alert.jsx';
import { validateUserFields } from '../utils/validators.js';
import { roleLabel } from '../utils/format.js';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '', confirm_password: '' };
const ROLES = ['member', 'librarian', 'administrator'];

export default function UserForm({ formId, initial, onSubmit, onCancel }) {
  const editing = Boolean(initial);
  const [values, setValues] = useState(initial ? { ...initial, password: '', confirm_password: '' } : EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateUserFields(values, { creating: !editing });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        name: values.name.trim(),
        membership_id: values.membership_id.trim().toUpperCase(),
        role: values.role,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      if (!editing) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate>
      <Alert message={serverError} onClose={() => setServerError('')} />
      <div className="form-grid">
        <FormField label="Full name" error={errors.name}>
          <input name="name" value={values.name} onChange={handleChange} />
        </FormField>
        <FormField label="Membership ID" error={errors.membership_id}>
          <input name="membership_id" value={values.membership_id} onChange={handleChange} placeholder="e.g. MEM010" />
        </FormField>
        <div className="form-group">
          <span className="field-label">Role</span>
          <div className="radio-group" role="radiogroup" aria-label="Role">
            {ROLES.map((role) => (
              <label key={role}>
                <input type="radio" name="role" value={role} checked={values.role === role} onChange={handleChange} />
                {roleLabel(role)}
              </label>
            ))}
          </div>
          {errors.role && <p className="field-error">{errors.role}</p>}
        </div>
        <FormField label={editing ? 'New password (optional)' : 'Password'} error={errors.password}>
          <input name="password" type="password" value={values.password} onChange={handleChange} autoComplete="new-password" />
        </FormField>
        <FormField label="Confirm password" error={errors.confirm_password}>
          <input name="confirm_password" type="password" value={values.confirm_password} onChange={handleChange} autoComplete="new-password" />
        </FormField>
      </div>
      <div className="form-actions">
        <button className="btn btn-add" disabled={submitting}>
          {submitting ? 'Saving...' : editing ? 'Save changes' : 'Register user'}
        </button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
