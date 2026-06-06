import { useState, useEffect } from 'react'
import { SERVICES_DATA } from '../data/siteData'

const MENU_SCALE = 0.85
const IDLE_ICON = Math.round(33 * MENU_SCALE * 1.15 * 1.2 * 1.15 * 1.3)   // ~59
const ACTIVE_ICON = Math.round(43 * MENU_SCALE)        // 37
const LABEL_FONT_IDLE = 10
const LABEL_FONT_HOVER = Math.round(LABEL_FONT_IDLE * 1.2) // 12
const HOVER_SCALE = 2.8 * 0.8 * 0.7 // 1.568 — visual zoom only, layout slot stays fixed
const SLOT_SIZE = IDLE_ICON
const H_PAD_BASE = Math.round(10 * MENU_SCALE)
const BAR_H_PAD = Math.max(0, Math.round(((H_PAD_BASE * 2 + SLOT_SIZE) * 0.8 - SLOT_SIZE) / 2))
const HERO_LOGO = '/assets/Logo.svg'
const COMPANY_ICON = '/assets/Our Company.svg'
const INDUSTRY_ICON = '/assets/Industry.svg'
const CONTACT_ICON = '/assets/Contact Us.svg'

const iconGlow = (active) =>
  active
    ? 'drop-shadow(0 0 6px rgba(41,182,255,0.8)) drop-shadow(0 0 14px rgba(41,182,255,0.4))'
    : 'none'

function iconTransformStyle(size, hovered, extra = {}) {
  return {
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'contain',
    flexShrink: 0,
    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease',
    transform: hovered ? `scale(${HOVER_SCALE})` : 'none',
    transformOrigin: 'center right',
    ...extra,
  }
}

function hoverLabelGap(iconSize, isHovered) {
  const base = 8
  if (!isHovered) return base
  const hoverOverflow = iconSize * (HOVER_SCALE - 1)
  return Math.round((base + hoverOverflow + 12) * 0.7)
}
function SectionDivider() {
  return (
    <div
      style={{
        alignSelf: 'center',
        width: `${Math.round(18 * MENU_SCALE)}px`,
        height: '1px',
        background: 'rgba(255,255,255,0.12)',
        flexShrink: 0,
      }}
    />
  )
}

const SHORT_LABELS = [
  'Managed IT',
  'Cyber Security',
  'Cloud Hosting',
  'IT Support',
  'Wi-Fi & Wiring',
  'System Integration',
  'Web Design',
  'AV Integration',
]

function NavDot({ label, onClick, isActive, isHovered, onEnter, onLeave, iconSize = IDLE_ICON, children }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative flex items-center justify-center"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        width: `${SLOT_SIZE}px`,
        height: `${SLOT_SIZE}px`,
        flexShrink: 0,
      }}
      title={label}
    >
      <span
        className="absolute right-full font-medium tracking-wide whitespace-nowrap"
        style={{
          marginRight: `${hoverLabelGap(iconSize, isHovered)}px`,
          fontSize: isHovered ? `${LABEL_FONT_HOVER}px` : `${LABEL_FONT_IDLE}px`,
          color: isActive ? '#29b6ff' : 'rgba(255,255,255,0.5)',
          textShadow: '0 1px 6px rgba(0,0,0,0.9)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease, margin-right 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), font-size 0.2s ease',
        }}
      >
        {label}
      </span>
      {children}
    </button>
  )
}

