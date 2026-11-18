import { useState } from 'react';
import FormField from './FormField.jsx';
import Alert from './Alert.jsx';

export default function LoginForm({ onLogin }) {
  const [values, setValues] = useState({ membership_id: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.membership_id.trim()) found.membership_id = 'Enter your membership ID.';
    if (!values.password) found.password = 'Enter your password.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onLogin(values.membership_id.trim(), values.password);
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <Alert message={serverError} onClose={() => setServerError('')} />
      <FormField label="Membership ID" error={errors.membership_id}>
        <input name="membership_id" value={values.membership_id} onChange={handleChange} autoComplete="username" placeholder="e.g. ADM001" />
      </FormField>
      <FormField label="Password" error={errors.password}>
        <input name="password" type="password" value={values.password} onChange={handleChange} autoComplete="current-password" />
      </FormField>
      <button className="btn btn-add btn-block" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Log in'}
      </button>
    </form>
  );
}
