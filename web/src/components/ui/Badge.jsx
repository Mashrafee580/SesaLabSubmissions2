const presets = {
  default: 'bg-secondary text-text',
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-white',
  success: 'bg-green-100 text-success',
  warning: 'bg-yellow-100 text-warning',
  error: 'bg-red-100 text-error',
  pending: 'bg-yellow-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  sell: 'bg-blue-100 text-blue-700',
  buy: 'bg-pink-100 text-pink-700',
};

export default function Badge({ label, preset = 'default', size = 'sm', className = '' }) {
  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex w-fit items-center rounded-full font-semibold capitalize tracking-wide ${pad} ${presets[preset] || presets.default} ${className}`}>
      {label}
    </span>
  );
}
