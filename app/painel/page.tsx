import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPetPhotoPublicUrl } from '@/lib/supabase/storage'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Logo } from '@/components/brand/logo'

export default async function PainelPickerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  if (!pets || pets.length === 0) redirect('/entrar')

  if (pets.length === 1) redirect(`/painel/${pets[0].id}`)

  const petIds = pets.map((pet) => pet.id)
  const { data: photosRaw } = await supabase
    .from('pet_photos')
    .select('pet_id, storage_path')
    .in('pet_id', petIds)
    .order('sort_order', { ascending: true })

  const firstPhotoByPet = new Map<string, string>()
  for (const photo of photosRaw ?? []) {
    if (!firstPhotoByPet.has(photo.pet_id)) {
      firstPhotoByPet.set(photo.pet_id, getPetPhotoPublicUrl(photo.storage_path))
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-pub-bg px-6 py-16">
      <Logo />

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-display text-2xl font-bold text-pub-ink">Qual pet você quer ver?</h1>
        <p className="text-sm text-pub-ink-soft">Escolha um para gerenciar a identificação dele.</p>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        {pets.map((pet) => (
          <Link
            key={pet.id}
            href={`/painel/${pet.id}`}
            className="flex flex-col items-center gap-2 rounded-2xl p-2 transition-colors hover:bg-pub-ink/5"
          >
            <Avatar className="h-24 w-24 border-2 border-white shadow-md">
              <AvatarImage src={firstPhotoByPet.get(pet.id)} alt={pet.name} />
              <AvatarFallback className="text-2xl">
                {firstPhotoByPet.get(pet.id) ? <PawPrint size={28} /> : pet.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[7rem] truncate text-sm font-semibold text-pub-ink">{pet.name}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
