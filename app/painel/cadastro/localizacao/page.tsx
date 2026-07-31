import { redirect } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PetLocationForm } from '@/components/pet/pet-location-form'
import { LostToggle } from '@/components/pet/lost-toggle'
import { Button } from '@/components/ui/button'

export default async function CadastroLocalizacaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: pet } = await supabase.from('pets').select('*').eq('owner_id', user.id).single()
  if (!pet) redirect('/entrar')

  return (
    <div className="flex flex-col gap-5">
      <PetLocationForm pet={pet} />

      <LostToggle petName={pet.name} isLost={pet.is_lost} />

      {pet.last_seen_at && pet.last_seen_lat != null && pet.last_seen_lng != null && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="mt-0.5 shrink-0 text-clay" />
            <div>
              <p className="font-semibold text-pub-ink">Última localização registrada</p>
              <p className="text-sm text-pub-ink-soft">
                {new Date(pet.last_seen_at).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                  timeZone: 'America/Sao_Paulo',
                })}
              </p>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps?q=${pet.last_seen_lat},${pet.last_seen_lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="shrink-0 border-pub-ink/15 text-pub-ink hover:bg-pub-ink/5">
              Ver mapa
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
