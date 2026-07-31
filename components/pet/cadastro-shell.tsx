import { CadastroBottomBar } from '@/components/pet/cadastro-bottom-bar'

export function CadastroShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-pub-bg">
      <div className="flex-1 px-5 pb-6 pt-8">
        <h1 className="font-display text-2xl font-bold text-pub-ink">Cadastro do pet</h1>
        <p className="mt-1 text-sm text-pub-ink-soft">Essas informações aparecerão na tag NFC pública</p>
        <div className="mt-4 border-t border-pub-line" />

        <div className="mt-6">{children}</div>
      </div>

      <CadastroBottomBar />
    </div>
  )
}
