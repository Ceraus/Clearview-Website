import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToSection, scrollToService } from '../utils/navScroll'
import { SERVICES_DATA } from '../data/siteData'
import ScrollProgressBar from './ScrollProgressBar'
import { useTheme } from '../context/ThemeContext'
import { NAV_BAR_HEIGHT } from '../constants/layout'

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#29b6ff" strokeWidth="1.6" />
      <path d="M3 7.5 12 13.5 21 7.5" stroke="#29b6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const LOGO_BADGE = '/assets/clearview-earth-logo.png'

const contactIconStyle = {
  width: '46px',
  height: '46px',
  background: 'rgba(41,182,255,0.1)',
  border: '1px solid rgba(41,182,255,0.25)',
}

const dropdownPanelStyle = {
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 8px 48px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.04)',
}

function DropdownItem({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left px-4 py-3 text-sm leading-snug transition-colors duration-200 hover:text-[#29b6ff]"
      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(41,182,255,0.08)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
    >
      {label}
    </button>
  )
}

function NavDropdown({ label, open, onToggle, onOpen, onClose, children, minWidth = 320, unstyled = false, linkColor = 'var(--text-muted)' }) {
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 hover:text-[#29b6ff]"
        style={{
          color: open ? '#29b6ff' : linkColor,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronIcon open={open} />
      </button>

      <div
        className="absolute left-0 pt-3 transition-all duration-300"
        style={{
          top: '100%',
          minWidth: unstyled ? undefined : `${minWidth}px`,
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: open ? 'auto' : 'none',
          zIndex: 60,
        }}
      >
        {unstyled ? children : (
          <div className="overflow-hidden py-1" style={dropdownPanelStyle}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const navRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const navLinkColor = 'var(--text-muted)'

  const closeMenus = () => {
    setMenuOpen(false)
    setServicesOpen(false)
    setMobileServicesOpen(false)
  }

  const goToSection = (id) => {
    closeMenus()
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: id })
      return
    }
    scrollToSection(id)
  }

  const goToService = (index) => {
    closeMenus()
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: `service-${index}` })
      return
    }
    scrollToService(index)
  }

  useEffect(() => { closeMenus() }, [location])

  useEffect(() => {
    if (location.pathname !== '/') return
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const timer = window.setTimeout(() => {
      if (hash.startsWith('service-')) {
        const index = Number.parseInt(hash.replace('service-', ''), 10)
        if (!Number.isNaN(index)) scrollToService(index)
        return
      }
      scrollToSection(hash)
    }, 150)

    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setServicesOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50">
      <div
        className="relative"
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative" style={{ height: `${NAV_BAR_HEIGHT}px` }}>

        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            closeMenus()
            if (location.pathname !== '/') navigate('/')
            else window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src={LOGO_BADGE}
            alt="Clearview Global"
            className="object-contain"
            style={{
              height: 'clamp(47px, 7.13vh, 65px)',
              filter: 'drop-shadow(0 0 10px rgba(41,182,255,0.35))',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </a>

        <div className="hidden md:flex items-center gap-6 min-w-0">
          <NavDropdown
            label="Our Services"
            open={servicesOpen}
            onToggle={() => setServicesOpen((v) => !v)}
            onOpen={() => setServicesOpen(true)}
            onClose={() => setServicesOpen(false)}
            minWidth={380}
            linkColor={navLinkColor}
          >
            <p
              className="px-4 pt-3 pb-2 text-[10px] font-medium tracking-[0.25em] uppercase"
              style={{ color: 'var(--text-subtle)' }}
            >
              Solutions We Offer
            </p>
            {SERVICES_DATA.map((service, index) => (
              <DropdownItem
                key={service.title}
                label={service.title}
                onClick={() => goToService(index)}
              />
            ))}
          </NavDropdown>

          <button
            type="button"
            onClick={() => goToSection('company-mission')}
            className="text-sm font-medium transition-colors duration-200 hover:text-[#29b6ff]"
            style={{ color: navLinkColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Our Company
          </button>

          <button
            type="button"
            onClick={() => goToSection('le-parc')}
            className="text-sm font-medium transition-colors duration-200 hover:text-[#29b6ff]"
            style={{ color: navLinkColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Le Parc
          </button>

          <button
            type="button"
            onClick={() => goToSection('site-footer')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-[#03060e] transition-all duration-300 hover:scale-105 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #29b6ff 0%, #0d9ee0 100%)', boxShadow: '0 2px 14px rgba(41,182,255,0.3)', border: 'none', cursor: 'pointer' }}
          >
            Contact Us
          </button>
        </div>

        <div className="flex items-center gap-3 min-w-0 ml-auto">
          <div className="hidden lg:flex items-center gap-4 min-w-0">
            <a href="tel:2129201234" className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90">
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                <PhoneIcon />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-label)' }}>We Can Help</p>
                <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#29b6ff' }}>212-920-1234</p>
              </div>
            </a>
            <a href="mailto:info@clearviewglobal.com" className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90">
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                <EmailIcon />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-label)' }}>Email Us</p>
                <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#29b6ff' }}>info@clearviewglobal.com</p>
              </div>
            </a>
          </div>

          <button
            className="md:hidden flex flex-col gap-2 p-2.5 shrink-0"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="block h-0.5 w-7 rounded transition-all duration-300" style={{ background: 'rgba(41,182,255,0.7)' }} />
            ))}
          </button>
        </div>
      </div>
      <ScrollProgressBar />
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-6" style={{ background: 'var(--bg-glass)', borderTop: '1px solid var(--border)' }}>
          <a href="tel:2129201234" className="flex items-center gap-3 py-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}><PhoneIcon /></div>
            <div>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-label)' }}>We Can Help</p>
              <p className="text-sm font-semibold" style={{ color: '#29b6ff' }}>212-920-1234</p>
            </div>
          </a>
          <a href="mailto:info@clearviewglobal.com" className="flex items-center gap-3 py-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}><EmailIcon /></div>
            <div>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-label)' }}>Email Us</p>
              <p className="text-sm font-semibold break-all" style={{ color: '#29b6ff' }}>info@clearviewglobal.com</p>
            </div>
          </a>
          <div className="flex justify-center py-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <img src={LOGO_BADGE} alt="Clearview Global" className="object-contain" style={{ height: 'clamp(61px, 13.6vw, 82px)', filter: 'drop-shadow(0 0 12px rgba(41,182,255,0.35))' }} onError={(e) => { e.target.style.display = 'none' }} />
          </div>

          <button
            type="button"
            onClick={() => setMobileServicesOpen((v) => !v)}
            className="flex items-center justify-between py-3.5 text-sm transition-colors hover:text-[#29b6ff] w-full text-left"
            style={{ color: mobileServicesOpen ? '#29b6ff' : (isDark ? '#ffffff' : 'var(--text-muted)'), background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Our Services
            <ChevronIcon open={mobileServicesOpen} />
          </button>
          {mobileServicesOpen && (
            <div className="mb-2 pl-3" style={{ borderLeft: '1px solid rgba(41,182,255,0.15)' }}>
              <p className="py-2 text-[10px] font-medium tracking-[0.25em] uppercase" style={{ color: 'var(--text-subtle)' }}>Solutions We Offer</p>
              {SERVICES_DATA.map((service, index) => (
                <DropdownItem key={service.title} label={service.title} onClick={() => goToService(index)} />
              ))}
            </div>
          )}

          <button type="button" onClick={() => goToSection('company-mission')} className="block py-3.5 text-sm transition-colors hover:text-[#29b6ff] w-full text-left" style={{ color: isDark ? '#ffffff' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Our Company</button>

          <button type="button" onClick={() => goToSection('le-parc')} className="block py-3.5 text-sm transition-colors hover:text-[#29b6ff] w-full text-left" style={{ color: isDark ? '#ffffff' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Le Parc</button>

          <button type="button" onClick={() => goToSection('site-footer')} className="block py-3.5 text-sm font-semibold w-full text-left" style={{ color: '#29b6ff', background: 'none', border: 'none', cursor: 'pointer' }}>Contact Us</button>
        </div>
      )}
    </nav>
  )
}
