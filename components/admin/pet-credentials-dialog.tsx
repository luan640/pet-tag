'use client'

import { useState } from 'react'
import { KeyRound, RefreshCw } from 'lucide-react'
import { resetPetOwnerPassword } from '@/actions/admin'
import { Button } from '@/components/ui/button'
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
import type { PetListRow, PetOwnerPasswordReset } from '@/lib/types'

export function PetCredentialsDialog({ pet, tagUrl }: { pet: PetListRow; tagUrl: string }) {
  const { error: showError } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reset, setReset] = useState<PetOwnerPasswordReset | null>(null)

  async function handleReset() {
    setLoading(true)
    const result = await resetPetOwnerPassword(pet.id)
    setLoading(false)

    if (!result.success) {
      showError('Não foi possível gerar uma nova senha.', result.error)
      return
    }
    setReset(result.data)
  }

  function handleClose(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setReset(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <KeyRound size={15} />
          Senha e link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={20} className="text-clay" />
            Acesso de {pet.name}
          </DialogTitle>
          <DialogDescription>
            O link da tag fica disponível sempre. Por segurança, a senha original não fica guardada — gere uma nova
            sempre que precisar informar ao tutor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <CopyField label="Link público (grave na tag NFC)" value={tagUrl} />
          <CopyField label="Login do tutor" value={pet.owner_email ?? ''} />

          {reset ? (
            <>
              <CopyField label="Nova senha temporária" value={reset.tempPassword} />
              <p className="text-xs text-ink-faint">
                Anote ou copie agora — ela não será exibida novamente. O tutor precisará trocá-la no próximo acesso.
              </p>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : undefined} />
              {loading ? 'Gerando...' : 'Gerar nova senha temporária'}
            </Button>
          )}
        </div>

        <Button variant="primary" size="lg" fullWidth className="mt-5" onClick={() => handleClose(false)}>
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  )
}
