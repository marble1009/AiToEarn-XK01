import { useParams } from 'next/navigation'
import { getCookie } from 'cookies-next'
import { fallbackLng, languages, cookieName } from '@/app/i18n/settings'

export function useGetClientLng() {
  const params = useParams()
  const lng = params?.lng

  // 确保返回的语言在支持的语言列表中
  if (lng && languages.includes(lng as string)) {
    return lng as string
  }

  // 针对没有语言前缀的页面（如根 / 或独立 /login），尝试从 cookie 中匹配
  if (typeof window !== 'undefined') {
    const cookieLng = getCookie(cookieName)
    if (cookieLng && languages.includes(cookieLng as string)) {
      return cookieLng as string
    }
    // 再次从浏览器默认语言兜底
    const navLng = window.navigator.language
    if (navLng) {
      const matchLng = languages.find(l => navLng.startsWith(l))
      if (matchLng) return matchLng
    }
  }

  return fallbackLng
}
