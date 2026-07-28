import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const OWNER_PREFIX = '/painel'
const ADMIN_PREFIX = '/admin'
const EXCLUDED_PREFIXES = ['/auth', '/api', '/_next', '/favicon', '/static', '/p']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next()
  type ResponseCookieOptions = Parameters<typeof response.cookies.set>[2]
  type CookieToSet = { name: string; value: string; options?: ResponseCookieOptions }

  if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return response

  const needsAuth = pathname.startsWith(OWNER_PREFIX) || pathname.startsWith(ADMIN_PREFIX)
  if (!needsAuth) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/entrar', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/entrar', request.url))
  }

  if (pathname.startsWith(ADMIN_PREFIX) && profile.role !== 'admin') {
    return NextResponse.redirect(new URL(OWNER_PREFIX, request.url))
  }

  if (pathname.startsWith(OWNER_PREFIX) && profile.role !== 'owner') {
    return NextResponse.redirect(new URL(ADMIN_PREFIX, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
