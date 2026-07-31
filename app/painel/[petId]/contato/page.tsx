import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PetContactForm } from '@/components/pet/pet-contact-form'

export default async function CadastroContatoPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).eq('id', petId).single()
  if (!pet) redirect('/painel')

  return <PetContactForm petId={pet.id} pet={pet} />
}
