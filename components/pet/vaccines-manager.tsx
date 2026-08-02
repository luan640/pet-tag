'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Pencil, Syringe, AlertTriangle } from 'lucide-react'
import { addVaccine, deleteVaccine, updateVaccine } from '@/actions/pets'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BottomSheet, BottomSheetTrigger, BottomSheetContent, BottomSheetTitle } from '@/components/ui/bottom-sheet'
import { useToast } from '@/components/ui/toaster'
import { formatDateShort, getVaccineDueStatus } from '@/lib/utils'
import type { PetVaccine } from '@/lib/types'

const fieldClasses =
  'border-pub-line bg-white text-pub-ink placeholder:text-pub-ink-faint focus-visible:border-pub-teal focus-visible:ring-pub-teal/15'

const STATUS_PRIORITY = { overdue: 0, soon: 1, ok: 2, none: 3 } as const

const STATUS_BADGE: Record<string, { label: string; variant: 'danger' | 'warning' | 'success' }> = {
  overdue: { label: 'Atrasada', variant: 'danger' },
  soon: { label: 'Vence em breve', variant: 'warning' },
  ok: { label: 'Em dia', variant: 'success' },
}

function sortVaccines(vaccines: PetVaccine[]): PetVaccine[] {
  return [...vaccines].sort((a, b) => {
    const statusA = getVaccineDueStatus(a.next_due_date)
    const statusB = getVaccineDueStatus(b.next_due_date)
    const priorityDiff = STATUS_PRIORITY[statusA] - STATUS_PRIORITY[statusB]
    if (priorityDiff !== 0) return priorityDiff

    if (a.next_due_date && b.next_due_date) return a.next_due_date.localeCompare(b.next_due_date)
    if (a.next_due_date) return -1
    if (b.next_due_date) return 1

    return (b.applied_date ?? '').localeCompare(a.applied_date ?? '')
  })
}

export function VaccinesManager({ petId, vaccines }: { petId: string; vaccines: PetVaccine[] }) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PetVaccine | null>(null)
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const sorted = sortVaccines(vaccines)
  const overdueCount = sorted.filter((v) => getVaccineDueStatus(v.next_due_date) === 'overdue').length
  const soonCount = sorted.filter((v) => getVaccineDueStatus(v.next_due_date) === 'soon').length

  function openAddSheet() {
    setEditing(null)
    setOpen(true)
  }

  function openEditSheet(vaccine: PetVaccine) {
    setEditing(vaccine)
    setOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = editing ? await updateVaccine(editing.id, formData) : await addVaccine(petId, formData)

    setLoading(false)
    if (!result.success) {
      showError(editing ? 'Não foi possível salvar a vacina.' : 'Não foi possível adicionar a vacina.', result.error)
      return
    }
    showSuccess(editing ? 'Vacina atualizada!' : 'Vacina adicionada!')
    ;(event.target as HTMLFormElement).reset()
    setOpen(false)
    setEditing(null)
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
      {(overdueCount > 0 || soonCount > 0) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">
            {overdueCount > 0 && (
              <>
                {overdueCount === 1 ? '1 vacina atrasada' : `${overdueCount} vacinas atrasadas`}
                {soonCount > 0 ? ' e ' : '.'}
              </>
            )}
            {soonCount > 0 && (
              <>{soonCount === 1 ? '1 vacina vence em breve.' : `${soonCount} vacinas vencem em breve.`}</>
            )}
          </p>
        </div>
      )}

      {sorted.length > 0 ? (
        <div className="flex flex-col gap-2">
          {sorted.map((vaccine) => {
            const status = getVaccineDueStatus(vaccine.next_due_date)
            const badge = STATUS_BADGE[status]
            return (
              <div
                key={vaccine.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-pub-line bg-white px-4 py-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pub-teal-soft text-pub-teal">
                    <Syringe size={15} />
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-semibold text-pub-ink">{vaccine.name}</p>
                      {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                    </div>
                    {vaccine.applied_date && (
                      <p className="text-xs text-pub-ink-faint">Aplicada em {formatDateShort(vaccine.applied_date)}</p>
                    )}
                    {vaccine.next_due_date && (
                      <p className="text-xs text-pub-ink-faint">Próxima dose em {formatDateShort(vaccine.next_due_date)}</p>
                    )}
                    {vaccine.notes && <p className="text-xs text-pub-ink-faint italic">{vaccine.notes}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditSheet(vaccine)}
                    className="rounded-full p-1.5 text-pub-ink-faint hover:bg-pub-teal-soft hover:text-pub-teal transition-colors"
                    aria-label="Editar vacina"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vaccine.id)}
                    disabled={pending && deletingId === vaccine.id}
                    className="rounded-full p-1.5 text-pub-ink-faint hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Remover vacina"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-pub-ink-soft">Nenhuma vacina cadastrada ainda.</p>
      )}

      <BottomSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditing(null)
        }}
      >
        <BottomSheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="border-pub-ink/15 text-pub-ink hover:bg-pub-ink/5"
            onClick={openAddSheet}
          >
            <Plus size={15} />
            Adicionar vacina
          </Button>
        </BottomSheetTrigger>
        <BottomSheetContent
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            nameInputRef.current?.focus()
          }}
        >
          <BottomSheetTitle>{editing ? 'Editar vacina' : 'Adicionar vacina'}</BottomSheetTitle>
          <form key={editing?.id ?? 'new'} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vaccine_name" className="text-pub-ink-soft">Nome da vacina</Label>
              <Input
                ref={nameInputRef}
                id="vaccine_name"
                name="name"
                required
                defaultValue={editing?.name ?? ''}
                placeholder="Ex: V10, Raiva, Giárdia"
                className={fieldClasses}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="applied_date" className="text-pub-ink-soft">Aplicada em</Label>
                <Input
                  id="applied_date"
                  name="applied_date"
                  type="date"
                  defaultValue={editing?.applied_date ?? ''}
                  className={fieldClasses}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="next_due_date" className="text-pub-ink-soft">Próxima dose</Label>
                <Input
                  id="next_due_date"
                  name="next_due_date"
                  type="date"
                  defaultValue={editing?.next_due_date ?? ''}
                  className={fieldClasses}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes" className="text-pub-ink-soft">Observações (opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={editing?.notes ?? ''}
                placeholder="Ex: reforço anual, reação leve, lote da vacina..."
                className={fieldClasses}
              />
            </div>
            <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading} className="mt-1">
              {loading ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar vacina'}
            </Button>
          </form>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  )
}
