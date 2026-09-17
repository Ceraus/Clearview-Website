import { SERVICES_DATA } from '../data/siteData'

const STATIC_ASSETS = [
  '/assets/clearviewglobal-facade-blueprint.webp',
  '/assets/clearview-login-logo.png',
  '/assets/clearviewlogo.svg',
  '/assets/clearview-header-logo.png',
  '/assets/Logo.svg',
  '/assets/Our Company.svg',
  '/assets/Contact Us.svg',
]

export function getCriticalAssetUrls() {
  return [
    '/assets/clearviewlogo.svg',
    '/assets/clearview-earth-logo.png',
    '/assets/clearview-earth-logo-textonly.png',
    '/assets/clearviewglobal-facade-blueprint.webp',
  ]
}

export function getSiteAssetUrls() {
  const urls = new Set([
    ...STATIC_ASSETS,
    ...SERVICES_DATA.flatMap((s) => [s.imagePath, s.iconPath]),
  ])
  return [...urls].filter(Boolean)
}

export function getDeferredAssetUrls() {
  const critical = new Set(getCriticalAssetUrls())
  return getSiteAssetUrls().filter((url) => !critical.has(url))
}

export function preloadImages(urls, onProgress) {
  let loaded = 0
  const total = urls.length

  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image()
          const finish = () => {
            loaded += 1
            if (onProgress) onProgress(loaded / total)
            resolve()
          }
          img.onload = finish
          img.onerror = finish
          img.src = url
        }),
    ),
  )
}
