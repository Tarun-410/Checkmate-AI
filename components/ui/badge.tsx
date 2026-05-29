// Badge component
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase border',
  {
    variants: {
      variant: {
        default: 'bg-[rgba(124,58,237,0.15)] text-[#a855f7] border-[rgba(124,58,237,0.3)]',
        blunder: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
        mistake: 'bg-[rgba(249,115,22,0.15)] text-[#f97316] border-[rgba(249,115,22,0.3)]',
        inaccuracy: 'bg-[rgba(234,179,8,0.15)] text-[#eab308] border-[rgba(234,179,8,0.3)]',
        good: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[rgba(34,197,94,0.3)]',
        brilliant: 'bg-[rgba(6,182,212,0.15)] text-[#06b6d4] border-[rgba(6,182,212,0.3)]',
        secondary: 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8] border-[rgba(148,163,184,0.15)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
