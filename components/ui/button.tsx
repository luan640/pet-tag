import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-body font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-clay disabled:pointer-events-none disabled:opacity-55 active:scale-[.97]',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-surface shadow-[0_4px_14px_rgba(54,39,24,.25)] hover:bg-ink/90 hover:-translate-y-px',
        cta: 'bg-clay text-white shadow-[0_4px_16px_rgba(193,85,43,.35)] hover:bg-clay-hover hover:-translate-y-px',
        outline: 'border-2 border-ink/15 text-ink bg-transparent hover:bg-ink/5',
        ghost: 'text-ink-soft bg-transparent hover:bg-ink/5',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        link: 'underline-offset-4 hover:underline text-clay p-0 h-auto shadow-none font-medium',
      },
      size: {
        default: 'h-12 px-6 text-[.95rem]',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
