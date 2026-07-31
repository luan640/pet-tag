import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CadastroShell } from '@/components/pet/cadastro-shell'

export default async function PetLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('id').eq('owner_id', user.id).eq('id', petId).single()
  if (!pet) redirect('/painel')

  return <CadastroShell petId={petId}>{children}</CadastroShell>
}
