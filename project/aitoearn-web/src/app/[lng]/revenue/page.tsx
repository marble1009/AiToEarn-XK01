import React from 'react'
import RevenueContent from './components/RevenueContent'
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
      title: 'Revenue Dashboard - AiToEarn',
      description: 'Track your earnings and withdraw your funds.',
    },
    lng,
    '/revenue'
  )
}

export default async function RevenuePage({ params }: PageParams) {
  const { lng } = await params
  return <RevenueContent lng={lng} />
}
