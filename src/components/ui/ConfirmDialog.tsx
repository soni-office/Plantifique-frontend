import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Trash2, X, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../utils/cn';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig: Record<
  ConfirmDialogVariant,
  {
    icon: LucideIcon;
    iconWrapperClass: string;
    iconClass: string;
    confirmClass: string;
  }
> = {
  danger: {
    icon: Trash2,
    iconWrapperClass: 'bg-red-50 ring-1 ring-red-100',
    iconClass: 'text-red-500',
    confirmClass:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconWrapperClass: 'bg-amber-50 ring-1 ring-amber-100',
    iconClass: 'text-amber-500',
    confirmClass:
      'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400',
  },
  info: {
    icon: AlertTriangle,
    iconWrapperClass: 'bg-blue-50 ring-1 ring-blue-100',
    iconClass: 'text-blue-500',
    confirmClass:
      'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  },
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[10000] bg-black/30 backdrop-blur-[3px]"
            onClick={onCancel}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={description ? 'confirm-dialog-desc' : undefined}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'fixed inset-0 z-[10001] m-auto h-fit w-[92%] max-w-md',
              'rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-black/10',
              'p-6',
            )}
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close dialog"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            {/* Icon + Title */}
            <div className="flex items-start gap-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', cfg.iconWrapperClass)}>
                <Icon size={20} className={cfg.iconClass} strokeWidth={2} />
              </div>
              <div className="pt-1">
                <h2
                  id="confirm-dialog-title"
                  className="text-[15px] font-semibold leading-snug text-slate-900"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="confirm-dialog-desc"
                    className="mt-1.5 text-[13px] leading-relaxed text-slate-500"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className={cn(
                  'rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600',
                  'transition hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
                  'disabled:opacity-50',
                )}
              >
                {cancelLabel}
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold',
                  'transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  'disabled:opacity-70',
                  cfg.confirmClass,
                )}
              >
                {isLoading && (
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-20"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-80"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3V1a10 10 0 100 20v-2a8 8 0 01-8-8z"
                    />
                  </svg>
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
