'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'

interface PageParams {
  params: Promise<{ lng: string }>
}

export default function HomePage({ params }: PageParams) {
  const router = useRouter()
  const token = useUserStore(state => state.token)
  const userInfo = useUserStore(state => state.userInfo)
  const _hasHydrated = useUserStore(state => state._hasHydrated)

  useEffect(() => {
    if (!_hasHydrated) return

    if (!token) {
      router.replace('/login')
      return
    }

    const userId = userInfo?.id || userInfo?._id
    if (userId) {
      const handleRedirect = (lng: string) => {
        router.replace(`/${lng}/${userId}`)
      }

      if (params && typeof (params as any).then === 'function') {
        (params as any).then((p: any) => {
          handleRedirect(p.lng)
        })
      } else {
        const p = params as any
        if (p && p.lng) {
          handleRedirect(p.lng)
        }
      }
    }
  }, [_hasHydrated, token, userInfo, router, params])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
