import React from 'react'
import HubContent from './HubContent'
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
      title: 'AiToEarn Hub - Premium AI Agent Platform',
      description: 'Discover the power of AiToEarn: Monetize, Publish, Engage, and Create with our AI content marketing agents.',
    },
    lng,
    '/hub'
  )
}

export default async function HubPage({ params }: PageParams) {
  const { lng } = await params
  return <HubContent lng={lng} />
}
