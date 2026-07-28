'use client'

import { useEffect, useState } from 'react'
import { ImagePlus } from 'lucide-react'

export function PhotoPicker({ name = 'photos' }: { name?: string }) {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url))
    const files = Array.from(event.target.files ?? [])
    setPreviews(files.map((file) => URL.createObjectURL(file)))
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={name}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-bg px-4 py-8 text-center transition-colors hover:border-clay/50"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay-soft text-clay">
          <ImagePlus size={20} />
        </span>
        <span className="text-sm font-semibold text-ink">Escolher fotos</span>
        <span className="text-xs text-ink-faint">Pode selecionar várias de uma vez — com você, sozinho, brincando</span>
        <input
          id={name}
          name={name}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((src, index) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Prévia ${index + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
