'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ImageIcon } from 'lucide-react'
import { uploadPetPhoto, deletePetPhoto } from '@/actions/pets'
import { useToast } from '@/components/ui/toaster'
import { MAX_PET_PHOTOS } from '@/lib/constants'
import type { PetPhoto } from '@/lib/types'

export function PhotosManager({ petId, photos }: { petId: string; photos: PetPhoto[] }) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleFileChange(index: number, file: File | undefined) {
    if (!file) return
    setUploadingIndex(index)

    const formData = new FormData()
    formData.set('photo', file)
    const result = await uploadPetPhoto(petId, formData)

    setUploadingIndex(null)
    if (!result.success) {
      showError('Não foi possível enviar a foto.', result.error)
      return
    }
    showSuccess('Foto adicionada!')
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
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: MAX_PET_PHOTOS }).map((_, index) => {
        const photo = photos[index]

        return (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-pub-line bg-pub-line/40"
          >
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={pending && deletingId === photo.id}
                  className="absolute right-1 top-1 rounded-full bg-pub-ink/70 p-1 text-white disabled:opacity-70"
                  aria-label="Remover foto"
                >
                  <Trash2 size={12} />
                </button>
              </>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 px-1 text-center">
                <ImageIcon size={20} className="text-pub-ink-faint" />
                <span className="text-xs font-semibold text-pub-ink-soft">Foto {index + 1}</span>
                <span className="text-[11px] text-pub-ink-faint">
                  or <span className="underline">browse files</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingIndex !== null}
                  onChange={(event) => handleFileChange(index, event.target.files?.[0])}
                />
              </label>
            )}
          </div>
        )
      })}
    </div>
  )
}
