'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function PubSelect({
  name,
  defaultValue,
  options,
}: {
  name: string
  defaultValue?: string | null
  options: { value: string; label: string }[]
}) {
  const [value, setValue] = useState(defaultValue ?? '')

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={value} />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setValue((current) => (current === option.value ? '' : option.value))}
          className={cn(
            'flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
            value === option.value
              ? 'border-clay bg-clay-soft text-clay'
              : 'border-pub-line bg-white text-pub-ink-soft hover:bg-pub-ink/5',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
