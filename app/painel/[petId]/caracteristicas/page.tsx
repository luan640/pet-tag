import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PetCharacteristicsForm } from '@/components/pet/pet-characteristics-form'

export default async function CadastroCaracteristicasPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).eq('id', petId).single()
  if (!pet) redirect('/painel')

  return <PetCharacteristicsForm petId={pet.id} pet={pet} />
}
