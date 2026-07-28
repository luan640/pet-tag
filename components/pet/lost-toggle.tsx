'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { setLostStatus } from '@/actions/pets'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

export function LostToggle({ petName, isLost }: { petName: string; isLost: boolean }) {
  const { success: showSuccess, error: showError } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await setLostStatus(!isLost)
    setLoading(false)

    if (!result.success) {
      showError('Não foi possível atualizar.', result.error)
      return
    }
    showSuccess(isLost ? `${petName} foi marcado como encontrado.` : `${petName} foi marcado como perdido.`)
  }

  if (isLost) {
    return (
      <div className="flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-700">{petName} está marcado como perdido</p>
            <p className="text-sm text-red-600/80">
              A página pública está exibindo um aviso de destaque pedindo contato.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleToggle} disabled={loading} className="shrink-0">
          {loading ? 'Atualizando...' : 'Marcar como encontrado'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-ink">{petName} está com você?</p>
        <p className="text-sm text-ink-soft">Se sumiu, ative o alerta para destacar a página pública.</p>
      </div>
      <Button variant="danger" onClick={handleToggle} disabled={loading} className="shrink-0">
        <AlertTriangle size={16} />
        {loading ? 'Atualizando...' : 'Marcar como perdido'}
      </Button>
    </div>
  )
}
