import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  getGlassMenuStyle,
  GLASS_MENU_BORDER,
  GLASS_MENU_HOVER_BG,
  GLASS_MENU_HOVER_SHADOW,
} from '../utils/menuGlassStyles'

const DARK_STYLE = {
  background: 'rgba(3,7,20,0.85)',
  border: '1px solid rgba(41,182,255,0.35)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.45), 0 0 16px rgba(41,182,255,0.12)',
}

const FAB_SIZE = 44

function boxesOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
}

function fabOverlapsContent() {
  const mobile = window.innerWidth < 768
  const bottom = mobile ? 72 : 16
  const right = 16
  const fab = {
    left: window.innerWidth - right - FAB_SIZE,
    right: window.innerWidth - right,
    top: window.innerHeight - bottom - FAB_SIZE,
    bottom: window.innerHeight - bottom,
  }
  const nodes = document.querySelectorAll('.le-parc-intake .rounded-2xl, .service-list-item')
  return [...nodes].some((node) => boxesOverlap(fab, node.getBoundingClientRect()))
}

export default function ScrollToTop() {
  const { isDark } = useTheme()
  const isLight = !isDark
  const [visible, setVisible] = useState(false)
  const [formFocused, setFormFocused] = useState(false)
  const [coveringForm, setCoveringForm] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.25)
      setCoveringForm(fabOverlapsContent())
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    const onFocusIn = (event) => {
      if (event.target.closest?.('.le-parc-intake')) setFormFocused(true)
    }
    const onFocusOut = (event) => {
      if (!event.relatedTarget?.closest?.('.le-parc-intake')) setFormFocused(false)
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  if (!visible || formFocused || coveringForm) return null

  const baseStyle = isLight
    ? { ...getGlassMenuStyle(true), borderRadius: '18px' }
    : { ...DARK_STYLE, borderRadius: '9999px' }

  return (
    <button
      type="button"
      data-scroll-top
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="scroll-to-top fixed z-40 flex items-center justify-center transition-all duration-300"
      style={{
        width: '44px',
        height: '44px',
        cursor: 'pointer',
        color: isLight ? '#176fb4' : '#29b6ff',
        ...baseStyle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = GLASS_MENU_HOVER_BG
        e.currentTarget.style.boxShadow = GLASS_MENU_HOVER_SHADOW
        if (!isLight) {
          e.currentTarget.style.border = '1px solid rgba(41,182,255,0.6)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = baseStyle.background
        e.currentTarget.style.boxShadow = baseStyle.boxShadow
        e.currentTarget.style.border = isLight ? GLASS_MENU_BORDER : DARK_STYLE.border
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M9 4v10M5 8l4-4 4 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
