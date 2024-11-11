import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  console.log('Middleware - Token:', token)
  console.log('Middleware - Path:', request.nextUrl.pathname)

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania, przekieruj go na /home
  if (token && request.nextUrl.pathname === '/') {
    console.log('Middleware - Logged in user, redirecting to /home')
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Pozwól na dostęp do wszystkich innych ścieżek
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/home', '/create/:path*', '/statistics/:path*'],
}