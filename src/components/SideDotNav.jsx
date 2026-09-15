import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { SERVICES_DATA } from '../data/siteData'
import { useTheme } from '../context/ThemeContext'
import { getGlassMenuStyle } from '../utils/menuGlassStyles'

const MENU_SCALE = 0.85
const LOGO_SIZE = Math.round(33 * MENU_SCALE * 1.15 * 1.2 * 1.15 * 1.3 * 1.4 * 0.68)
const DOT_SIZE = 7
const DOT_SIZE_ACTIVE = 9
const SLOT_SIZE = Math.max(22, Math.round(LOGO_SIZE * 0.72))
const BAR_GAP = 6
const BAR_PAD_X = 14
const BAR_PAD_Y = Math.round(10 * MENU_SCALE)
const LABEL_FONT_IDLE = 9
const LABEL_FONT_HOVER = 11
const SCROLL_OFFSET = 70
const HERO_LOGO = '/assets/Logo.svg'

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

function buildNavItems() {
  return [
    {
      id: 'company',
      label: 'Home',
      scroll: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    ...SERVICES_DATA.map((_, i) => ({
      id: `service-${i}`,
      label: SHORT_LABELS[i],
      scroll: () => {
        const el = document.getElementById(`service-slide-${i}`)
        if (!el) return
        const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
        window.scrollTo({ top: y, behavior: 'smooth' })
      },
    })),
    {
      id: 'contact',
      label: 'Contact',
      scroll: () => scrollToSection('site-footer'),
    },
  ]
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  window.scrollTo({ top: y, behavior: 'smooth' })
}

function getNavTargetElement(id) {
  if (id === 'company') return document.getElementById('company-mission')
  if (id === 'contact') return document.getElementById('site-footer')
  if (id.startsWith('service-')) return document.getElementById(`service-slide-${id.replace('service-', '')}`)
  return null
}

function getActiveNavIndex(items) {
  const mid = window.scrollY + window.innerHeight / 2
  let best = 0
  let bestDist = Infinity

  items.forEach((item, i) => {
    const el = getNavTargetElement(item.id)
    if (!el) return
    const center = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2
    const dist = Math.abs(center - mid)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  })

  return best
}

function getPanelStyle(isLightMenu) {
  return {
    ...getGlassMenuStyle(isLightMenu),
    borderRadius: '18px',
  }
}

function SectionDivider({ isLightMenu }) {
  return (
    <div
      style={{
        width: '14px',
        height: '1px',
        background: isLightMenu ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255,255,255,0.12)',
        flexShrink: 0,
      }}
    />
  )
}

function getNavScrollFade() {
  const footer = document.getElementById('site-footer')
  if (!footer) return 1

  const footerTop = footer.getBoundingClientRect().top
  const vh = window.innerHeight
  const fadeStart = vh + Math.round(vh * 0.18)
  const fadeEnd = vh + 24

  if (footerTop >= fadeStart) return 1
  if (footerTop <= fadeEnd) return 0
  return (footerTop - fadeEnd) / (fadeStart - fadeEnd)
}

function NavDotButton({
  label,
  isActive,
  isHovered,
  isLightMenu,
  onClick,
  onEnter,
  onLeave,
  dotRef,
}) {
  const labelColor = isHovered ? '#29b6ff' : (isLightMenu ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.72)')

  return (
    <button
      ref={dotRef}
      type="button"
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative flex items-center justify-center"
      style={{
        width: `${SLOT_SIZE}px`,
        height: `${SLOT_SIZE}px`,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
      }}
      title={label}
    >
      <span
        className="absolute right-full font-medium tracking-wide whitespace-nowrap pointer-events-none"
        style={{
          marginRight: '10px',
          fontSize: isHovered ? `${LABEL_FONT_HOVER}px` : `${LABEL_FONT_IDLE}px`,
          color: labelColor,
          textShadow: isLightMenu ? 'none' : '0 1px 6px rgba(0,0,0,0.9)',
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'visibility 0.2s ease, color 0.2s ease',
        }}
      >
        {label}
      </span>
      {!isActive && (
        <span
          style={{
            width: isHovered ? DOT_SIZE_ACTIVE + 1 : DOT_SIZE,
            height: isHovered ? DOT_SIZE_ACTIVE + 1 : DOT_SIZE,
            borderRadius: '50%',
            background: isLightMenu ? '#176fb4' : '#29b6ff',
            boxShadow: isHovered
              ? (isLightMenu ? '0 0 10px rgba(23, 111, 180, 0.45)' : '0 0 10px rgba(41,182,255,0.45)')
              : 'none',
            transition: 'all 0.2s ease',
          }}
        />
      )}
    </button>
  )
}