export default function SideDotNav() {
  const [activeIndex, setActiveIndex]     = useState(0)
  const [inShowcase, setInShowcase]       = useState(false)
  const [hoveredIndex, setHoveredIndex]   = useState(null)
  const [hoveredHero, setHoveredHero]     = useState(false)
  const [hoveredCompany, setHoveredCompany] = useState(false)
  const [hoveredIndustry, setHoveredIndustry] = useState(false)
  const [hoveredContact, setHoveredContact] = useState(false)
  const [menuVisible, setMenuVisible]     = useState(false)

  useEffect(() => {
    const onServiceChange = (e) => setActiveIndex(e.detail.index)
    window.addEventListener('serviceChange', onServiceChange)

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const threshold = scrollable > 0 ? scrollable * 0.03 : window.innerHeight * 0.03
      setMenuVisible(window.scrollY >= threshold)

      const info = window.__showcaseInfo
      if (!info) { setInShowcase(false); return }
      const { sectionEl } = info
      const top = sectionEl.offsetTop
      const bottom = top + sectionEl.offsetHeight
      const mid = window.scrollY + window.innerHeight / 2
      setInShowcase(mid >= top && mid < bottom)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('serviceChange', onServiceChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToService = (i) => {
    const info = window.__showcaseInfo
    if (!info || !info.slideEls || !info.slideEls[i]) return
    const y = info.slideEls[i].getBoundingClientRect().top + window.scrollY - 70
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const scrollToHero = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 70
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
  const scrollToIndustries = () => scrollToSection('industries')
  const scrollToCompany = () => scrollToSection('company-mission')
  const scrollToContact = () => scrollToSection('site-footer')

  return (
    <div
      className="fixed right-4 top-1/2 z-50"
      style={{
        pointerEvents: menuVisible ? 'auto' : 'none',
        opacity: menuVisible ? 1 : 0,
        transform: menuVisible ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      <div
        className="relative flex flex-col items-end overflow-visible"
        style={{
          gap: `${Math.round(8 * MENU_SCALE)}px`,
          padding: `${Math.round(12 * MENU_SCALE)}px ${BAR_H_PAD}px`,
          borderRadius: '18px',
          background: 'rgba(3, 7, 20, 0.42)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(41,182,255,0.18)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
      <NavDot
        label="Home"
        onClick={scrollToHero}
        isActive={false}
        isHovered={hoveredHero}
        onEnter={() => setHoveredHero(true)}
        onLeave={() => setHoveredHero(false)}
      >
        <img
          src={HERO_LOGO}
          alt="Clearview Global"
          style={iconTransformStyle(IDLE_ICON, hoveredHero, { filter: iconGlow(hoveredHero) })}
          onError={(e) => {
            e.target.style.width       = `${IDLE_ICON}px`
            e.target.style.height      = `${IDLE_ICON}px`
            e.target.style.borderRadius = '50%'
            e.target.style.background  = 'rgba(255,255,255,0.25)'
          }}
        />
      </NavDot>

      <SectionDivider />

      {SERVICES_DATA.map((service, i) => {
        const isActive  = inShowcase && activeIndex === i
        const isHovered = hoveredIndex === i
        const baseSize  = isActive ? ACTIVE_ICON : IDLE_ICON

        return (
          <NavDot
            key={i}
            label={SHORT_LABELS[i]}
            onClick={() => scrollToService(i)}
            isActive={isActive}
            isHovered={isHovered}
            iconSize={baseSize}
            onEnter={() => setHoveredIndex(i)}
            onLeave={() => setHoveredIndex(null)}
          >
            <img
              src={service.iconPath}
              alt={service.title}
              style={iconTransformStyle(baseSize, isHovered, {
                opacity: 1,
                filter: isActive || isHovered
                  ? 'drop-shadow(0 0 6px rgba(41,182,255,0.8)) drop-shadow(0 0 14px rgba(41,182,255,0.4))'
                  : 'none',
                outline:       isActive ? '1.5px solid rgba(41,182,255,0.4)' : 'none',
                outlineOffset: '3px',
                borderRadius:  '6px',
              })}
              onError={(e) => {
                e.target.style.width       = `${baseSize}px`
                e.target.style.height      = `${baseSize}px`
                e.target.style.borderRadius = '50%'
                e.target.style.background  = isActive ? '#29b6ff' : 'rgba(255,255,255,0.25)'
              }}
            />
          </NavDot>
        )
      })}

      <SectionDivider />

      <NavDot
        label="Our Company, Mission & Perspective"
        onClick={scrollToCompany}
        isActive={false}
        isHovered={hoveredCompany}
        onEnter={() => setHoveredCompany(true)}
        onLeave={() => setHoveredCompany(false)}
      >
        <img
          src={COMPANY_ICON}
          alt="Our Company, Mission & Perspective"
          style={iconTransformStyle(IDLE_ICON, hoveredCompany, { filter: iconGlow(hoveredCompany) })}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </NavDot>

      <NavDot
        label="Industries"
        onClick={scrollToIndustries}
        isActive={false}
        isHovered={hoveredIndustry}
        onEnter={() => setHoveredIndustry(true)}
        onLeave={() => setHoveredIndustry(false)}
      >
        <img
          src={INDUSTRY_ICON}
          alt="Industries"
          style={iconTransformStyle(IDLE_ICON, hoveredIndustry, { filter: iconGlow(hoveredIndustry) })}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </NavDot>

      <NavDot
        label="Contact Us"
        onClick={scrollToContact}
        isActive={false}
        isHovered={hoveredContact}
        onEnter={() => setHoveredContact(true)}
        onLeave={() => setHoveredContact(false)}
      >
        <img
          src={CONTACT_ICON}
          alt="Contact Us"
          style={iconTransformStyle(IDLE_ICON, hoveredContact, { filter: iconGlow(hoveredContact) })}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </NavDot>
      </div>
    </div>
  )
}
