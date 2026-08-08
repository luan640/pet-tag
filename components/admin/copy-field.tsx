'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5">
        <span className="flex-1 truncate font-mono text-sm text-ink">{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-1.5 text-ink-soft hover:bg-ink/5 hover:text-ink transition-colors"
          aria-label={`Copiar ${label}`}
        >
          {copied ? <Check size={16} className="text-fern" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  )
}
