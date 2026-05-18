import { NextResponse, type NextRequest } from 'next/server'
import { mainEntities } from './middleware-alias-entities'

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  requestHeaders.set(
    'x-grid-tab-id', request.nextUrl.searchParams.get('filter_id') || '',
  )
  requestHeaders.set(
    'x-record-tab-id', request.nextUrl.searchParams.get('tab') || '',
  )

  // This is where we change the alias entity to a main entity.
  const [, , entity] = request.nextUrl.pathname.split('/')

  let mainEntity = entity || ''
  if (entity && mainEntities[entity]) {
    mainEntity = mainEntities[entity] || entity
  }
  requestHeaders.set('x-main-entity', mainEntity)

  requestHeaders.set(
    'x-categories', request.nextUrl.searchParams.get('categories') || '',
  )
  requestHeaders.set(
    'x-full-search-query-params', request.nextUrl.searchParams.toString(),
  )

  // x-full-pathname is the full pathname of the request with query params.
  requestHeaders.set(
    'x-full-pathname', request.nextUrl.pathname + request.nextUrl.search,
  )

  requestHeaders.set(
    'x-record-current-tab',
    request.nextUrl.searchParams.get('current_tab') || '',
  )

  const token = request.cookies.get('token')
  if (
    !token
    && !request.nextUrl.pathname.startsWith('/setup')
    && !request.nextUrl.pathname.startsWith('/login')
    && !request.nextUrl.pathname.startsWith('/auth')
    && !request.nextUrl.pathname.startsWith('/api')
    && !request.nextUrl.pathname.startsWith('/sign-up')
    && !request.nextUrl.pathname.startsWith('/invite')
    && !request.nextUrl.pathname.startsWith('/expired-link')
    && !request.nextUrl.pathname.startsWith('/forgot-password')
    && !request.nextUrl.pathname.startsWith('/reset-password')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
