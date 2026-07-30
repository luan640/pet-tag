'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { uploadPetPhoto, deletePetPhoto } from '@/actions/pets'
import { Button } from '@/components/ui/button'
import { SinglePhotoPicker } from '@/components/pet/single-photo-picker'
import { useToast } from '@/components/ui/toaster'
import type { PetPhoto } from '@/lib/types'

export function PhotosManager({ photos }: { photos: PetPhoto[] }) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const result = await uploadPetPhoto(new FormData(event.currentTarget))

    setLoading(false)
    if (!result.success) {
      showError('Não foi possível enviar a foto.', result.error)
      return
    }
    showSuccess('Foto adicionada!')
    ;(event.target as HTMLFormElement).reset()
    router.refresh()
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deletePetPhoto(id)
      setDeletingId(null)
      if (!result.success) {
        showError('Não foi possível remover a foto.', result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={pending && deletingId === photo.id}
                className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 p-1.5 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-70"
                aria-label="Remover foto"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <SinglePhotoPicker name="photo" />
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="is_with_owner" className="h-4 w-4 rounded border-line accent-clay" />
          Essa foto é com o tutor
        </label>
        <Button type="submit" variant="outline" disabled={loading}>
          {loading ? 'Enviando...' : 'Adicionar foto'}
        </Button>
      </form>
    </div>
  )
}
