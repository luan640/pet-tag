import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ExternalLink, PartyPopper } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPetPhotoPublicUrl } from '@/lib/supabase/storage'
import { signOut } from '@/actions/auth'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { EditProfileForm } from '@/components/pet/edit-profile-form'
import { PhotosManager } from '@/components/pet/photos-manager'
import { VaccinesManager } from '@/components/pet/vaccines-manager'
import { AccountSettings } from '@/components/pet/account-settings'
import { LostToggle } from '@/components/pet/lost-toggle'

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).single()
  if (!pet) redirect('/entrar')

  const { data: photosRaw } = await supabase
    .from('pet_photos')
    .select('*')
    .eq('pet_id', pet.id)
    .order('sort_order', { ascending: true })

  const photos = (photosRaw ?? []).map((photo) => ({
    ...photo,
    url: getPetPhotoPublicUrl(photo.storage_path),
  }))

  const { data: vaccines } = await supabase
    .from('pet_vaccines')
    .select('*')
    .eq('pet_id', pet.id)
    .order('applied_date', { ascending: false })

  const publicUrl = `${(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/p/${pet.slug}`
  const showWelcome = params['bem-vindo'] === '1'

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
        {showWelcome && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-fern-soft bg-fern-soft/50 px-4 py-3.5">
            <PartyPopper size={20} className="mt-0.5 shrink-0 text-fern" />
            <p className="text-sm font-medium text-fern">
              Tudo pronto! A identificação de {pet.name} já está ativa. Você pode continuar ajustando os dados quando quiser.
            </p>
          </div>
        )}

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

        <div className="mb-6">
          <LostToggle petName={pet.name} isLost={pet.is_lost} />
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Dados e contato</CardTitle>
              <CardDescription>O que aparece para quem encontrar {pet.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              <EditProfileForm pet={pet} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotos</CardTitle>
              <CardDescription>Ajudam a confirmar que é mesmo o seu pet.</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotosManager photos={photos} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vacinas</CardTitle>
              <CardDescription>Histórico de vacinação do seu pet.</CardDescription>
            </CardHeader>
            <CardContent>
              <VaccinesManager vaccines={vaccines ?? []} />
            </CardContent>
          </Card>

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
      </div>
    </main>
  )
}
