const variants = {
  primary: 'bg-primary text-white border-primary',
  secondary: 'bg-secondary text-primary border-border',
  accent: 'bg-accent text-white border-accent',
  outline: 'bg-transparent text-primary border-primary',
  ghost: 'bg-transparent text-primary border-transparent',
  danger: 'bg-error text-white border-error',
};

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-sm',
  md: 'px-5 py-[13px] text-md rounded-md',
  lg: 'px-7 py-4 text-lg rounded-lg',
};

export default function Button({
  title,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  fullWidth = false,
  children,
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center border-[1.5px] font-semibold tracking-wide shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? 'Please wait…' : (children || title)}
    </button>
  );
}
