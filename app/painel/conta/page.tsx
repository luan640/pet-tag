import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AccountSettings } from '@/components/pet/account-settings'

export default async function ContaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).single()
  if (!pet) redirect('/entrar')

  const publicUrl = `${(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/p/${pet.slug}`

  return (
    <main className="min-h-dvh bg-bg pb-16">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
          <Logo />
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut size={15} />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-5 py-8">
        <Link
          href="/painel"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={15} />
          Voltar ao painel
        </Link>

        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Página pública de {pet.name}</p>
            <p className="truncate font-mono text-sm text-ink-soft">{publicUrl}</p>
          </div>
          <Link href={`/p/${pet.slug}`} target="_blank">
            <Button variant="cta">
              Ver página <ExternalLink size={15} />
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sua conta</CardTitle>
            <CardDescription>Senha e e-mail de recuperação.</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountSettings currentEmail={user.email ?? ''} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
