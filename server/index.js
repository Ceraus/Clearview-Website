import path from 'node:path'
import { fileURLToPath } from 'node:url'
import compression from 'compression'
import dotenv from 'dotenv'
import express from 'express'
import nodemailer from 'nodemailer'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })

const isProd = process.env.NODE_ENV === 'production'
const API_PORT = Number(process.env.API_PORT || process.env.PORT || 8787)
const API_HOST = process.env.API_HOST || (isProd ? '0.0.0.0' : '127.0.0.1')
const distDir = path.join(rootDir, 'dist')

const SEAT_VALUES = new Set(['1-5', '6-15', '16-50', '50+'])
const URGENCY_VALUES = new Set(['this-week', 'this-month', 'planning'])
const URGENCY_LABELS = {
  'this-week': 'This week',
  'this-month': 'This month',
  planning: 'Planning ahead',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 8
const rateHits = new Map()
const COMPRESSIBLE_TYPES = new Set([
  'application/javascript',
  'application/json',
  'image/svg+xml',
  'image/webp',
  'text/css',
  'text/html',
  'text/javascript',
])
const HASHED_ASSET_RE = /[/\\]assets[/\\][^/\\]+-[A-Za-z0-9_-]{8,}\.(?:js|css|mjs)$/i

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) return false
  const raw = res.getHeader('Content-Type')
  if (!raw) return false
  const type = String(Array.isArray(raw) ? raw[0] : raw).split(';')[0].trim().toLowerCase()
  return COMPRESSIBLE_TYPES.has(type)
}

function setStaticHeaders(res, filePath) {
  if (HASHED_ASSET_RE.test(filePath)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    return
  }
  if (filePath.toLowerCase().endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache')
  }
}

function splitEmails(value) {
  if (!value || typeof value !== 'string') return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function isEmail(value) {
  return EMAIL_RE.test(value)
}

function logError(message) {
  console.error(message)
}

function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

function rateLimit(req, res, next) {
  const ip = clientIp(req)
  const now = Date.now()
  let rec = rateHits.get(ip)
  if (!rec || now - rec.start > RATE_WINDOW_MS) {
    rec = { start: now, count: 0 }
  }
  rec.count += 1
  rateHits.set(ip, rec)
  if (rec.count > RATE_MAX) {
    res.status(429).json({ success: false, error: 'too-many' })
    return
  }
  next()
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, rec] of rateHits) {
    if (now - rec.start > RATE_WINDOW_MS) rateHits.delete(ip)
  }
}, RATE_WINDOW_MS).unref()

function mailConfig() {
  const host = (process.env.SMTP_HOST || '').trim()
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() !== 'false'
  const user = (process.env.SMTP_USER || '').trim()
  const pass = process.env.SMTP_PASS || ''
  const from = (process.env.MAIL_FROM || user).trim()
  const to = splitEmails(process.env.MAIL_TO)
  const cc = splitEmails(process.env.MAIL_CC)
  const bcc = splitEmails(process.env.MAIL_BCC)

  const ready = Boolean(host && user && pass && from && to.length && to.every(isEmail) && cc.every(isEmail) && bcc.every(isEmail))

  return { host, port, secure, user, pass, from, to, cc, bcc, ready }
}

function validateInquiry(body) {
  const errors = {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const company = typeof body.company === 'string' ? body.company.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const service = typeof body.service === 'string' ? body.service.trim() : ''
  const seats = typeof body.seats === 'string' ? body.seats.trim() : ''
  const urgency = typeof body.urgency === 'string' ? body.urgency.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name || name.length < 2) errors.name = true
  if (name.length > 120) errors.name = true
  if (!company) errors.company = true
  if (company.length > 160) errors.company = true
  if (!email) errors.email = true
  else if (!isEmail(email) || email.length > 254) errors.email = true
  if (phone) {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15 || phone.length > 40) errors.phone = true
  }
  if (!service || service.length > 120) errors.service = true
  if (!seats || !SEAT_VALUES.has(seats)) errors.seats = true
  if (!urgency || !URGENCY_VALUES.has(urgency)) errors.urgency = true
  if (message && message.length < 8) errors.message = true
  if (message.length > 4000) errors.message = true

  return {
    errors,
    values: { name, company, email, phone, service, seats, urgency, message },
  }
}

function isHoneypot(body) {
  const website = typeof body.website === 'string' ? body.website.trim() : ''
  const botcheck = body.botcheck
  return Boolean(website) || botcheck === true || botcheck === 'true' || botcheck === 'on' || botcheck === '1'
}

function buildMail(values) {
  const urgencyLabel = URGENCY_LABELS[values.urgency] || values.urgency
  const subject = `Le Parc tenant inquiry — ${values.company}`.replace(/[\r\n]+/g, ' ')
  const text = [
    'Clearview Global — Le Parc / 287 Park Avenue South tenant inquiry',
    '',
    `Name: ${values.name}`,
    `Company / suite or workspace: ${values.company}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone || '—'}`,
    `Service interest: ${values.service}`,
    `Seats / headcount: ${values.seats}`,
    `Urgency: ${urgencyLabel}`,
    '',
    'Message:',
    values.message || '—',
  ].join('\n')

  return { subject, text }
}

const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(compression({ filter: shouldCompress, threshold: 1024 }))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/le-parc-inquiry', rateLimit, async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}

    if (isHoneypot(body)) {
      res.json({ success: true })
      return
    }

    const { errors, values } = validateInquiry(body)
    if (Object.keys(errors).length) {
      res.status(400).json({ success: false, error: 'invalid' })
      return
    }

    const smtp = mailConfig()
    if (!smtp.ready) {
      logError('le-parc-inquiry: SMTP is not configured')
      res.status(500).json({ success: false, error: 'mail-unavailable' })
      return
    }

    const { subject, text } = buildMail(values)
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    })

    await transporter.sendMail({
      from: smtp.from,
      to: smtp.to,
      cc: smtp.cc.length ? smtp.cc : undefined,
      bcc: smtp.bcc.length ? smtp.bcc : undefined,
      replyTo: values.email,
      subject,
      text,
    })

    res.json({ success: true })
  } catch (err) {
    logError(isProd ? 'le-parc-inquiry: send failed' : `le-parc-inquiry: send failed (${err?.code || err?.message || 'error'})`)
    res.status(500).json({ success: false, error: 'send-failed' })
  }
})

app.use((err, _req, res, next) => {
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    res.status(400).json({ success: false, error: 'invalid' })
    return
  }
  logError('le-parc-inquiry: request error')
  if (res.headersSent) {
    next(err)
    return
  }
  res.status(500).json({ success: false, error: 'send-failed' })
})

if (isProd) {
  app.use(
    express.static(distDir, {
      index: false,
      redirect: false,
      setHeaders: setStaticHeaders,
    }),
  )
  app.use((req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) {
      res.status(404).json({ success: false, error: 'not-found' })
      return
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).end()
      return
    }
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.join(distDir, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
}

app.listen(API_PORT, API_HOST, () => {
  console.log(`Clearview site listening on ${API_HOST}:${API_PORT}`)
})
