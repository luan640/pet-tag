import Link from 'next/link'
import type { Metadata } from 'next'
import { PawPrint, Phone, MessageCircle, MapPin, Heart, Syringe, LogIn, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPetPhotoPublicUrl } from '@/lib/supabase/storage'
import { calculateAgeLabel, formatDateShort, normalizePhoneForLink } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TagCard } from '@/components/pet/tag-card'
import { PhotoCarousel } from '@/components/pet/photo-carousel'
import { LocationReporter } from '@/components/pet/location-reporter'

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

function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-sm items-center justify-between px-5 py-3.5">
        <Logo />
        <Link href="/entrar">
          <Button variant="outline" size="sm">
            <LogIn size={14} />
            Entrar
          </Button>
        </Link>
      </div>
    </header>
  )
}

export default async function PetPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getPet(slug)

  if (!result) {
    return (
      <main className="flex min-h-dvh flex-col bg-bg">
        <TopBar />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-clay-soft text-clay">
            <PawPrint size={28} />
          </span>
          <h1 className="font-display text-xl font-bold text-ink">Identificação não encontrada</h1>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Esse link não corresponde a nenhuma tag ativa. Confira se o endereço está correto.
          </p>
        </div>
      </main>
    )
  }

  const { pet, photos, vaccines } = result

  if (!pet.is_configured) {
    return (
      <main className="flex min-h-dvh flex-col bg-bg">
        <TopBar />
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10">
          <TagCard>
            <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-bg-warm px-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brass-soft text-brass">
                <PawPrint size={30} />
              </span>
              <h1 className="font-display text-xl font-bold text-ink">Quase pronta!</h1>
              <p className="text-sm text-ink-soft">
                O tutor deste pet ainda está configurando essa identificação. Volte em breve.
              </p>
            </div>
          </TagCard>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line bg-surface p-4 text-center">
            <p className="text-sm text-ink-soft">É você quem cuida desse pet?</p>
            <Link href="/entrar" className="mt-3 inline-block">
              <Button variant="cta">
                <LogIn size={15} />
                Entrar e configurar
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const ageLabel = calculateAgeLabel(pet.birth_date)
  const whatsappLink = pet.phone ? `https://wa.me/${normalizePhoneForLink(pet.phone)}` : null
  const telLink = pet.phone ? `tel:${pet.phone.replace(/[^\d+]/g, '')}` : null

  const lostMessage = `Olá! Encontrei o(a) ${pet.name}`
  const lostWhatsappLink = pet.phone
    ? `https://wa.me/${normalizePhoneForLink(pet.phone)}?text=${encodeURIComponent(lostMessage)}`
    : null

  return (
    <main className="flex min-h-dvh flex-col bg-bg pb-14">
      <TopBar />

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

      <div className="px-5 py-8">
        <TagCard>
          {photos.length > 0 ? (
            <PhotoCarousel photos={photos} petName={pet.name} />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-bg-warm">
              <PawPrint size={48} className="text-brass/60" />
            </div>
          )}

          <div className="px-5 pb-6 pt-4">
            <h1 className="font-display text-2xl font-bold text-ink">{pet.name}</h1>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {ageLabel && <Badge>{ageLabel}</Badge>}
              {pet.breed && <Badge variant="neutral">{pet.breed}</Badge>}
              {pet.sex && <Badge variant="neutral">{pet.sex === 'macho' ? 'Macho' : 'Fêmea'}</Badge>}
            </div>

            {pet.birth_date && (
              <p className="mt-2 text-sm text-ink-soft">
                Nasceu em {formatDateShort(pet.birth_date)}
                {ageLabel && ` · ${ageLabel}`}
              </p>
            )}

            {pet.allergies && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Alergias:</span> {pet.allergies}
                </p>
              </div>
            )}

            {pet.bio && <p className="mt-4 text-sm leading-relaxed text-ink-soft">{pet.bio}</p>}
          </div>
        </TagCard>

        {vaccines.length > 0 && (
          <section className="mx-auto mt-5 max-w-sm rounded-3xl border border-line bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink">
              <Syringe size={16} className="text-fern" />
              Vacinas em dia
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {vaccines.map((vaccine) => (
                <Badge key={vaccine.id} variant="success">
                  {vaccine.name}
                  {vaccine.applied_date ? ` · ${formatDateShort(vaccine.applied_date)}` : ''}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto mt-5 max-w-sm rounded-3xl border border-line bg-surface p-5">
          <h2 className="mb-1 font-display text-base font-bold text-ink">Encontrou {pet.name}?</h2>
          <p className="mb-4 text-sm text-ink-soft">Entre em contato com o tutor, ele está te esperando.</p>

          <div className="flex flex-col gap-1.5 text-sm text-ink-soft">
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
        </section>

        <LocationReporter slug={pet.slug} />

        <p className="mx-auto mt-6 max-w-sm text-center text-xs text-ink-faint">
          Identificação digital via PetTag · aproxime o celular na coleira para ver esta página
        </p>
      </div>
    </main>
  )
}
