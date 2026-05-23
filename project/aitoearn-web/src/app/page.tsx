import { cookies, headers } from 'next/headers'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from '@/app/i18n/settings'
import WelcomePageContent from './[lng]/(welcome)/welcome/WelcomePageContent'

acceptLanguage.languages(languages)

export default async function RootWelcomePage() {
  const cookieStore = await cookies()
  const headersList = await headers()

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

  return <WelcomePageContent lng={lng} />
}
