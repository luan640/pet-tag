'use client'

import { Heart, Phone } from 'lucide-react'
import { updatePetContact } from '@/actions/pets'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toaster'
import { CADASTRO_FORM_ID } from '@/components/pet/cadastro-form-id'
import type { Pet } from '@/lib/types'

const fieldClasses =
  'border-pub-line bg-white text-pub-ink placeholder:text-pub-ink-faint focus-visible:border-pub-teal focus-visible:ring-pub-teal/15'
const labelClasses = 'text-pub-ink-soft'

export function PetContactForm({ pet }: { pet: Pet }) {
  const { success: showSuccess, error: showError } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await updatePetContact(new FormData(event.currentTarget))

    if (!result.success) {
      showError('Não foi possível salvar.', result.error)
      return
    }
    showSuccess('Dados atualizados!')
  }

  return (
    <form id={CADASTRO_FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <Label className={labelClasses} htmlFor="owner_name">Seu nome</Label>
        <Input
          id="owner_name"
          name="owner_name"
          icon={<Heart size={15} />}
          defaultValue={pet.owner_name ?? ''}
          className={fieldClasses}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className={labelClasses} htmlFor="phone">Telefone (com DDD)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          icon={<Phone size={15} />}
          defaultValue={pet.phone ?? ''}
          placeholder="(11) 91234-5678"
          className={fieldClasses}
        />
      </div>
    </form>
  )
}
