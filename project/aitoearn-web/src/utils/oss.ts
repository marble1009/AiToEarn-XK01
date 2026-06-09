// 获取完整的OSS URL
export function getOssUrl(path?: string) {
  if (!path)
    return ''
  
  let url = path
  // Remove absolute IP prefixes to make them relative, avoiding Mixed Content issues on HTTPS
  if (url.startsWith('http://124.221.103.86/')) {
    url = url.replace('http://124.221.103.86/', '/')
  } else if (url.startsWith('https://124.221.103.86/')) {
    url = url.replace('https://124.221.103.86/', '/')
  } else if (url.startsWith('http://124.221.103.86:9010/aitoearn/')) {
    url = url.replace('http://124.221.103.86:9010/aitoearn/', '/oss/')
  } else if (url.startsWith('https://124.221.103.86:9010/aitoearn/')) {
    url = url.replace('https://124.221.103.86:9010/aitoearn/', '/oss/')
  }

  // If it's already a relative path to our proxy
  if (url.startsWith('/oss/'))
    return url

  if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:http') || url.startsWith('data:')) {
    // If it's a secure/external absolute URL
    // If it's http and matches our current window domain, upgrade to https to prevent mixed content
    if (typeof window !== 'undefined') {
      const origin = window.location.origin
      if (url.startsWith(origin.replace('https:', 'http:'))) {
        return url.replace('http:', 'https:')
      }
    }
    return url
  }
  
  const isProd = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_EVN === 'prod'
  if (isProd) {
    return `/oss/${url.replace(/^\/+/, '')}`
  }
  return `http://127.0.0.1:9000/aitoearn/${url.replace(/^\/+/, '')}`
}


