import { useEffect } from 'react';

export default function Modal({ visible, onClose, title, children }) {
  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl bg-card p-6 shadow-lg sm:max-w-lg sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-text">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="px-2 text-lg text-muted">✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ visible, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text">{title}</h2>
        <p className="mb-6 mt-2 text-md leading-6 text-muted">{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-md bg-secondary py-3.5 font-semibold text-text">Cancel</button>
          <button type="button" onClick={onConfirm} className={`flex-1 rounded-md py-3.5 font-semibold text-white ${danger ? 'bg-error' : 'bg-primary'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
