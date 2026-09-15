import { SERVICES_DATA } from '../data/siteData'

const STATIC_ASSETS = [
  '/assets/clearviewglobal-facade-blueprint.png',
  '/assets/clearview-login-logo.png',
  '/assets/clearviewlogo.svg',
  '/assets/clearview-header-logo.png',
  '/assets/Logo.svg',
  '/assets/Our Company.svg',
  '/assets/Contact Us.svg',
]

const EARTH_TEXTURES = [
  '/assets/textures/earth_day_2048.jpg',
  '/assets/textures/earth_clouds_2048.png',
  '/assets/textures/earth_clouds_1024.png',
  '/assets/textures/earth_normal_2048.jpg',
  '/assets/textures/earth_specular_2048.jpg',
  '/assets/textures/earth_night_2048.png',
]

export function getSiteAssetUrls() {
  const urls = new Set([
    ...STATIC_ASSETS,
    ...EARTH_TEXTURES,
    ...SERVICES_DATA.flatMap((s) => [s.imagePath, s.iconPath]),
  ])
  return [...urls].filter(Boolean)
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
