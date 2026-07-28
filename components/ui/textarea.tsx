import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          className={cn(
            'flex min-h-24 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[.95rem] font-body text-ink placeholder:text-ink-faint transition-colors',
            'focus-visible:outline-none focus-visible:border-clay focus-visible:ring-2 focus-visible:ring-clay/15',
            error && 'border-red-400 focus-visible:ring-red-400/15',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
