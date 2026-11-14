import { forwardRef, useState } from 'react';

export const controlClass =
  'min-w-0 w-full flex-1 rounded-[inherit] border-0 bg-transparent py-3 text-md text-text shadow-none outline-none ring-0 placeholder:text-mutedLight focus:border-0 focus:shadow-none focus:outline-none focus:ring-0';

export const bareControlClass =
  'w-full rounded-md border border-border bg-card px-3 py-3 text-md text-text shadow-none outline-none transition placeholder:text-mutedLight focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export function shellClass({ error = false, disabled = false, pill = false, className = '' } = {}) {
  return [
    'flex items-center border-[1.5px] bg-card px-4 shadow-sm transition',
    pill ? 'rounded-full' : 'rounded-md',
    error
      ? 'border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error/20'
      : 'border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
    disabled ? 'bg-secondary opacity-70' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

const Input = forwardRef(function Input(
  { label, error, type = 'text', className = '', id, multiline, rows = 4, disabled, ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const inputId = id || props.name;
  const isPassword = type === 'password';

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <div className={shellClass({ error: !!error, disabled })}>
        {multiline ? (
          <textarea id={inputId} ref={ref} rows={rows} disabled={disabled} className={`${controlClass} resize-y`} {...props} />
        ) : (
          <input
            id={inputId}
            ref={ref}
            type={isPassword && show ? 'text' : type}
            disabled={disabled}
            className={controlClass}
            {...props}
          />
        )}
        {isPassword && (
          <button
            type="button"
            className="ml-2 shrink-0 self-center text-sm font-semibold text-accent"
            onClick={() => setShow((s) => !s)}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
});

export default Input;
