'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { updatePassword } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/brand/logo'
import { createClient } from '@/lib/supabase/client'

export function AtualizarSenhaClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [verifyingLink, setVerifyingLink] = useState(true)

  useEffect(() => {
    let active = true

    async function prepareSession() {
      const supabase = createClient()
      const code = searchParams.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (!active) return
          setError('O link de redefinicao é inválido ou expirou. Solicite um novo e-mail.')
          setVerifyingLink(false)
          return
        }
        router.replace('/atualizar-senha')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return

      if (!user) {
        setError('Abra o link recebido por e-mail para redefinir sua senha.')
        setSessionReady(false)
        setVerifyingLink(false)
        return
      }

      setSessionReady(true)
      setVerifyingLink(false)
    }

    prepareSession()
    return () => { active = false }
  }, [router, searchParams])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sessionReady) return
    setLoading(true)
    setError('')

    const result = await updatePassword(new FormData(event.currentTarget))

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
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_2px_10px_rgba(54,39,24,.06)]">
          <h1 className="font-display text-xl font-bold text-ink mb-1">Nova senha</h1>
          <p className="text-sm text-ink-soft mb-5">Escolha uma nova senha para sua conta.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" name="password" type="password" required placeholder="Mínimo 6 caracteres" icon={<Lock size={15} />} disabled={!sessionReady || verifyingLink || loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_password">Confirmar senha</Label>
              <Input id="confirm_password" name="confirm_password" type="password" required placeholder="Repita a nova senha" icon={<Lock size={15} />} disabled={!sessionReady || verifyingLink || loading} />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading || verifyingLink || !sessionReady}>
              {verifyingLink ? 'Validando link...' : loading ? 'Salvando...' : <><span>Atualizar senha</span><ArrowRight size={16} /></>}
            </Button>
          </form>
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
