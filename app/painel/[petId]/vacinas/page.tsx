import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VaccinesManager } from '@/components/pet/vaccines-manager'

export default async function CadastroVacinasPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('id').eq('owner_id', user.id).eq('id', petId).single()
  if (!pet) redirect('/painel')

  const { data: vaccines } = await supabase
    .from('pet_vaccines')
    .select('*')
    .eq('pet_id', pet.id)
    .order('applied_date', { ascending: false })

  return <VaccinesManager petId={pet.id} vaccines={vaccines ?? []} />
}
