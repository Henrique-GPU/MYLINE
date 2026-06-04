import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('myline-token')
  const { pathname } = request.nextUrl

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/fantasy/:path*',
    '/comunidade/:path*',
    '/times/:path*',
    '/jogadores/:path*',
    '/perfil/:path*',
    '/ligas/:path*',
  ],
}
