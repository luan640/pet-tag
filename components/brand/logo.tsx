import { cn } from '@/lib/utils'
import { PawPrint } from 'lucide-react'

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay text-white">
        <PawPrint size={16} strokeWidth={2.5} />
      </span>
      {!iconOnly && (
        <span className="font-display text-lg font-bold text-ink tracking-tight">PetTag</span>
      )}
    </div>
  )
}
