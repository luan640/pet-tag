'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import { completeFirstAccess } from '@/actions/account'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'

export function PrimeiroAcessoClient({ suggestEmail }: { suggestEmail: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await completeFirstAccess(new FormData(event.currentTarget))

    if (result && !result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setDone(true)
  }

  return (
    <main className="min-h-dvh bg-bg pb-16">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-xl items-center justify-center px-5 py-4">
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-xl px-5 py-8">
        {done ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-fern/30 bg-fern-soft px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fern text-white">
              <CheckCircle2 size={28} />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-ink">Senha configurada com sucesso!</p>
              <p className="mt-1 text-sm text-ink-soft">Agora escolha qual pet você quer configurar.</p>
            </div>
            <Button variant="cta" size="lg" onClick={() => router.push('/painel')}>
              <span>Configurar meus pets</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-clay-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-clay">
                <ShieldCheck size={13} /> Primeiro acesso
              </span>
              <h1 className="font-display text-2xl font-bold text-ink">Vamos garantir o acesso à sua conta</h1>
              <p className="mt-1 text-sm text-ink-soft">
                Defina uma senha só sua. Depois disso você já pode escolher qual pet quer configurar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Nova senha</Label>
                    <Input id="password" name="password" type="password" required placeholder="Mínimo 6 caracteres" icon={<Lock size={15} />} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirm_password">Confirmar senha</Label>
                    <Input id="confirm_password" name="confirm_password" type="password" required placeholder="Repita a senha" icon={<Lock size={15} />} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">E-mail para recuperação (recomendado)</Label>
                    <Input id="email" name="email" type="email" defaultValue={suggestEmail} placeholder="seu@email.com" icon={<Mail size={15} />} />
                    <p className="text-xs text-ink-faint">Sem isso, se esquecer a senha só o administrador poderá liberar um novo acesso.</p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
              )}

              <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading}>
                {loading ? 'Salvando...' : <><span>Continuar</span><ArrowRight size={16} /></>}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
