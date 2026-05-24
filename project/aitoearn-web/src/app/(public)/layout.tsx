import '@/app/var.css'
import '../globals.css'
import { Providers } from '@/app/layout/Providers'
import { cookies, headers } from 'next/headers'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from '@/app/i18n/settings'

acceptLanguage.languages(languages)

export default function RootPublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const headersList = headers()

  let lng: string | undefined | null
  if (cookieStore.has(cookieName)) {
    lng = acceptLanguage.get(cookieStore.get(cookieName)?.value)
  }
  if (!lng) {
    lng = acceptLanguage.get(headersList.get('Accept-Language'))
  }
  if (!lng) {
    lng = fallbackLng
  }

  return (
    <html lang={lng} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers lng={lng}>
          {children}
        </Providers>
      </body>
    </html>
  )
}


