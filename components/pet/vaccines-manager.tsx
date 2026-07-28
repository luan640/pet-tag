'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Syringe } from 'lucide-react'
import { addVaccine, deleteVaccine } from '@/actions/pets'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { formatDateShort } from '@/lib/utils'
import type { PetVaccine } from '@/lib/types'

export function VaccinesManager({ vaccines }: { vaccines: PetVaccine[] }) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const result = await addVaccine(new FormData(event.currentTarget))

    setLoading(false)
    if (!result.success) {
      showError('Não foi possível adicionar a vacina.', result.error)
      return
    }
    showSuccess('Vacina adicionada!')
    ;(event.target as HTMLFormElement).reset()
    router.refresh()
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteVaccine(id)
      setDeletingId(null)
      if (!result.success) {
        showError('Não foi possível remover.', result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {vaccines.length > 0 && (
        <div className="flex flex-col gap-2">
          {vaccines.map((vaccine) => (
            <div key={vaccine.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fern-soft text-fern">
                  <Syringe size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{vaccine.name}</p>
                  {vaccine.applied_date && (
                    <p className="text-xs text-ink-faint">Aplicada em {formatDateShort(vaccine.applied_date)}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(vaccine.id)}
                disabled={pending && deletingId === vaccine.id}
                className="rounded-full p-1.5 text-ink-faint hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Remover vacina"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-xl border border-dashed border-line p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vaccine_name">Nome da vacina</Label>
          <Input id="vaccine_name" name="name" required placeholder="Ex: V10, Raiva, Giárdia" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="applied_date">Aplicada em</Label>
            <Input id="applied_date" name="applied_date" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="next_due_date">Próxima dose</Label>
            <Input id="next_due_date" name="next_due_date" type="date" />
          </div>
        </div>
        <Button type="submit" variant="outline" disabled={loading}>
          <Plus size={15} />
          {loading ? 'Adicionando...' : 'Adicionar vacina'}
        </Button>
      </form>
    </div>
  )
}
