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

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

const LOGO_BADGE = '/assets/clearview-earth-logo.png'
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

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
      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 44 }}
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
  const menuButtonRef = useRef(null)
  const drawerRef = useRef(null)
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
    const nav = navRef.current
    if (!nav) return undefined
    const syncHeight = () => {
      document.documentElement.style.setProperty('--site-nav-height', `${Math.round(nav.getBoundingClientRect().height)}px`)
    }
    syncHeight()
    const observer = new ResizeObserver(syncHeight)
    observer.observe(nav)
    window.addEventListener('resize', syncHeight)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeight)
    }
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1280px)')
    const onChange = () => {
      if (query.matches) closeMenus()
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined

    const { body } = document
    const scrollY = window.scrollY
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.setAttribute('data-nav-open', 'true')

    const main = document.getElementById('main-content')
    const footer = document.getElementById('site-footer')
    if (main) main.inert = true
    if (footer) footer.inert = true

    return () => {
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.removeAttribute('data-nav-open')
      window.scrollTo(0, scrollY)
      if (main) main.inert = false
      if (footer) footer.inert = false
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined

    const drawer = drawerRef.current
    const menuButton = menuButtonRef.current
    const focusables = () => {
      const inDrawer = drawer ? [...drawer.querySelectorAll(FOCUSABLE_SELECTOR)] : []
      return [menuButton, ...inDrawer].filter(Boolean)
    }

    const items = focusables()
    items[1]?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        setMobileServicesOpen(false)
        menuButton?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target) && !drawerRef.current?.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setServicesOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const drawerLinkStyle = {
    color: isDark ? '#ffffff' : 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    minHeight: 44,
  }

  return (
    <>
      <nav
        ref={navRef}
        data-site-nav
        className="site-nav fixed top-0 left-0 right-0 z-50"
        aria-label="Primary"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div
          className="relative"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="max-w-7xl mx-auto flex items-center justify-between relative"
            style={{
              height: `${NAV_BAR_HEIGHT}px`,
              paddingLeft: 'max(1.25rem, env(safe-area-inset-left, 0px))',
              paddingRight: 'max(1.25rem, env(safe-area-inset-right, 0px))',
            }}
          >
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

            <div className="hidden xl:flex items-center gap-6 min-w-0">
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
                onClick={() => goToSection('site-footer')}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-[#03060e] transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #29b6ff 0%, #0d9ee0 100%)', boxShadow: '0 2px 14px rgba(41,182,255,0.3)', border: 'none', cursor: 'pointer' }}
              >
                Contact Us
              </button>
            </div>

            <div className="flex items-center gap-3 min-w-0 ml-auto relative z-10">
              <div className="hidden xl:flex items-center gap-4 min-w-0">
                <a href="tel:2129201234" className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90">
                  <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                    <PhoneIcon />
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-label)' }}>We Can Help</p>
                    <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#29b6ff' }}>212-920-1234</p>
                  </div>
                </a>
                <a href="mailto:info@clearviewglobal.com" className="flex items-center gap-2.5 min-w-0 transition-opacity duration-200 hover:opacity-90">
                  <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}>
                    <EmailIcon />
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-label)' }}>Email Us</p>
                    <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#29b6ff' }}>info@clearviewglobal.com</p>
                  </div>
                </a>
              </div>

              <button
                ref={menuButtonRef}
                type="button"
                className="xl:hidden flex items-center justify-center shrink-0 rounded-lg"
                style={{
                  width: 44,
                  height: 44,
                  color: '#29b6ff',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                <MenuIcon open={menuOpen} />
              </button>
            </div>
          </div>
          <ScrollProgressBar />
        </div>
      </nav>

      {menuOpen ? (
        <div className="xl:hidden">
          <div
            className="site-nav-backdrop"
            onClick={closeMenus}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="site-nav-drawer"
          >
            <p className="site-nav-drawer-label">Menu</p>
            <div className="site-nav-drawer-contacts">
            <a href="tel:2129201234" className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--divider)', minHeight: 44 }}>
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}><PhoneIcon /></div>
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-label)' }}>We Can Help</p>
                <p className="text-sm font-semibold" style={{ color: '#29b6ff' }}>212-920-1234</p>
              </div>
            </a>
            <a href="mailto:info@clearviewglobal.com" className="flex items-center gap-3 py-3" style={{ minHeight: 44 }}>
              <div className="flex items-center justify-center shrink-0 rounded-full" style={contactIconStyle}><EmailIcon /></div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-label)' }}>Email Us</p>
                <p className="text-sm font-semibold break-words" style={{ color: '#29b6ff' }}>info@clearviewglobal.com</p>
              </div>
            </a>
            </div>

            <button
              type="button"
              onClick={() => setMobileServicesOpen((v) => !v)}
              className="flex items-center justify-between py-3.5 text-sm transition-colors hover:text-[#29b6ff] w-full text-left"
              style={{ color: mobileServicesOpen ? '#29b6ff' : (isDark ? '#ffffff' : 'var(--text-muted)'), background: 'none', border: 'none', cursor: 'pointer', minHeight: 44 }}
              aria-expanded={mobileServicesOpen}
              aria-controls="mobile-services-list"
            >
              Our Services
              <ChevronIcon open={mobileServicesOpen} />
            </button>
            {mobileServicesOpen && (
              <div id="mobile-services-list" className="mb-2 pl-3" style={{ borderLeft: '1px solid rgba(41,182,255,0.15)' }}>
                <p className="py-2 text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--text-subtle)' }}>Solutions We Offer</p>
                {SERVICES_DATA.map((service, index) => (
                  <DropdownItem key={service.title} label={service.title} onClick={() => goToService(index)} />
                ))}
              </div>
            )}

            <button type="button" onClick={() => goToSection('company-mission')} className="block py-3.5 text-sm transition-colors hover:text-[#29b6ff] w-full text-left" style={drawerLinkStyle}>Our Company</button>
            <button type="button" onClick={() => goToSection('site-footer')} className="block py-3.5 text-sm font-semibold w-full text-left" style={{ ...drawerLinkStyle, color: '#29b6ff' }}>Contact Us</button>
          </div>
        </div>
      ) : null}
    </>
  )
}
