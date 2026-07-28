import { PawPrint, LogOut, Search } from 'lucide-react'
import { listPets } from '@/actions/admin'
import { signOut } from '@/actions/auth'
import { Logo } from '@/components/brand/logo'
import { NovaTagDialog } from '@/components/admin/nova-tag-dialog'
import { PetRow } from '@/components/admin/pet-row'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export default async function AdminPage() {
  const pets = await listPets()
  const configuredCount = pets.filter((p) => p.is_configured).length

  return (
    <main className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Logo />
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut size={15} />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Identificações</h1>
            <p className="text-sm text-ink-soft">
              {pets.length} {pets.length === 1 ? 'tag criada' : 'tags criadas'} · {configuredCount} configuradas pelo tutor
            </p>
          </div>
          <NovaTagDialog />
        </div>

        {pets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-soft text-clay">
              <PawPrint size={26} />
            </span>
            <p className="font-display text-lg font-bold text-ink">Nenhuma tag criada ainda</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Clique em &quot;Nova tag&quot; para gerar o link e as credenciais do primeiro pet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pets.map((pet) => (
              <PetRow key={pet.id} pet={pet} publicUrl={`${appUrl()}/p/${pet.slug}`} />
            ))}
          </div>
        )}

        {pets.length > 0 && (
          <p className="mt-8 flex items-center gap-2 text-xs text-ink-faint">
            <Search size={13} />
            Dica: use o navegador (Ctrl+F) para localizar uma tag pelo nome do pet.
          </p>
        )}
      </div>
    </main>
  )
}
