'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { reportPetLocation } from '@/actions/pets'

export function LocationReporter({ slug }: { slug: string }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        reportPetLocation(slug, latitude, longitude)
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }, [slug])

  if (!coords) return null

  return (
    <section className="mx-auto mt-5 max-w-sm rounded-3xl border border-line bg-surface p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-ink">
        <MapPin size={16} className="text-clay" />
        Sua localização
      </h2>
      <p className="mb-3 text-sm text-ink-soft">Enviada ao tutor para ajudar a encontrar o pet.</p>
      <div className="overflow-hidden rounded-2xl border border-line">
        <iframe
          title="Sua localização"
          className="h-40 w-full"
          loading="lazy"
          src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
        />
      </div>
    </section>
  )
}
