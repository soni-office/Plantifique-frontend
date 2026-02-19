import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-black placeholder:text-neutral-400 focus:ring-2',
        className,
      )}
      {...props}
    />
  );
}
