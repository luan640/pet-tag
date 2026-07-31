'use client'

import { updatePetIdentity } from '@/actions/pets'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { CADASTRO_FORM_ID } from '@/components/pet/cadastro-form-id'
import type { Pet } from '@/lib/types'

const fieldClasses =
  'border-pub-line bg-white text-pub-ink placeholder:text-pub-ink-faint focus-visible:border-pub-teal focus-visible:ring-pub-teal/15'
const labelClasses = 'text-pub-ink-soft'

export function PetIdentityForm({ petId, pet }: { petId: string; pet: Pet }) {
  const { success: showSuccess, error: showError } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await updatePetIdentity(petId, new FormData(event.currentTarget))

    if (!result.success) {
      showError('Não foi possível salvar.', result.error)
      return
    }
    showSuccess('Dados atualizados!')
  }

  return (
    <form id={CADASTRO_FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <Label className={labelClasses} htmlFor="name">Nome do pet</Label>
        <Input id="name" name="name" required defaultValue={pet.name} className={fieldClasses} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className={labelClasses} htmlFor="species">Espécie</Label>
          <select
            id="species"
            name="species"
            defaultValue={pet.species}
            className={cn('h-12 rounded-xl border px-3.5 text-[.95rem] font-body', fieldClasses)}
          >
            <option value="cachorro">Cão</option>
            <option value="gato">Gato</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className={labelClasses} htmlFor="breed">Raça</Label>
          <Input
            id="breed"
            name="breed"
            defaultValue={pet.breed ?? ''}
            placeholder="Ex: Vira-lata"
            className={fieldClasses}
          />
        </div>
      </div>
    </form>
  )
}
