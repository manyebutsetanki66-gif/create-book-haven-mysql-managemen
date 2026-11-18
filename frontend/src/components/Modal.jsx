import { useEffect } from 'react';

// A pop-up window. Closes with the Escape key or by clicking the dark background.
export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey); // cleanup
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="alert-close" aria-label="Close" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
