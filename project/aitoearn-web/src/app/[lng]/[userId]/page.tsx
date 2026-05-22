import { useTranslation } from '@/app/i18n'
import { fallbackLng, languages } from '@/lib/i18n/languageConfig'
import { getMetadata } from '@/utils/general'
import HubContent from '../hub/HubContent'

interface PageParams {
  params: Promise<{ lng: string, userId: string }>
}

export async function generateMetadata({ params }: PageParams) {
  let { lng } = await params
  if (!languages.includes(lng))
    lng = fallbackLng
  const { t } = await useTranslation(lng, 'common')

  return getMetadata(
    {
      title: t('header.draftBoxSeoTitle'),
      description: t('header.draftBoxSeoDescription'),
      keywords: t('header.draftBoxSeoKeywords'),
    },
    lng,
    '/',
  )
}

export default async function HomePage({ params }: PageParams) {
  const { lng } = await params
  return <HubContent lng={lng} />
}
