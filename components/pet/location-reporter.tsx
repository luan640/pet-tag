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
    <div className="mt-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-pub-ink">
        <MapPin size={16} className="text-clay" />
        Sua localização
      </h2>
      <p className="mb-3 text-sm text-pub-ink-soft">Enviada ao tutor para ajudar a encontrar o pet.</p>
      <div className="overflow-hidden rounded-2xl">
        <iframe
          title="Sua localização"
          className="h-40 w-full"
          loading="lazy"
          src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
        />
      </div>
    </div>
  )
}
