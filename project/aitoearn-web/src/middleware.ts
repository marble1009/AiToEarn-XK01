import type { NextRequest } from 'next/server'
import acceptLanguage from 'accept-language'
import { NextResponse } from 'next/server'
import { cookieName, fallbackLng, languages } from '@/app/i18n/settings'
import { ProxyUrls } from '@/constant'

acceptLanguage.languages(languages)

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'],
}

export function middleware(req: NextRequest) {
  if (ProxyUrls.find(v => req.nextUrl.pathname.includes(v!))) {
    return NextResponse.next()
  }
  if (
    [
      '/robots.txt',
      '/sitemap.xml',
      '/sitemap',
      '/healthz',
      '/js/xhs_sign_init.js',
      '/js/xhs_web_sign.js',
      '/js/xhs_sign_core.js',
      '/js/xhs_sign_inject.js',
      '/shortLink',
    ].find(v => req.nextUrl.pathname.includes(v!))
  ) {
    return NextResponse.next()
  }
  if (/^\/sitemap-\d+\.xml$/.test(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  if (req.nextUrl.pathname.includes('icon') || req.nextUrl.pathname.includes('chrome')) {
    return NextResponse.next()
  }
  let lng: string | undefined | null
  if (req.cookies.has(cookieName))
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value)
  if (!lng)
    lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng)
    lng = fallbackLng

  // Redirect if lng in path is not supported
  if (
    !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`))
    && !req.nextUrl.pathname.startsWith('/_next')
  ) {
    // 物理上根目录已拥有 page.tsx 和 login/page.tsx，直接放行，避免 client-side router 强制添加前缀
    if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/login/') {
      return NextResponse.next()
    }

    // 针对旧的 welcome，直接重定向回主页
    if (req.nextUrl.pathname === '/welcome' || req.nextUrl.pathname === '/welcome/') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url),
    )
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer') || '')
    const lngInReferer = languages.find(l => refererUrl.pathname.startsWith(`/${l}`))
    const response = NextResponse.next()
    if (lngInReferer)
      response.cookies.set(cookieName, lngInReferer)
    return response
  }
  return NextResponse.next()
}
