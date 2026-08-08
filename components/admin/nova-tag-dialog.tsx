'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, PawPrint, KeyRound } from 'lucide-react'
import { createPetTag } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toaster'
import { CopyField } from '@/components/admin/copy-field'
import type { NewTagCredentials } from '@/lib/types'

export function NovaTagDialog() {
  const router = useRouter()
  const { error: showError } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<NewTagCredentials | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await createPetTag(new FormData(event.currentTarget))

    setLoading(false)
    if (!result.success) {
      setError(result.error)
      showError('Não foi possível criar a tag.', result.error)
      return
    }

    setCredentials(result.data)
  }

  function handleClose(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setCredentials(null)
      setError('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="cta" size="lg">
          <Plus size={18} />
          Nova tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!credentials ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PawPrint size={20} className="text-clay" />
                Nova identificação
              </DialogTitle>
              <DialogDescription>
                Crie o link público e a conta de acesso do tutor. Depois é só gravar o link na tag NFC.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pet_name">Nome do pet</Label>
                <Input id="pet_name" name="pet_name" required placeholder="Ex: Rex" autoFocus />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="owner_email">E-mail do tutor (opcional)</Label>
                <Input id="owner_email" name="owner_email" type="email" placeholder="Se souber, informe aqui" />
                <p className="text-xs text-ink-faint">
                  Se não souber ainda, deixe em branco — geramos um login temporário e o tutor cadastra o e-mail dele no primeiro acesso.
                </p>
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading}>
                {loading ? 'Gerando...' : 'Gerar tag'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound size={20} className="text-clay" />
                Tag de {credentials.petName} criada
              </DialogTitle>
              <DialogDescription>
                Anote ou copie estas informações agora — a senha não será exibida novamente. Se precisar depois, dá
                para gerar uma nova senha a qualquer momento na lista de tags. Entregue junto com a tag.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <CopyField label="Link público (grave na tag NFC)" value={credentials.publicUrl} />
              {credentials.reusedExistingAccount ? (
                <p className="rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-ink-soft">
                  Vinculado à conta existente: <span className="font-mono text-ink">{credentials.login}</span> — a senha
                  atual do tutor continua valendo.
                </p>
              ) : (
                <>
                  <CopyField label="Login do tutor" value={credentials.login} />
                  <CopyField label="Senha temporária" value={credentials.tempPassword ?? ''} />
                </>
              )}
            </div>

            {credentials.emailSent ? (
              <p className="mt-3 text-sm font-medium text-fern">
                ✓ Enviamos essas credenciais por e-mail para {credentials.login}.
              </p>
            ) : (
              <p className="mt-3 text-xs text-ink-faint">
                Credenciais não enviadas por e-mail (sem e-mail do tutor, ou o Resend ainda está em modo de teste) —
                entregue anotado.
              </p>
            )}

            <Button variant="primary" size="lg" fullWidth className="mt-5" onClick={() => handleClose(false)}>
              Concluído, já anotei
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
