// Minimal shadcn-compatible Button component
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[rgba(124,58,237,0.5)] focus:ring-offset-2 focus:ring-offset-[#080810]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 hover:from-[#8b5cf6] hover:to-[#7c3aed]',
        secondary:
          'bg-transparent text-[#f1f5f9] border border-[rgba(148,163,184,0.15)] hover:bg-[rgba(148,163,184,0.06)] hover:border-[rgba(148,163,184,0.25)]',
        ghost:
          'bg-transparent text-[#94a3b8] hover:bg-[rgba(148,163,184,0.08)] hover:text-[#f1f5f9]',
        destructive:
          'bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white hover:opacity-90',
        outline:
          'bg-transparent border border-[rgba(124,58,237,0.4)] text-[#a855f7] hover:bg-[rgba(124,58,237,0.08)]',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        default: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
