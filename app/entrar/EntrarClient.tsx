'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { signIn } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/brand/logo'

export function EntrarClient() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const resetSuccess = searchParams.get('reset') === 'success'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn(new FormData(event.currentTarget))

    if (result && !result.success) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <p className="text-sm text-ink-soft">
            Entre para configurar ou editar a identificação do seu pet.
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_2px_10px_rgba(54,39,24,.06)]">
          {resetSuccess && (
            <p className="mb-4 rounded-xl border border-fern-soft bg-fern-soft/60 px-3 py-2 text-sm font-medium text-fern">
              Senha atualizada com sucesso. Entre com a nova senha.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Login (e-mail)</Label>
              <Input id="email" name="email" type="email" required placeholder="seu@email.com" icon={<Mail size={15} />} autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" icon={<Lock size={15} />} />
            </div>

            <div className="-mt-1 text-right">
              <Link href="/esqueci-senha" className="text-sm font-semibold text-clay hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading}>
              {loading ? 'Entrando...' : <><span>Entrar</span><ArrowRight size={16} /></>}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Recebeu a coleira com uma tag PetTag? O login e a senha vieram junto na entrega.
        </p>
      </div>
    </main>
  )
}
