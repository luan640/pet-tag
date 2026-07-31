import Link from 'next/link'
import type { Metadata } from 'next'
import { PawPrint, Phone, MessageCircle, MapPin, Heart, Syringe, LogIn, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPetPhotoPublicUrl } from '@/lib/supabase/storage'
import { calculateAgeDetailed, formatDateShort, normalizePhoneForLink } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TagCard } from '@/components/pet/tag-card'
import { PhotoCarousel } from '@/components/pet/photo-carousel'
import { LocationReporter } from '@/components/pet/location-reporter'
import { LastSeenMap } from '@/components/pet/last-seen-map'

const SIZE_LABELS: Record<string, string> = { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' }

function speciesLabel(species: string): string {
  if (species === 'cachorro') return 'Cão'
  if (species === 'gato') return 'Gato'
  return species.charAt(0).toUpperCase() + species.slice(1)
}

function sizeWeightLabel(size: string | null, weightKg: number | null): string {
  const sizeLabel = size ? SIZE_LABELS[size] : null
  const weightLabel = weightKg ? `${weightKg}kg` : null
  if (sizeLabel && weightLabel) return `${sizeLabel} · ${weightLabel}`
  return sizeLabel ?? weightLabel ?? '—'
}

async function getPet(slug: string) {
  const supabase = await createClient()

  const { data: pet } = await supabase.from('pets').select('*').eq('slug', slug).eq('active', true).single()
  if (!pet) return null

  const { data: photosRaw } = await supabase
    .from('pet_photos')
    .select('*')
    .eq('pet_id', pet.id)
    .order('sort_order', { ascending: true })

  const photos = (photosRaw ?? []).map((photo) => ({ ...photo, url: getPetPhotoPublicUrl(photo.storage_path) }))

  const { data: vaccines } = await supabase
    .from('pet_vaccines')
    .select('*')
    .eq('pet_id', pet.id)
    .order('applied_date', { ascending: false })

  return { pet, photos, vaccines: vaccines ?? [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getPet(slug)

  if (!result || !result.pet.is_configured) {
    return { title: 'PetTag — identificação de pet' }
  }

  return {
    title: `${result.pet.name} · PetTag`,
    description: `Encontrou o ${result.pet.name}? Veja os dados de contato do tutor.`,
  }
}

function BottomBar() {
  return (
    <div className="mx-auto flex w-full max-w-sm items-center justify-between px-6 py-6">
      <Logo />
      <Link href="/entrar">
        <Button variant="outline" size="sm" className="border-pub-ink/15 text-pub-ink hover:bg-pub-ink/5">
          <LogIn size={14} />
          Entrar
        </Button>
      </Link>
    </div>
  )
}

function CharacteristicCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-pub-bg/40 px-4 py-3">
      <p className="text-xs font-medium text-pub-ink-soft">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-pub-ink">{value}</p>
    </div>
  )
}

export default async function PetPublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { src } = await searchParams
  const fromTag = src === 'tag'
  const result = await getPet(slug)

  if (!result) {
    return (
      <main className="flex min-h-dvh flex-col bg-pub-bg">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-clay-soft text-clay">
            <PawPrint size={28} />
          </span>
          <h1 className="font-display text-xl font-bold text-pub-ink">Identificação não encontrada</h1>
          <p className="mt-2 max-w-xs text-sm text-pub-ink-soft">
            Esse link não corresponde a nenhuma tag ativa. Confira se o endereço está correto.
          </p>
          <BottomBar />
        </div>
      </main>
    )
  }

  const { pet, photos, vaccines } = result

  if (!pet.is_configured) {
    return (
      <main className="flex min-h-dvh flex-col bg-pub-bg">
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10">
          <TagCard>
            <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-pub-bg/40 px-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brass-soft text-brass">
                <PawPrint size={30} />
              </span>
              <h1 className="font-display text-xl font-bold text-pub-ink">Quase pronta!</h1>
              <p className="text-sm text-pub-ink-soft">
                O tutor deste pet ainda está configurando essa identificação. Volte em breve.
              </p>
            </div>
          </TagCard>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-pub-line bg-pub-surface p-4 text-center">
            <p className="text-sm text-pub-ink-soft">É você quem cuida desse pet?</p>
            <Link href="/entrar" className="mt-3 inline-block">
              <Button variant="cta">
                <LogIn size={15} />
                Entrar e configurar
              </Button>
            </Link>
          </div>

          <BottomBar />
        </div>
      </main>
    )
  }

  const ageLabel = calculateAgeDetailed(pet.birth_date)
  const sexLabel = pet.sex ? (pet.sex === 'macho' ? 'Macho' : 'Fêmea') : '—'
  const whatsappLink = pet.phone ? `https://wa.me/${normalizePhoneForLink(pet.phone)}` : null
  const telLink = pet.phone ? `tel:${pet.phone.replace(/[^\d+]/g, '')}` : null

  const lostMessage = `Olá! Encontrei o(a) ${pet.name}`
  const lostWhatsappLink = pet.phone
    ? `https://wa.me/${normalizePhoneForLink(pet.phone)}?text=${encodeURIComponent(lostMessage)}`
    : null

  return (
    <main className="flex min-h-dvh flex-col bg-pub-bg">
      {pet.is_lost && (
        <div className="bg-red-600 px-5 py-4 text-white">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <AlertTriangle size={16} />
              {pet.name} está perdido! Se você o encontrou, entre em contato com o tutor.
            </span>

            {(pet.owner_name || pet.phone) && (
              <p className="text-sm text-white/90">
                {pet.owner_name}
                {pet.owner_name && pet.phone && ' · '}
                {pet.phone}
              </p>
            )}

            {lostWhatsappLink && (
              <a href={lostWhatsappLink} target="_blank" rel="noreferrer" className="mt-1">
                <Button size="sm" className="bg-white text-red-600 shadow-none hover:bg-white/90">
                  <MessageCircle size={15} />
                  Chamar no WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="w-full">
        {photos.length > 0 ? (
          <PhotoCarousel photos={photos} petName={pet.name} />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center bg-pub-bg">
            <PawPrint size={48} className="text-pub-ink-faint" />
          </div>
        )}
      </div>

      <div className="bg-pub-surface px-5 pb-8 pt-6">
        <div className="mx-auto max-w-sm">
          <h1 className="font-display text-2xl font-bold text-pub-ink">{pet.name}</h1>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="clay">{speciesLabel(pet.species)}</Badge>
            {pet.breed && <Badge className="bg-pub-teal-soft text-pub-teal">{pet.breed}</Badge>}
          </div>

          {pet.allergies && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">
                <span className="font-semibold">Alergias:</span> {pet.allergies}
              </p>
            </div>
          )}

          <h2 className="mb-3 mt-5 font-display text-base font-bold text-pub-ink">Características</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <CharacteristicCard label="Nascimento" value={pet.birth_date ? formatDateShort(pet.birth_date) : '—'} />
            <CharacteristicCard label="Idade" value={ageLabel ?? '—'} />
            <CharacteristicCard label="Sexo" value={sexLabel} />
            <CharacteristicCard label="Porte / Peso" value={sizeWeightLabel(pet.size, pet.weight_kg)} />
            <CharacteristicCard label="Cor da pelagem" value={pet.fur_color ?? '—'} />
            <CharacteristicCard
              label="Castrado(a)"
              value={pet.neutered === null ? '—' : pet.neutered ? 'Sim' : 'Não'}
            />
          </div>

          {pet.bio && (
            <div className="mt-6">
              <h2 className="mb-2 font-display text-base font-bold text-pub-ink">Sobre {pet.name}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-pub-ink-soft">{pet.bio}</p>
            </div>
          )}

          {vaccines.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-pub-ink">
                <Syringe size={16} className="text-pub-vaccine" />
                Registro de vacinas
              </h2>
              <div className="flex flex-col divide-y divide-pub-line">
                {vaccines.map((vaccine) => (
                  <div key={vaccine.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-pub-ink">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pub-vaccine" />
                      {vaccine.name}
                    </span>
                    {vaccine.applied_date && (
                      <span className="shrink-0 text-sm text-pub-ink-soft">{formatDateShort(vaccine.applied_date)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-1 font-display text-base font-bold text-pub-ink">Encontrou {pet.name}?</h2>
            <p className="mb-4 text-sm text-pub-ink-soft">Entre em contato com o tutor, ele está te esperando.</p>

            <div className="flex flex-col gap-1.5 text-sm text-pub-ink-soft">
              {pet.owner_name && (
                <p className="flex items-center gap-2">
                  <Heart size={14} className="shrink-0 text-clay" /> {pet.owner_name}
                </p>
              )}
              {pet.location && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="shrink-0 text-clay" /> {pet.location}
                </p>
              )}
            </div>

            {(telLink || whatsappLink) && (
              <div className="mt-4 flex flex-col gap-2">
                {telLink && (
                  <a href={telLink}>
                    <Button variant="cta" size="lg" fullWidth>
                      <Phone size={16} />
                      Ligar para o tutor
                    </Button>
                  </a>
                )}
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    <Button variant="primary" size="lg" fullWidth>
                      <MessageCircle size={16} />
                      Chamar no WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>

          {fromTag ? (
            <LocationReporter slug={pet.slug} />
          ) : (
            pet.last_seen_lat != null &&
            pet.last_seen_lng != null && <LastSeenMap lat={pet.last_seen_lat} lng={pet.last_seen_lng} />
          )}

          <p className="mt-6 text-center text-xs text-pub-ink-faint">
            Identificação digital via PetTag · aproxime o celular na coleira para ver esta página
          </p>
        </div>
      </div>

      <BottomBar />
    </main>
  )
}
