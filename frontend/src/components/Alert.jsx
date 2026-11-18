// Feedback banner for success / error messages. Renders nothing when there is no message.
export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      {onClose && <button className="alert-close" aria-label="Dismiss message" onClick={onClose}>&times;</button>}
    </div>
  );
}
