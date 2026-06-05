import { Navbar } from './navbar'
import { BetaModal } from '@/components/beta-modal'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <BetaModal />
      <main style={{ paddingTop: 58 }}>{children}</main>
    </div>
  )
}
