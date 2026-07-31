'use client'

import { MapPin } from 'lucide-react'
import { updatePetLocation } from '@/actions/pets'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toaster'
import { CADASTRO_FORM_ID } from '@/components/pet/cadastro-form-id'
import type { Pet } from '@/lib/types'

const fieldClasses =
  'border-pub-line bg-white text-pub-ink placeholder:text-pub-ink-faint focus-visible:border-pub-teal focus-visible:ring-pub-teal/15'
const labelClasses = 'text-pub-ink-soft'

export function PetLocationForm({ petId, pet }: { petId: string; pet: Pet }) {
  const { success: showSuccess, error: showError } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await updatePetLocation(petId, new FormData(event.currentTarget))

    if (!result.success) {
      showError('Não foi possível salvar.', result.error)
      return
    }
    showSuccess('Dados atualizados!')
  }

  return (
    <form id={CADASTRO_FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <Label className={labelClasses} htmlFor="location">Bairro / cidade</Label>
        <Input
          id="location"
          name="location"
          icon={<MapPin size={15} />}
          defaultValue={pet.location ?? ''}
          placeholder="Ex: Jardim das Flores, São Paulo"
          className={fieldClasses}
        />
      </div>
    </form>
  )
}
