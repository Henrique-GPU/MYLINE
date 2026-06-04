import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-primary">
          MyLine
          <span className="text-foreground/40 text-sm font-normal ml-2">CS2</span>
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary-dark transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full mb-6">
            Temporada 2025
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            O Fantasy do{' '}
            <span className="text-primary">CS2</span>{' '}
            Brasileiro
          </h1>
          <p className="text-lg text-foreground/60 mb-10 max-w-xl mx-auto">
            Monte sua lineup com 100.000 Line Coins, pontue com as stats reais dos jogadores
            e dispute o ranking com a comunidade.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors text-lg"
          >
            Começar agora
          </Link>
        </div>

        {/* Modes */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          <div className="bg-surface border border-border rounded-xl p-6 text-left hover:border-primary/40 transition-colors">
            <div className="text-primary text-2xl mb-3">🏆</div>
            <h2 className="text-xl font-semibold mb-2">Fantasy Oficial</h2>
            <p className="text-foreground/60 text-sm leading-relaxed mb-4">
              Cartola CS2 — monte lineups com Line Coins, acompanhe a valorização dos jogadores
              e suba no ranking a cada rodada.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">Line Coins</span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">5 jogadores</span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">Ranking geral</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 text-left hover:border-accent/40 transition-colors">
            <div className="text-accent text-2xl mb-3">🎮</div>
            <h2 className="text-xl font-semibold mb-2">Campeonatos da Comunidade</h2>
            <p className="text-foreground/60 text-sm leading-relaxed mb-4">
              Crie ou entre em torneios amadores, registre resultados e acompanhe a tabela
              de classificação do seu campeonato.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">Sem LC</span>
              <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">BO1 / BO3 / BO5</span>
              <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">Stats por mapa</span>
            </div>
          </div>
        </div>

        {/* Scoring preview */}
        <div className="mt-16 max-w-3xl w-full bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4">
            Sistema de Pontuação
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Kill', pts: '+1.0' },
              { label: 'Assistência', pts: '+0.5' },
              { label: 'Morte', pts: '−0.4' },
              { label: 'K/D positivo', pts: '+2.0' },
              { label: 'Rating >1.20', pts: '+5.0' },
              { label: 'ADR >85', pts: '+3.0' },
              { label: 'Ace', pts: '+6.0' },
              { label: 'MVP', pts: '+5.0' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-surface-2 px-3 py-2 rounded-lg">
                <span className="text-foreground/70">{item.label}</span>
                <span className={item.pts.startsWith('−') ? 'text-red-400 font-mono font-semibold' : 'text-primary font-mono font-semibold'}>
                  {item.pts}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-foreground/30">
        MyLine CS2 &copy; 2025 — Dados via HLTV
      </footer>
    </div>
  )
}
