import { Navbar } from './navbar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ paddingTop: 58 }}>{children}</main>
    </div>
  )
}
