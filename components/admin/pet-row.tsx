'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, ExternalLink, Power } from 'lucide-react'
import { toggleActive } from '@/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { formatDateShort } from '@/lib/utils'
import type { PetListRow } from '@/lib/types'

export function PetRow({ pet, publicUrl, tagUrl }: { pet: PetListRow; publicUrl: string; tagUrl: string }) {
  const router = useRouter()
  const { success: showSuccess } = useToast()
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleCopy() {
    await navigator.clipboard.writeText(tagUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleActive(pet.id, !pet.active)
      if (result.success) {
        showSuccess(pet.active ? 'Tag desativada.' : 'Tag reativada.')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-base font-bold text-ink">{pet.name}</span>
          {pet.is_configured ? (
            <Badge variant="success">Configurado</Badge>
          ) : (
            <Badge variant="default">Aguardando tutor</Badge>
          )}
          {!pet.active && <Badge variant="danger">Desativado</Badge>}
        </div>
        <p className="mt-1 truncate text-sm text-ink-soft">
          {pet.owner_email ?? 'sem e-mail cadastrado'} · criado em {formatDateShort(pet.created_at)}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-ink-faint">/p/{pet.slug}</p>
      </div>

      <div className="flex flex-wrap shrink-0 items-center gap-2 sm:flex-nowrap">
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check size={15} className="text-fern" /> : <Copy size={15} />}
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
        <a href={publicUrl} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="icon" aria-label="Abrir página pública">
            <ExternalLink size={16} />
          </Button>
        </a>
        <Button variant="outline" size="sm" onClick={handleToggle} disabled={pending}>
          <Power size={15} />
          {pet.active ? 'Desativar' : 'Reativar'}
        </Button>
      </div>
    </div>
  )
}
