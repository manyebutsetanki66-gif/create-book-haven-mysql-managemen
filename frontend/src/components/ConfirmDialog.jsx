import Modal from './Modal.jsx';

// "Are you sure?" pop-up used before deleting anything.
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button className="btn btn-delete" onClick={onConfirm} disabled={busy}>
          {busy ? 'Please wait...' : confirmLabel}
        </button>
        <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </Modal>
  );
}
