import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PetCharacteristicsForm } from '@/components/pet/pet-characteristics-form'

export default async function CadastroCaracteristicasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).single()
  if (!pet) redirect('/entrar')

  return <PetCharacteristicsForm pet={pet} />
}
