import Button from './Button';

export default function EmptyState({ icon = '📚', title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">{icon}</div>
      <h2 className="mb-2 text-xl font-bold text-text">{title}</h2>
      {subtitle && <p className="mb-6 max-w-md text-md leading-6 text-muted">{subtitle}</p>}
      {actionLabel && onAction && <Button title={actionLabel} onClick={onAction} />}
    </div>
  );
}
