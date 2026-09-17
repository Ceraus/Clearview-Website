import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const PUBLIC_ASSETS = path.join(ROOT, 'public', 'assets')
const SOURCE_ASSETS = path.join(ROOT, 'assets')

const SERVICE_STEMS = [
  'Managed IT Services',
  'Advanced Cyber Security Services',
  'Cloud Hosting & Migration Services',
  'IT Support Services and Remote Management',
  'Wi-Fi and Wiring Networks',
  'Enterprise System Integration Services',
  'Website Design and Development',
  'Audio Visual (AV) Integration',
]

const EXTRA_STILLS = ['clearviewglobal-facade-blueprint.png']

function exists(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile()
}

function candidate(dir, stem, ext) {
  return path.join(dir, `${stem}${ext}`)
}

async function meta(file) {
  const info = await sharp(file).metadata()
  return {
    file,
    width: info.width || 0,
    height: info.height || 0,
    size: fs.statSync(file).size,
  }
}

async function pickSource(stem) {
  const files = []
  for (const dir of [PUBLIC_ASSETS, SOURCE_ASSETS]) {
    for (const ext of ['.png', '.jpg', '.jpeg']) {
      const file = candidate(dir, stem, ext)
      if (exists(file)) files.push(await meta(file))
    }
  }
  if (!files.length) throw new Error(`No source for ${stem}`)
  const hiRes = files.filter((f) => f.width >= 2000)
  const pool = hiRes.length ? hiRes : files
  const targetAr = 21 / 9
  pool.sort((a, b) => {
    const arA = Math.abs(a.width / a.height - targetAr)
    const arB = Math.abs(b.width / b.height - targetAr)
    if (arA !== arB) return arA - arB
    return b.width * b.height - a.width * a.height
  })
  return pool[0]
}

async function toWebp(input, output, { maxEdge = 2560, quality = 82 } = {}) {
  const image = sharp(input, { failOn: 'none' }).rotate()
  const { width = 0, height = 0 } = await image.metadata()
  const longest = Math.max(width, height)
  const pipeline =
    longest > maxEdge
      ? image.resize({
          width: maxEdge,
          height: maxEdge,
          fit: 'inside',
          withoutEnlargement: true,
        })
      : image

  await pipeline.webp({ quality, effort: 6, smartSubsample: true }).toFile(output)
  return meta(output)
}

async function run() {
  const report = []

  for (const stem of SERVICE_STEMS) {
    const src = await pickSource(stem)
    const out = path.join(PUBLIC_ASSETS, `${stem}.webp`)
    const dest = await toWebp(src.file, out)
    report.push({
      name: stem,
      from: path.relative(ROOT, src.file),
      source: `${src.width}x${src.height} ${Math.round(src.size / 1024)}KB`,
      webp: `${dest.width}x${dest.height} ${Math.round(dest.size / 1024)}KB`,
    })
  }

  for (const fileName of EXTRA_STILLS) {
    const src = path.join(PUBLIC_ASSETS, fileName)
    if (!exists(src)) continue
    const out = path.join(PUBLIC_ASSETS, fileName.replace(/\.(png|jpe?g)$/i, '.webp'))
    const info = await meta(src)
    const dest = await toWebp(src, out, { maxEdge: 1600, quality: 88 })
    report.push({
      name: fileName,
      from: path.relative(ROOT, src),
      source: `${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`,
      webp: `${dest.width}x${dest.height} ${Math.round(dest.size / 1024)}KB`,
    })
  }

  console.table(report)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
