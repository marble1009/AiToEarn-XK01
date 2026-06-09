/**
 * 电商智能创作工坊页面入口
 */

import dynamic from 'next/dynamic'
import { useTranslation } from '@/app/i18n'
import { fallbackLng, languages } from '@/lib/i18n/languageConfig'
import { getMetadata } from '@/utils/general'

interface PageParams {
  params: Promise<{ lng: string }>
}

export async function generateMetadata({ params }: PageParams) {
  let { lng } = await params
  if (!languages.includes(lng))
    lng = fallbackLng
  const { t } = await useTranslation(lng, 'ecommerceStudio')

  return getMetadata(
    {
      title: t('seoTitle'),
      description: t('seoDescription'),
      keywords: t('seoKeywords'),
    },
    lng,
    '/ecommerce-studio',
  )
}

const EcommerceStudioCore = dynamic(() => import('./EcommerceStudioCore'), {
  ssr: false,
})

export default function EcommerceStudioPage() {
  return <EcommerceStudioCore />
}
