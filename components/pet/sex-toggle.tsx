'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PetSex } from '@/lib/types'

export function SexToggle({ defaultValue }: { defaultValue?: PetSex | null }) {
  const [value, setValue] = useState<PetSex | ''>(defaultValue ?? '')

  return (
    <div className="flex gap-2">
      <input type="hidden" name="sex" value={value} />
      {(['macho', 'femea'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setValue((current) => (current === option ? '' : option))}
          className={cn(
            'flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition-colors',
            value === option
              ? 'border-clay bg-clay-soft text-clay'
              : 'border-line bg-surface text-ink-soft hover:bg-ink/5',
          )}
        >
          {option === 'macho' ? 'Macho' : 'Fêmea'}
        </button>
      ))}
    </div>
  )
}
