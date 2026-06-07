import { useLocation, useNavigate } from 'react-router-dom'
import { INDUSTRIES_DATA, SERVICES_DATA } from '../data/siteData'
import PlexusOverlay from './PlexusOverlay'

const ADDRESS = '150 W 22nd St, New York, NY 10011'
const MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=15&output=embed`
const NAV_OFFSET = 64

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
  window.scrollTo({ top: y, behavior: 'smooth' })
}

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
  width: '34px',
  height: '34px',
  background: 'rgba(41,182,255,0.1)',
  border: '1px solid rgba(41,182,255,0.25)',
}

export default function Footer() {
  const location = useLocation()
  const navigate = useNavigate()

  const goToService = (index) => {
    const id = `service-slide-${index}`
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: id })
      return
    }
    scrollToSection(id)
  }

  const triggerIndustryHighlight = (index) => {
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('industryHighlight', { detail: { index } }))
    }, 650)
  }

  const goToIndustry = (index) => {
    const id = `industry-tile-${index}`
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: id })
      return
    }
    scrollToSection(id)
    triggerIndustryHighlight(index)
  }

  return (
    <footer
      id="site-footer"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050a14 0%, #020509 100%)', borderTop: '1px solid rgba(41,182,255,0.08)' }}
    >
      <PlexusOverlay opacity={0.7} nodeCount={81} linkDist={115} />

      <div className="relative max-w-7xl mx-auto px-8 py-10" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4 font-light" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Services We Offer
            </p>
            <ul className="flex flex-col gap-2.5">
              {SERVICES_DATA.map((service, index) => (
                <li key={service.linkRoute}>
                  <button
                    type="button"
                    onClick={() => goToService(index)}
                    className="text-left text-xs leading-snug transition-colors duration-200 hover:text-[#29b6ff]"
                    style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {service.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4 font-light" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Industries We Serve
            </p>
            <ul className="flex flex-col gap-2.5">
              {INDUSTRIES_DATA.map((industry, index) => (
                <li key={industry.linkRoute}>
                  <button
                    type="button"
                    onClick={() => goToIndustry(index)}
                    className="text-left text-xs leading-snug transition-colors duration-200 hover:text-[#29b6ff]"
                    style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {industry.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="overflow-hidden rounded-2xl min-h-[260px] sm:col-span-2 lg:col-span-1"
            style={{
              border: '1px solid rgba(41,182,255,0.18)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            <iframe
              title="Clearview Global office location"
              src={MAP_EMBED}
              className="w-full h-full min-h-[260px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col justify-center gap-5 sm:col-span-2 lg:col-span-1">
            <div style={{ marginBottom: '8px' }}>
              <p className="text-[10px] tracking-[0.4em] uppercase mb-2 font-light" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Where to Find Us
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Contact Us
              </h2>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                <LocationIcon />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Visit Us
                </p>
                <p className="text-sm font-semibold" style={{ color: '#29b6ff' }}>
                  {ADDRESS}
                </p>
              </div>
            </div>

            <a
              href="tel:2129201234"
              className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90"
            >
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                <PhoneIcon />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  We Can Help
                </p>
                <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#29b6ff' }}>
                  212-920-1234
                </p>
              </div>
            </a>

            <a
              href="mailto:info@clearviewglobal.com"
              className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90"
            >
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                <EmailIcon />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Email Us
                </p>
                <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#29b6ff' }}>
                  info@clearviewglobal.com
                </p>
              </div>
            </a>

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
          style={{ color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          © {new Date().getFullYear()} Clearview Global. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
