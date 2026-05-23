import '@/app/var.css'
import '../globals.css'
import { Providers } from '@/app/layout/Providers'
import { cookies } from 'next/headers'
import { cookieName, fallbackLng } from '@/app/i18n/settings'

export default function RootPublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const lng = cookieStore.get(cookieName)?.value || fallbackLng

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

