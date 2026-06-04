'use client'

import { useState } from 'react'

interface Props {
  logoUrl: string | null
  teamName: string
  abbr: string
  brandColor: string
  size?: number
}

export function TeamLogo({ logoUrl, teamName, abbr, brandColor, size = 44 }: Props) {
  const [err, setErr] = useState(false)

  if (logoUrl && !err) {
    return (
      <img
        src={logoUrl}
        alt={teamName}
        width={size - 8}
        height={size - 8}
        style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
        onError={() => setErr(true)}
      />
    )
  }

  return (
    <span style={{
      fontSize: abbr.length > 3 ? 9 : abbr.length > 2 ? 10 : 12,
      fontWeight: 900,
      color: brandColor,
      fontFamily: 'var(--font-condensed)',
      letterSpacing: '.04em',
      textAlign: 'center',
      lineHeight: 1,
    }}>
      {abbr}
    </span>
  )
}
