import { SERVICES_DATA, INDUSTRIES_DATA } from '../data/siteData'

const CDN = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets'

const STATIC_ASSETS = [
  '/assets/clearviewglobal_outside.jpg',
  '/assets/clearviewlogo.png',
  '/assets/clearviewlogo.svg',
  '/assets/clearview-header-logo.png',
  '/assets/Logo.svg',
  '/assets/Our Company.svg',
  '/assets/Industry.svg',
  '/assets/Contact Us.svg',
]

const EARTH_TEXTURES = [
  `${CDN}/earth_day_4096.jpg`,
  `${CDN}/earth_night_4096.jpg`,
  `${CDN}/earth_normal_2048.jpg`,
  `${CDN}/earth_specular_2048.jpg`,
  '/assets/earth_clouds_2k.jpg',
  '/assets/earth_clouds.png',
  `${CDN}/earth_clouds_1024.png`,
]

export function getSiteAssetUrls() {
  const urls = new Set([
    ...STATIC_ASSETS,
    ...EARTH_TEXTURES,
    ...SERVICES_DATA.flatMap((s) => [s.imagePath, s.iconPath]),
    ...INDUSTRIES_DATA.map((i) => i.iconPath),
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
