import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto rounded-md border p-3 shadow-lg',
            toast.variant === 'error' && 'border-red-200 bg-red-50 text-red-900',
            toast.variant === 'success' && 'border-neutral-300 bg-neutral-100 text-neutral-900',
            (!toast.variant || toast.variant === 'info') && 'border-neutral-200 bg-white text-neutral-900',
          )}
        >
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-xs">{toast.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
