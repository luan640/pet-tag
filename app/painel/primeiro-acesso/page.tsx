import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrimeiroAcessoClient } from './PrimeiroAcessoClient'

export default async function PrimeiroAcessoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).single()
  if (!pet) redirect('/entrar')

  const isPlaceholderEmail = (user.email ?? '').endsWith('@pet.local')

  return <PrimeiroAcessoClient pet={pet} suggestEmail={!isPlaceholderEmail ? user.email ?? '' : ''} />
}
