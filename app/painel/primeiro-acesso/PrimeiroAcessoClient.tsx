'use client'

import { useState } from 'react'
import { Lock, Mail, PawPrint, ArrowRight, Heart, Phone, MapPin } from 'lucide-react'
import { completeFirstAccess } from '@/actions/account'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SexToggle } from '@/components/pet/sex-toggle'
import { PhotoPicker } from '@/components/pet/photo-picker'
import { Logo } from '@/components/brand/logo'
import type { Pet } from '@/lib/types'

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay text-sm font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <p className="text-sm text-ink-soft">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

export function PrimeiroAcessoClient({ pet, suggestEmail }: { pet: Pet; suggestEmail: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await completeFirstAccess(new FormData(event.currentTarget))

    if (result && !result.success) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-bg pb-16">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-xl items-center justify-center px-5 py-4">
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-xl px-5 py-8">
        <div className="mb-6 text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-clay-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-clay">
            <PawPrint size={13} /> Primeiro acesso
          </span>
          <h1 className="font-display text-2xl font-bold text-ink">Vamos configurar a identificação de {pet.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Leva menos de dois minutos. Essas informações aparecerão para quem encontrar {pet.name} e aproximar o celular da coleira.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Section step={1} title="Sua conta" description="Defina uma senha só sua e um e-mail para não perder o acesso.">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" name="password" type="password" required placeholder="Mínimo 6 caracteres" icon={<Lock size={15} />} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_password">Confirmar senha</Label>
              <Input id="confirm_password" name="confirm_password" type="password" required placeholder="Repita a senha" icon={<Lock size={15} />} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail para recuperação (recomendado)</Label>
              <Input id="email" name="email" type="email" defaultValue={suggestEmail} placeholder="seu@email.com" icon={<Mail size={15} />} />
              <p className="text-xs text-ink-faint">Sem isso, se esquecer a senha só o administrador poderá liberar um novo acesso.</p>
            </div>
          </Section>

          <Section step={2} title={`Sobre ${pet.name}`} description="O básico para identificar seu pet.">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome do pet</Label>
              <Input id="name" name="name" required defaultValue={pet.name} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="breed">Raça</Label>
                <Input id="breed" name="breed" placeholder="Ex: Vira-lata" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="birth_date">Nascimento</Label>
                <Input id="birth_date" name="birth_date" type="date" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Sexo</Label>
              <SexToggle />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">Observações</Label>
              <Textarea id="bio" name="bio" placeholder="Temperamento, alergias, remédios de uso contínuo..." />
            </div>
          </Section>

          <Section step={3} title="Contato do tutor" description="Como quem encontrar o pet pode falar com você.">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_name">Seu nome</Label>
              <Input id="owner_name" name="owner_name" icon={<Heart size={15} />} placeholder="Nome do tutor" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone (com DDD)</Label>
              <Input id="phone" name="phone" type="tel" icon={<Phone size={15} />} placeholder="(11) 91234-5678" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Bairro / cidade</Label>
              <Input id="location" name="location" icon={<MapPin size={15} />} placeholder="Ex: Jardim das Flores, São Paulo" />
            </div>
          </Section>

          <Section step={4} title="Fotos" description="Uma foto sozinho e outra com você já ajudam bastante.">
            <PhotoPicker />
          </Section>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
          )}

          <Button type="submit" variant="cta" size="lg" fullWidth disabled={loading}>
            {loading ? 'Salvando...' : <><span>Concluir cadastro</span><ArrowRight size={16} /></>}
          </Button>
        </form>
      </div>
    </main>
  )
}
