// Keyless, HTTPS + CORS IP geolocation with graceful fallbacks. Falls back to
// the Clearview HQ (New York) if every endpoint is blocked/offline.
const DEFAULT_LOCATION = { lat: 40.7128, lon: -74.006, city: 'New York' }
const CACHE_KEY = 'cg-geo'

const ENDPOINTS = [
  {
    url: 'https://ipapi.co/json/',
    map: (d) => ({ lat: d.latitude, lon: d.longitude, city: d.city }),
  },
  {
    url: 'https://ipwho.is/',
    map: (d) => (d.success === false ? null : { lat: d.latitude, lon: d.longitude, city: d.city }),
  },
  {
    url: 'https://get.geojs.io/v1/ip/geo.json',
    map: (d) => ({ lat: parseFloat(d.latitude), lon: parseFloat(d.longitude), city: d.city }),
  },
]

function isValid(loc) {
  return loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lon)
}

export async function fetchUserLocation() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (isValid(cached)) return cached
  } catch {
    // ignore corrupt cache
  }

  for (const endpoint of ENDPOINTS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3500)
      const res = await fetch(endpoint.url, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) continue

      const loc = endpoint.map(await res.json())
      if (isValid(loc)) {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(loc))
        } catch {
          // storage may be unavailable (private mode)
        }
        return loc
      }
    } catch {
      // try next endpoint
    }
  }

  return DEFAULT_LOCATION
}
