'use client'

import { AlertTriangle } from 'lucide-react'
import { updatePetCharacteristics } from '@/actions/pets'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PubSelect } from '@/components/pet/pub-select'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { CADASTRO_FORM_ID } from '@/components/pet/cadastro-form-id'
import type { Pet } from '@/lib/types'

const fieldClasses =
  'border-pub-line bg-white text-pub-ink placeholder:text-pub-ink-faint focus-visible:border-pub-teal focus-visible:ring-pub-teal/15'
const labelClasses = 'text-pub-ink-soft'

export function PetCharacteristicsForm({ petId, pet }: { petId: string; pet: Pet }) {
  const { success: showSuccess, error: showError } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await updatePetCharacteristics(petId, new FormData(event.currentTarget))

    if (!result.success) {
      showError('Não foi possível salvar.', result.error)
      return
    }
    showSuccess('Dados atualizados!')
  }

  return (
    <form id={CADASTRO_FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className={labelClasses} htmlFor="birth_date">Nascimento</Label>
          <Input
            id="birth_date"
            name="birth_date"
            type="date"
            defaultValue={pet.birth_date ?? ''}
            className={fieldClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className={labelClasses}>Sexo</Label>
          <PubSelect
            name="sex"
            defaultValue={pet.sex}
            options={[
              { value: 'macho', label: 'Macho' },
              { value: 'femea', label: 'Fêmea' },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className={labelClasses}>Porte</Label>
        <PubSelect
          name="size"
          defaultValue={pet.size}
          options={[
            { value: 'pequeno', label: 'Pequeno' },
            { value: 'medio', label: 'Médio' },
            { value: 'grande', label: 'Grande' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className={labelClasses} htmlFor="weight_kg">Peso (kg)</Label>
          <Input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            min="0"
            defaultValue={pet.weight_kg ?? ''}
            placeholder="Ex: 28"
            className={fieldClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className={labelClasses} htmlFor="fur_color">Cor da pelagem</Label>
          <Input
            id="fur_color"
            name="fur_color"
            defaultValue={pet.fur_color ?? ''}
            placeholder="Ex: Dourado"
            className={fieldClasses}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className={labelClasses}>Castrado(a)</Label>
        <PubSelect
          name="neutered"
          defaultValue={pet.neutered === null ? '' : String(pet.neutered)}
          options={[
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="allergies" className={cn(labelClasses, 'flex items-center gap-1.5 text-clay')}>
          <AlertTriangle size={14} />
          Alergias
        </Label>
        <Textarea
          id="allergies"
          name="allergies"
          defaultValue={pet.allergies ?? ''}
          placeholder="Ex: alergia a picada de pulga, a determinado remédio ou alimento..."
          className={fieldClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className={labelClasses} htmlFor="bio">Observações</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={pet.bio ?? ''}
          placeholder="Temperamento, manias, cuidados especiais..."
          className={fieldClasses}
        />
      </div>
    </form>
  )
}
