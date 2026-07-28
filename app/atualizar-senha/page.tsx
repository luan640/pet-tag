import { Suspense } from 'react'
import { AtualizarSenhaClient } from './AtualizarSenhaClient'

export default function AtualizarSenhaPage() {
  return (
    <Suspense fallback={null}>
      <AtualizarSenhaClient />
    </Suspense>
  )
}