export default function SideDotNav() {
  const { isDark } = useTheme()
  const isLightMenu = !isDark
  const panelStyle = getPanelStyle(isLightMenu)
  const navItems = buildNavItems()

  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [menuOpacity, setMenuOpacity] = useState(0)
  const [logoTop, setLogoTop] = useState(0)

  const panelRef = useRef(null)
  const dotRefs = useRef([])

  const updateLogoPosition = useCallback(() => {
    const panel = panelRef.current
    const dot = dotRefs.current[activeIndex]
    if (!panel || !dot) return
    const panelRect = panel.getBoundingClientRect()
    const dotRect = dot.getBoundingClientRect()
    setLogoTop(dotRect.top - panelRect.top + dotRect.height / 2 - LOGO_SIZE / 2)
  }, [activeIndex])

  useLayoutEffect(() => {
    updateLogoPosition()
  }, [activeIndex, menuOpacity, updateLogoPosition])

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const threshold = scrollable > 0 ? scrollable * 0.03 : window.innerHeight * 0.03
      const scrollShown = window.scrollY >= threshold
      setMenuOpacity(scrollShown ? getNavScrollFade() : 0)
      setActiveIndex(getActiveNavIndex(navItems))
    }

    const handleResize = () => {
      handleScroll()
      updateLogoPosition()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [navItems, updateLogoPosition])

  const isInteractive = menuOpacity > 0.04
  const serviceStart = 1
  const contactIndex = serviceStart + SERVICES_DATA.length

  return (
    <div
      className={`fixed right-4 top-1/2 z-50${isLightMenu ? ' services-menu-light' : ''}`}
      style={{
        pointerEvents: isInteractive ? 'auto' : 'none',
        opacity: menuOpacity,
        transform: isInteractive ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(12px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      <div
        ref={panelRef}
        className="relative inline-flex flex-col flex-nowrap items-center overflow-visible"
        style={{
          gap: `${BAR_GAP}px`,
          padding: `${BAR_PAD_Y}px ${BAR_PAD_X}px`,
          transition: 'background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease',
          ...panelStyle,
        }}
      >
        <div
          className="absolute left-1/2 pointer-events-none"
          style={{
            top: `${logoTop}px`,
            width: `${LOGO_SIZE}px`,
            height: `${LOGO_SIZE}px`,
            transform: 'translateX(-50%)',
            transition: 'top 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
            zIndex: 2,
          }}
        >
          <img
            src={HERO_LOGO}
            alt="Clearview Global"
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(41,182,255,0.55)) drop-shadow(0 0 16px rgba(41,182,255,0.25))',
            }}
            onError={(e) => {
              e.target.style.borderRadius = '50%'
              e.target.style.background = isLightMenu ? 'rgba(23, 111, 180, 0.15)' : 'rgba(255,255,255,0.25)'
            }}
          />
        </div>

        {navItems.map((item, i) => (
          <div key={item.id} className="contents">
            {i === serviceStart && <SectionDivider isLightMenu={isLightMenu} />}
            {i === contactIndex && <SectionDivider isLightMenu={isLightMenu} />}
            <NavDotButton
              dotRef={(el) => { dotRefs.current[i] = el }}
              label={item.label}
              isActive={activeIndex === i}
              isHovered={hoveredIndex === i}
              isLightMenu={isLightMenu}
              onClick={item.scroll}
              onEnter={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
