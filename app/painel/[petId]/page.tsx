import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPetPhotoPublicUrl } from '@/lib/supabase/storage'
import { PhotosManager } from '@/components/pet/photos-manager'
import { PetIdentityForm } from '@/components/pet/pet-identity-form'

export default async function PainelPetPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).eq('id', petId).single()
  if (!pet) redirect('/painel')

  const { data: photosRaw } = await supabase
    .from('pet_photos')
    .select('*')
    .eq('pet_id', pet.id)
    .order('sort_order', { ascending: true })

  const photos = (photosRaw ?? []).map((photo) => ({
    ...photo,
    url: getPetPhotoPublicUrl(photo.storage_path),
  }))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-sm font-bold text-pub-ink">Fotos do pet</h3>
        <PhotosManager petId={pet.id} photos={photos} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-pub-ink">Identificação</h3>
        <PetIdentityForm petId={pet.id} pet={pet} />
      </div>
    </div>
  )
}
