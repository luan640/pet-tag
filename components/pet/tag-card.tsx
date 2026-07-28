import { cn } from '@/lib/utils'

export function TagCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative mx-auto w-full max-w-sm pt-5">
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brass shadow-md">
          <div className="h-4 w-4 rounded-full bg-bg" />
        </div>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-[2.25rem] border-2 border-line bg-surface shadow-[0_10px_34px_rgba(54,39,24,.14)]',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
