/**
 * Vendors login-globe planet textures into public/assets/textures (same-origin).
 * Run once so the globe never hits CDN at runtime.
 *
 *   npm run fetch-earth-textures
 */
import { copyFile, mkdir, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const textureDir = path.join(root, 'public', 'assets', 'textures')
const vendorDir = path.join(__dirname, 'vendor', 'earth-textures')

const force = process.argv.includes('--force')

const TEXTURES = [
  {
    file: 'earth_day_2048.jpg',
    label: 'Blue Marble day map',
    urls: [
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg',
    ],
    minBytes: 80_000,
  },
  {
    file: 'earth_clouds_1024.png',
    label: 'Cloud layer 1K',
    urls: [
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_clouds_1024.png',
    ],
    minBytes: 8_000,
  },
  {
    file: 'earth_clouds_2048.png',
    label: 'Cloud layer 4K',
    urls: [
      'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/fair_clouds_4k.png',
    ],
    minBytes: 40_000,
  },
  {
    file: 'earth_normal_2048.jpg',
    label: 'Normal map',
    urls: [
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_normal_2048.jpg',
    ],
    minBytes: 8_000,
  },
  {
    file: 'earth_specular_2048.jpg',
    label: 'Specular map',
    urls: [
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_specular_2048.jpg',
    ],
    minBytes: 8_000,
  },
  {
    file: 'earth_night_2048.png',
    label: 'City lights night map',
    urls: [
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_lights_2048.png',
    ],
    minBytes: 8_000,
  },
]

const FETCH_HEADERS = {
  'User-Agent': 'ClearviewGlobalRevision/1.0 (offline globe texture vendor)',
  Accept: 'image/jpeg,image/png,image/*,*/*',
}

async function fileSize(filePath) {
  try {
    const info = await stat(filePath)
    return info.size
  } catch {
    return 0
  }
}

async function downloadTo(url, to) {
  await mkdir(path.dirname(to), { recursive: true })

  if (process.platform === 'win32') {
    const escapedUrl = url.replace(/'/g, "''")
    const escapedTo = to.replace(/'/g, "''")
    const ua = FETCH_HEADERS['User-Agent'].replace(/'/g, "''")
    const result = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '${escapedUrl}' -OutFile '${escapedTo}' -UseBasicParsing -UserAgent '${ua}' -MaximumRedirection 5`,
      ],
      { stdio: 'inherit' },
    )
    if (result.status === 0 && (await fileSize(to)) > 0) return
    if (result.status !== 0) {
      throw new Error(`PowerShell download failed (exit ${result.status ?? 'unknown'})`)
    }
  }

  const res = await fetch(url, { redirect: 'follow', headers: FETCH_HEADERS })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.body) {
    await pipeline(res.body, createWriteStream(to))
  } else {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(to, Buffer.from(await res.arrayBuffer()))
  }
}

async function ensureTexture(entry) {
  const dest = path.join(textureDir, entry.file)
  const vendor = path.join(vendorDir, entry.file)
  const existing = await fileSize(dest)
  if (!force && existing >= entry.minBytes) {
    console.log(`  OK ${entry.file} (${Math.round(existing / 1024)} KB)`)
    return
  }

  let lastError = null
  for (const url of entry.urls) {
    try {
      console.log(`  ${entry.label} → ${entry.file}`)
      await downloadTo(url, dest)
      const size = await fileSize(dest)
      if (size < entry.minBytes) throw new Error(`Download too small (${size} bytes)`)
      await mkdir(vendorDir, { recursive: true })
      await copyFile(dest, vendor)
      console.log(`    saved ${Math.round(size / 1024)} KB`)
      return
    } catch (err) {
      lastError = err
      console.warn(`    failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `${entry.file}: ${lastError.message}`
      : `All sources failed for ${entry.file}`,
  )
}

async function main() {
  console.log('Vendoring login globe textures to public/assets/textures …')
  await mkdir(textureDir, { recursive: true })
  for (const entry of TEXTURES) {
    await ensureTexture(entry)
  }
  console.log('Earth textures ready (same-origin).')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
