import { useToastStore } from '../../store/toastStore';

const typeStyles = {
  success: { bg: 'bg-success', icon: '✓' },
  error: { bg: 'bg-error', icon: '✕' },
  warning: { bg: 'bg-warning', icon: '!' },
  info: { bg: 'bg-primary', icon: 'i' },
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed left-4 right-4 top-20 z-[80] mx-auto flex max-w-md flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const t = typeStyles[toast.type] || typeStyles.info;
        return (
          <div key={toast.id} className={`flex items-center gap-3 rounded-lg px-4 py-3.5 text-white shadow-lg ${t.bg}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-bold">{t.icon}</span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
