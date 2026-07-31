import { MapPin } from 'lucide-react'

export function LastSeenMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="mt-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-pub-ink">
        <MapPin size={16} className="text-clay" />
        Última localização
      </h2>
      <p className="mb-3 text-sm text-pub-ink-soft">Registrada na última vez que alguém abriu esta página pela tag.</p>
      <div className="overflow-hidden rounded-2xl">
        <iframe
          title="Última localização"
          className="h-40 w-full"
          loading="lazy"
          src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        />
      </div>
    </div>
  )
}
