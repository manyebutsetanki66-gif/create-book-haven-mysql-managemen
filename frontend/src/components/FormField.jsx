import { useId, cloneElement } from 'react';

// Label + one input/select + error message. useId() gives every field a unique id, so
// labels still work when two forms (e.g. "add" and the "edit" pop-up) are on the page together.
export default function FormField({ label, error, children }) {
  const id = useId();
  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id, className: 'form-control', 'aria-invalid': Boolean(error) })}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
