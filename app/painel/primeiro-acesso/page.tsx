import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrimeiroAcessoClient } from './PrimeiroAcessoClient'

export default async function PrimeiroAcessoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/entrar')
  if (!profile.must_change_password) redirect('/painel')

  const isPlaceholderEmail = (user.email ?? '').endsWith('@pet.local')

  return <PrimeiroAcessoClient suggestEmail={!isPlaceholderEmail ? user.email ?? '' : ''} />
}
