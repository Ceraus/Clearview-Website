import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SERVICES_DATA } from '../data/siteData'
import PlexusOverlay from './PlexusOverlay'
import { useTheme } from '../context/ThemeContext'
import { scrollToService } from '../utils/navScroll'

const ADDRESS = '287 Park Ave, New York, NY 10171'
const MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=15&output=embed`

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 3h3l1.2 5.2-1.9 1.1a12.5 12.5 0 0 0 5.9 5.9l1.1-1.9L21 15.5v3a2 2 0 0 1-2.2 2 18.8 18.8 0 0 1-8.3-2.9A18.8 18.8 0 0 1 3 5.2 2 2 0 0 1 5 3h1.5Z"
        stroke="#29b6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#29b6ff" strokeWidth="1.6" />
      <path
        d="M3 7.5 12 13.5 21 7.5"
        stroke="#29b6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z"
        stroke="#29b6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="#29b6ff" strokeWidth="1.6" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9h4v11H4V9Zm2-4a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 6 5ZM10 9h3.8v1.6h.1A4.2 4.2 0 0 1 17.4 9C20 9 22 10.8 22 14.4V20h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-4V9Z"
        stroke="#29b6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5l.5-4H14V7a1 1 0 0 1 1-1h3V2Z"
        stroke="#29b6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const contactIconStyle = {
  width: '44px',
  height: '44px',
  background: 'rgba(41,182,255,0.1)',
  border: '1px solid rgba(41,182,255,0.25)',
}

function CopyLink({ href, copyValue, children }) {
  const [copied, setCopied] = useState(false)

  const copy = async (e) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(copyValue)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = href
    }
  }

  return (
    <div className="footer-copy-row flex items-center gap-2 min-w-0">
      {children}
      <button
        type="button"
        onClick={copy}
        className="text-xs font-semibold uppercase tracking-wide shrink-0"
        style={{
          color: copied ? '#6b974d' : '#29b6ff',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          minWidth: 44,
          minHeight: 44,
          padding: '8px 4px',
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export default function Footer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const goToService = (index) => {
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: `service-${index}` })
      return
    }
    scrollToService(index)
  }

  return (
    <footer
      id="site-footer"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--bg-alt) 0%, var(--bg) 100%)' }}
    >
      <PlexusOverlay opacity={0.7} nodeCount={81} linkDist={115} scale={1.5} color={isDark ? undefined : '#176fb4'} />

      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-8 pb-10 pt-16"
        style={{
          zIndex: 1,
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
          paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="footer-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 items-stretch lg:min-h-[420px]">
          <div className="footer-col footer-services flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <p className="footer-services-heading section-label section-heading__label uppercase mb-4 font-light">
              Services We Offer
            </p>
            <ul className="footer-services-list flex flex-col gap-2.5">
              {SERVICES_DATA.map((service, index) => (
                <li key={service.title}>
                  <button
                    type="button"
                    onClick={() => goToService(index)}
                    className="footer-service-link text-sm leading-snug transition-colors duration-200 hover:text-[#29b6ff]"
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', minHeight: 44 }}
                  >
                    {service.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="overflow-hidden rounded-2xl h-full min-h-[280px] sm:col-span-2 lg:col-span-1 flex"
            style={{
              border: '1px solid rgba(41,182,255,0.18)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            <iframe
              title="Clearview Global office location"
              src={MAP_EMBED}
              className="w-full h-full min-h-[280px] border-0 flex-1"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="footer-col footer-contact flex flex-col justify-center h-full gap-5 sm:col-span-2 lg:col-span-1">
            <div className="footer-contact-heading" style={{ marginBottom: '8px' }}>
              <p className="section-label section-heading__label uppercase mb-2 font-light">
                Where to Find Us
              </p>
              <h2 className="gradient-title text-3xl md:text-4xl font-bold">
                Contact Us
              </h2>
            </div>

            <div className="footer-contact-item flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                <LocationIcon />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-label)' }}>
                  Visit Us
                </p>
                <p className="text-sm font-semibold" style={{ color: '#29b6ff' }}>
                  {ADDRESS}
                </p>
              </div>
            </div>

            <CopyLink href="tel:2129201234" copyValue="212-920-1234">
              <a
                href="tel:2129201234"
                className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90"
              >
                <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                  <PhoneIcon />
                </div>
                <div className="leading-tight min-w-0">
                  <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-label)' }}>
                    We Can Help
                  </p>
                  <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#29b6ff' }}>
                    212-920-1234
                  </p>
                </div>
              </a>
            </CopyLink>

            <CopyLink href="mailto:info@clearviewglobal.com" copyValue="info@clearviewglobal.com">
              <a
                href="mailto:info@clearviewglobal.com"
                className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90"
              >
                <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                  <EmailIcon />
                </div>
                <div className="leading-tight min-w-0">
                  <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-label)' }}>
                    Email Us
                  </p>
                  <p className="text-sm font-semibold break-words" style={{ color: '#29b6ff' }}>
                    info@clearviewglobal.com
                  </p>
                </div>
              </a>
            </CopyLink>

            <div className="flex items-center justify-center gap-3 pt-1 w-full">
              <a
                href="https://www.linkedin.com/company/clearviewglobal/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Clearview Global on LinkedIn"
                className="flex items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-90"
                style={contactIconStyle}
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://www.facebook.com/ClearviewGlobal/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Clearview Global on Facebook"
                className="flex items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-90"
                style={contactIconStyle}
              >
                <FacebookIcon />
              </a>
            </div>
          </div>
        </div>

        <div
          className="text-center text-[11px] mt-10 pt-6"
          style={{ color: 'var(--text-dim)', borderTop: '1px solid var(--divider)' }}
        >
          © {new Date().getFullYear()} Clearview Global. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

