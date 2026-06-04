import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-foreground/50 text-sm mb-8">Escolha uma frente para começar</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link
            href="/fantasy"
            className="group bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
          >
            <div className="text-3xl mb-3">🏆</div>
            <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              Fantasy Oficial
            </h2>
            <p className="text-foreground/50 text-sm mb-4">
              Monte sua lineup com Line Coins e dispute o campeonato.
            </p>
            <div className="flex items-center gap-2 text-xs text-foreground/40">
              <span className="w-2 h-2 rounded-full bg-primary/60"></span>
              Temporada 2025
            </div>
          </Link>

          <Link
            href="/comunidade"
            className="group bg-surface border border-border rounded-xl p-6 hover:border-accent/50 transition-colors"
          >
            <div className="text-3xl mb-3">🎮</div>
            <h2 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
              Campeonatos da Comunidade
            </h2>
            <p className="text-foreground/50 text-sm mb-4">
              Crie ou entre em torneios amadores e registre seus resultados.
            </p>
            <div className="flex items-center gap-2 text-xs text-foreground/40">
              <span className="w-2 h-2 rounded-full bg-accent/60"></span>
              Crie seu torneio agora
            </div>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground/40 uppercase tracking-wider mb-4">
            Suas Stats
          </h3>
          <p className="text-foreground/30 text-sm">
            Participe de um campeonato para ver suas estatísticas aqui.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
