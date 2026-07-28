'use client'

import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { changePassword, updateRecoveryEmail } from '@/actions/account'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

export function AccountSettings({ currentEmail }: { currentEmail: string }) {
  const { success: showSuccess, error: showError } = useToast()
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const isPlaceholderEmail = currentEmail.endsWith('@pet.local')

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordLoading(true)

    const result = await changePassword(new FormData(event.currentTarget))

    setPasswordLoading(false)
    if (!result.success) {
      showError('Não foi possível trocar a senha.', result.error)
      return
    }
    showSuccess('Senha atualizada!')
    ;(event.target as HTMLFormElement).reset()
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailLoading(true)

    const result = await updateRecoveryEmail(new FormData(event.currentTarget))

    setEmailLoading(false)
    if (!result.success) {
      showError('Não foi possível salvar o e-mail.', result.error)
      return
    }
    showSuccess('E-mail atualizado!')
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail de recuperação</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            icon={<Mail size={15} />}
            defaultValue={isPlaceholderEmail ? '' : currentEmail}
            placeholder="seu@email.com"
          />
          {isPlaceholderEmail && (
            <p className="text-xs text-amber-700">
              Você ainda está usando um login temporário. Cadastre seu e-mail real para não perder o acesso.
            </p>
          )}
        </div>
        <Button type="submit" variant="outline" disabled={emailLoading}>
          {emailLoading ? 'Salvando...' : 'Salvar e-mail'}
        </Button>
      </form>

      <div className="h-px bg-line" />

      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" name="password" type="password" required icon={<Lock size={15} />} placeholder="Mínimo 6 caracteres" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm_password">Confirmar nova senha</Label>
          <Input id="confirm_password" name="confirm_password" type="password" required icon={<Lock size={15} />} placeholder="Repita a senha" />
        </div>
        <Button type="submit" variant="outline" disabled={passwordLoading}>
          {passwordLoading ? 'Salvando...' : 'Trocar senha'}
        </Button>
      </form>
    </div>
  )
}
