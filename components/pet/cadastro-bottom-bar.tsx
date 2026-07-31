'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CADASTRO_FORM_ID } from '@/components/pet/cadastro-form-id'

const TABS = [
  { href: '/painel', label: 'Pet' },
  { href: '/painel/cadastro/caracteristicas', label: 'Características' },
  { href: '/painel/cadastro/vacinas', label: 'Vacinas' },
  { href: '/painel/cadastro/contato', label: 'Contato' },
  { href: '/painel/cadastro/localizacao', label: 'Localização' },
] as const

export function CadastroBottomBar() {
  const pathname = usePathname()
  const showSaveButton = pathname !== '/painel/cadastro/vacinas'
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [pathname])

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="px-5 pb-6">
      <div className="relative mb-3 rounded-full bg-white">
        <div ref={scrollRef} className="no-scrollbar flex gap-1 overflow-x-auto rounded-full p-1 px-8">
          {TABS.map((tab) => {
            const active = pathname === tab.href

            return (
              <Link
                key={tab.href}
                href={tab.href}
                ref={active ? activeRef : undefined}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-center text-sm font-semibold transition-colors',
                  active ? 'bg-clay text-white' : 'text-pub-ink-soft hover:bg-pub-ink/5',
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollBy(-140)}
          aria-label="Ver abas anteriores"
          className="absolute inset-y-0 left-0 flex items-center rounded-l-full bg-gradient-to-r from-white via-white to-transparent pr-4 pl-2"
        >
          <ChevronLeft size={16} className="text-pub-ink-faint" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(140)}
          aria-label="Ver mais abas"
          className="absolute inset-y-0 right-0 flex items-center rounded-r-full bg-gradient-to-l from-white via-white to-transparent pl-4 pr-2"
        >
          <ChevronRight size={16} className="text-pub-ink-faint" />
        </button>
      </div>

      {showSaveButton && (
        <Button type="submit" form={CADASTRO_FORM_ID} variant="cta" size="lg" fullWidth>
          Salvar cadastro
        </Button>
      )}
    </div>
  )
}
