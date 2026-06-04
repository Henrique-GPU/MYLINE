import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

const barlow = Barlow({
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-condensed',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-tech',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MyLine CS2 — Lineup & Campeonatos',
  description: 'Monte sua lineup, dispute campeonatos e acompanhe as stats do CS2 brasileiro.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${barlow.variable} ${barlowCondensed.variable} ${shareTechMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
