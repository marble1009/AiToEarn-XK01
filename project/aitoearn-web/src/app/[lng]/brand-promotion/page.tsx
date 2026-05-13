import React from 'react'
import BrandPromotionContent from './components/BrandPromotionContent'
import { languages, fallbackLng } from '@/lib/i18n/languageConfig'
import { getMetadata } from '@/utils/general'

interface PageParams {
  params: Promise<{ lng: string }>
}

export async function generateMetadata({ params }: PageParams) {
  let { lng } = await params
  if (!languages.includes(lng)) lng = fallbackLng

  return getMetadata(
    {
      title: 'Brand Promotion - AiToEarn',
      description: 'Manage your brand promotion plans and monetize your content.',
    },
    lng,
    '/brand-promotion'
  )
}

export default async function BrandPromotionPage({ params }: PageParams) {
  const { lng } = await params
  return <BrandPromotionContent lng={lng} />
}
