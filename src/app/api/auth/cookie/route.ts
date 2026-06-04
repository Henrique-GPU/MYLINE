import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { token } = await request.json() as { token: string | null }
  const cookieStore = await cookies()

  if (token) {
    cookieStore.set('myline-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  } else {
    cookieStore.delete('myline-token')
  }

  return NextResponse.json({ ok: true })
}
