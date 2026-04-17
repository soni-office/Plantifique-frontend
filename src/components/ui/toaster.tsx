import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

const variantConfig = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    iconClass: 'text-emerald-500',
    bg: 'bg-white border-emerald-100',
    text: 'text-slate-800',
  },
  error: {
    icon: XCircle,
    bar: 'bg-red-500',
    iconClass: 'text-red-500',
    bg: 'bg-white border-red-100',
    text: 'text-slate-800',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    iconClass: 'text-blue-500',
    bg: 'bg-white border-blue-100',
    text: 'text-slate-800',
  },
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-5 top-5 z-[9999] flex w-full max-w-[360px] flex-col gap-3"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((toast) => {
          const variant = toast.variant ?? 'info';
          const cfg = variantConfig[variant] ?? variantConfig.info;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className={cn(
                'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden',
                'rounded-xl border shadow-lg shadow-black/[0.06] backdrop-blur-sm',
                'px-4 py-3.5',
                cfg.bg,
              )}
            >
              {/* Left accent bar */}
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-[3px] rounded-l-xl',
                  cfg.bar,
                )}
              />

              {/* Icon */}
              <Icon
                size={18}
                className={cn('mt-0.5 shrink-0', cfg.iconClass)}
                strokeWidth={2.2}
              />

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn('text-[13px] font-semibold leading-snug', cfg.text)}
                >
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-0.5 text-[12px] text-slate-500 leading-snug">
                    {toast.description}
                  </p>
                )}
              </div>

              {/* Dismiss icon (visual only, auto-dismiss handles it) */}
              <X
                size={14}
                strokeWidth={2.5}
                className="mt-0.5 shrink-0 text-slate-300 cursor-default"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
