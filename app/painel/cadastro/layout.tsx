import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CadastroShell } from '@/components/pet/cadastro-shell'

export default async function CadastroLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('id').eq('owner_id', user.id).single()
  if (!pet) redirect('/entrar')

  return <CadastroShell>{children}</CadastroShell>
}
