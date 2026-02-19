import { useCallback, useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

export function toast(input: Omit<ToastItem, 'id'>) {
  const id = crypto.randomUUID();
  const item: ToastItem = { ...input, id };
  toasts = [item, ...toasts].slice(0, 3);
  emit();

  setTimeout(() => {
    toasts = toasts.filter((toastItem) => toastItem.id !== id);
    emit();
  }, 3000);
}

export function useToast() {
  const [state, setState] = useState<ToastItem[]>(toasts);

  const subscribe = useCallback((listener: (items: ToastItem[]) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => subscribe(setState), [subscribe]);

  return { toasts: state, toast };
}
