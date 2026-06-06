import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 64
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
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="#29b6ff"
        strokeWidth="1.6"
      />
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

const contactIconStyle = {
  width: '34px',
  height: '34px',
  background: 'rgba(41,182,255,0.1)',
  border: '1px solid rgba(41,182,255,0.25)',
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const goToSection = (id) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: id })
      return
    }
    scrollToSection(id)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    if (location.pathname !== '/') return
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    const timer = setTimeout(() => scrollToSection(hash), 150)
    return () => clearTimeout(timer)
  }, [location.pathname, location.hash])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(3,6,14,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(41,182,255,0.08)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">

        {/* Center — logo (visible when floating header appears) */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            setMenuOpen(false)
            if (location.pathname !== '/') navigate('/')
            else window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="absolute left-1/2 top-1/2 transition-all duration-500"
          style={{
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? 'translate(-50%, -50%)' : 'translate(-50%, calc(-50% - 8px))',
            pointerEvents: scrolled ? 'auto' : 'none',
          }}
        >
          <img
            src="/assets/clearviewlogo.svg"
            alt="Clearview Global"
            className="object-contain"
            style={{
              height: 'clamp(42px, 6.3vh, 57px)',
              filter: 'drop-shadow(0 0 10px rgba(41,182,255,0.35))',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </a>

        {/* Left — nav links */}
        <div className="hidden md:flex items-center gap-8 min-w-0">
          <button
            type="button"
            onClick={() => goToSection('services-showcase')}
            className="text-xs font-medium transition-colors duration-200 hover:text-[#29b6ff]"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Our Services
          </button>
          <button
            type="button"
            onClick={() => goToSection('company-mission')}
            className="text-xs font-medium transition-colors duration-200 hover:text-[#29b6ff]"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Our Company
          </button>
          <button
            type="button"
            onClick={() => goToSection('industries')}
            className="text-xs font-medium transition-colors duration-200 hover:text-[#29b6ff]"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Industries
          </button>
          <button
            type="button"
            onClick={() => goToSection('site-footer')}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-[#03060e] transition-all duration-300 hover:scale-105 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #29b6ff 0%, #0d9ee0 100%)', boxShadow: '0 2px 14px rgba(41,182,255,0.3)', border: 'none', cursor: 'pointer' }}
          >
            Contact Us
          </button>
        </div>

        {/* Right — contact info (visible when floating header appears) */}
        <div className="flex items-center gap-3 min-w-0 ml-auto">
          <div
            className="hidden lg:flex items-center gap-4 min-w-0 transition-all duration-500"
            style={{
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? 'translateX(0)' : 'translateX(12px)',
              pointerEvents: scrolled ? 'auto' : 'none',
            }}
          >
            <a
              href="tel:2129201234"
              className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90"
            >
              <div
                className="flex items-center justify-center shrink-0 rounded-full"
                style={contactIconStyle}
              >
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
              <div
                className="flex items-center justify-center shrink-0 rounded-full"
                style={contactIconStyle}
              >
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
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2 shrink-0"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="block h-px w-5 rounded transition-all duration-300" style={{ background: 'rgba(41,182,255,0.7)' }} />
            ))}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-6" style={{ background: 'rgba(3,6,14,0.96)', borderTop: '1px solid rgba(41,182,255,0.08)' }}>
          {scrolled && (
            <>
              <a href="tel:2129201234" className="flex items-center gap-3 py-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                  <PhoneIcon />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>We Can Help</p>
                  <p className="text-sm font-semibold" style={{ color: '#29b6ff' }}>212-920-1234</p>
                </div>
              </a>
              <a href="mailto:info@clearviewglobal.com" className="flex items-center gap-3 py-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                  <EmailIcon />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>Email Us</p>
                  <p className="text-sm font-semibold break-all" style={{ color: '#29b6ff' }}>info@clearviewglobal.com</p>
                </div>
              </a>
              <div className="flex justify-center py-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <img
                  src="/assets/clearviewlogo.svg"
                  alt="Clearview Global"
                  className="object-contain"
                  style={{
                    height: 'clamp(54px, 12vw, 72px)',
                    filter: 'drop-shadow(0 0 12px rgba(41,182,255,0.35))',
                  }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            </>
          )}
          <button type="button" onClick={() => goToSection('services-showcase')} className="block py-3 text-xs transition-colors hover:text-[#29b6ff] w-full text-left" style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Our Services</button>
          <button type="button" onClick={() => goToSection('company-mission')} className="block py-3 text-xs transition-colors hover:text-[#29b6ff] w-full text-left" style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Our Company</button>
          <button type="button" onClick={() => goToSection('industries')} className="block py-3 text-xs transition-colors hover:text-[#29b6ff] w-full text-left" style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Industries</button>
          <button type="button" onClick={() => goToSection('site-footer')} className="block py-3 text-xs font-semibold w-full text-left" style={{ color: '#29b6ff', background: 'none', border: 'none', cursor: 'pointer' }}>Contact Us</button>
        </div>
      )}
    </nav>
  )
}
