'use client'

import { useEffect, useState } from 'react'
import { Camera } from 'lucide-react'

export function SinglePhotoPicker({ name = 'photo' }: { name?: string }) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (preview) URL.revokeObjectURL(preview)
    const file = event.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  return (
    <label
      htmlFor={name}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-bg px-4 py-3 transition-colors hover:border-clay/50"
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Prévia" className="h-12 w-12 rounded-lg object-cover" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-clay-soft text-clay">
          <Camera size={18} />
        </span>
      )}
      <span className="text-sm font-semibold text-ink">{preview ? 'Trocar foto' : 'Escolher foto'}</span>
      <input id={name} name={name} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </label>
  )
}
