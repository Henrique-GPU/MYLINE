'use client'

import { useEffect, useRef } from 'react'

interface Props {
  marketCloseTime: number // timestamp em ms
  championshipName: string
}

export function MarketNotifier({ marketCloseTime, championshipName }: Props) {
  const notified60 = useRef(false)
  const notified15 = useRef(false)
  const notified5  = useRef(false)

  useEffect(() => {
    if (!('Notification' in window)) return

    // Pede permissão silenciosamente
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const interval = setInterval(() => {
      const diff = marketCloseTime - Date.now()
      const mins = Math.floor(diff / 60000)

      if (Notification.permission !== 'granted') return

      if (mins === 60 && !notified60.current) {
        notified60.current = true
        new Notification('⏳ MyLine CS2 — 1 hora', {
          body: `O mercado do ${championshipName} fecha em 1 hora. Ajuste sua lineup!`,
          icon: '/favicon.ico',
          tag: 'market-60',
        })
      }
      if (mins === 15 && !notified15.current) {
        notified15.current = true
        new Notification('⚠️ MyLine CS2 — 15 minutos!', {
          body: `Mercado fechando em 15 minutos! Confirme sua lineup do ${championshipName}.`,
          icon: '/favicon.ico',
          tag: 'market-15',
        })
      }
      if (mins === 5 && !notified5.current) {
        notified5.current = true
        new Notification('🚨 MyLine CS2 — 5 MINUTOS!', {
          body: `URGENTE: Mercado fecha em 5 minutos! ${championshipName}`,
          icon: '/favicon.ico',
          tag: 'market-5',
        })
      }
      if (diff <= 0) clearInterval(interval)
    }, 30000) // verifica a cada 30s

    return () => clearInterval(interval)
  }, [marketCloseTime, championshipName])

  return null // componente invisível
}
