'use client'

import { useState } from 'react'
import { Heart, Phone, MapPin, Save, AlertTriangle } from 'lucide-react'
import { updatePetProfile } from '@/actions/pets'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SexToggle } from '@/components/pet/sex-toggle'
import { useToast } from '@/components/ui/toaster'
import type { Pet } from '@/lib/types'

export function EditProfileForm({ pet }: { pet: Pet }) {
  const { success: showSuccess, error: showError } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const result = await updatePetProfile(new FormData(event.currentTarget))

    setLoading(false)
    if (!result.success) {
      showError('Não foi possível salvar.', result.error)
      return
    }
    showSuccess('Dados atualizados!')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome do pet</Label>
        <Input id="name" name="name" required defaultValue={pet.name} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="breed">Raça</Label>
          <Input id="breed" name="breed" defaultValue={pet.breed ?? ''} placeholder="Ex: Vira-lata" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="birth_date">Nascimento</Label>
          <Input id="birth_date" name="birth_date" type="date" defaultValue={pet.birth_date ?? ''} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Sexo</Label>
        <SexToggle defaultValue={pet.sex} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="allergies" className="flex items-center gap-1.5 text-clay">
          <AlertTriangle size={14} />
          Alergias
        </Label>
        <Textarea
          id="allergies"
          name="allergies"
          defaultValue={pet.allergies ?? ''}
          placeholder="Ex: alergia a picada de pulga, a determinado remédio ou alimento..."
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Observações</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={pet.bio ?? ''}
          placeholder="Temperamento, remédios de uso contínuo, cuidados especiais..."
        />
      </div>

      <div className="my-1 h-px bg-line" />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="owner_name">Seu nome</Label>
        <Input id="owner_name" name="owner_name" icon={<Heart size={15} />} defaultValue={pet.owner_name ?? ''} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone (com DDD)</Label>
        <Input id="phone" name="phone" type="tel" icon={<Phone size={15} />} defaultValue={pet.phone ?? ''} placeholder="(11) 91234-5678" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Bairro / cidade</Label>
        <Input id="location" name="location" icon={<MapPin size={15} />} defaultValue={pet.location ?? ''} placeholder="Ex: Jardim das Flores, São Paulo" />
      </div>

      <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading} className="mt-1">
        <Save size={16} />
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
