'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { sendPasswordResetEmail } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/brand/logo'

export default function EsqueciSenhaPage() {
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await sendPasswordResetEmail(new FormData(event.currentTarget))

    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setSent(true)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_2px_10px_rgba(54,39,24,.06)]">
          <h1 className="font-display text-xl font-bold text-ink mb-1">Recuperar senha</h1>

          {sent ? (
            <div className="mt-2 flex flex-col gap-4">
              <p className="rounded-xl border border-fern-soft bg-fern-soft/60 px-3 py-3 text-sm font-medium text-fern">
                Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha. Verifique também a caixa de spam.
              </p>
              <p className="text-xs text-ink-faint">
                Cadastrou o e-mail durante o primeiro acesso? Se ainda não cadastrou, peça ao administrador para gerar uma nova senha temporária.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-soft mb-5">
                Informe o e-mail que você cadastrou no seu primeiro acesso. Vamos enviar um link para criar uma nova senha.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" required placeholder="seu@email.com" icon={<Mail size={15} />} autoFocus />
                </div>

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading}>
                  {loading ? 'Enviando...' : <><span>Enviar link</span><ArrowRight size={16} /></>}
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/entrar" className="inline-flex items-center gap-2 text-sm font-semibold text-clay hover:underline">
            <ArrowLeft size={15} />
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  )
}
