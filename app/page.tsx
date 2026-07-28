import Link from 'next/link'
import { PawPrint, Smartphone, Phone, ArrowRight, LogIn } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    icon: Smartphone,
    title: 'Aproxime o celular',
    description: 'A tag na coleira abre a página do pet na hora, sem precisar instalar nada.',
  },
  {
    icon: PawPrint,
    title: 'Veja quem é o pet',
    description: 'Fotos, idade, raça e vacinas em dia — tudo num só lugar, feito pelo tutor.',
  },
  {
    icon: Phone,
    title: 'Fale com o tutor',
    description: 'Um toque liga ou chama no WhatsApp. Sem trocar mensagem com estranhos, sem burocracia.',
  },
]

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <header className="mx-auto w-full max-w-md px-5 py-5">
        <Logo />
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16 pt-4">
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-clay-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-clay">
          <PawPrint size={13} /> Identificação inteligente
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight text-ink">
          Se o seu pet se perder, quem encontrar já sabe pra onde ligar.
        </h1>
        <p className="mt-3 text-[.95rem] leading-relaxed text-ink-soft">
          Uma tag NFC na coleira leva direto a uma página com fotos, vacinas e o telefone do tutor —
          sem app, sem cadastro para quem encontrar.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {STEPS.map((step) => (
            <div key={step.title} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fern-soft text-fern">
                <step.icon size={18} />
              </span>
              <div>
                <p className="font-display text-base font-bold text-ink">{step.title}</p>
                <p className="text-sm text-ink-soft">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/entrar">
            <Button variant="cta" size="lg" fullWidth>
              <LogIn size={16} />
              Entrar na minha conta
              <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="text-center text-xs text-ink-faint">
            Recebeu uma tag PetTag? O login e a senha vieram junto na entrega.
          </p>
        </div>
      </div>
    </main>
  )
}
