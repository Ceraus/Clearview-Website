import { createContext, useContext, useState, useEffect, useRef } from 'react'

const ThemeContext = createContext({ isDark: false, toggle: () => {} })

const THEME_BLUR_MS = 400
const THEME_BLUR_FADE_MS = 650

function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  localStorage.setItem('cg-theme', isDark ? 'dark' : 'light')
}

function ThemeTransitionOverlay({ active, visible }) {
  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[99]"
      aria-hidden="true"
      style={{
        background: active ? 'rgba(2,5,9,0.45)' : 'rgba(2,5,9,0)',
        backdropFilter: active ? 'blur(16px)' : 'blur(0px)',
        WebkitBackdropFilter: active ? 'blur(16px)' : 'blur(0px)',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.55s ease, backdrop-filter 0.65s ease, -webkit-backdrop-filter 0.65s ease, background 0.55s ease',
        pointerEvents: active ? 'auto' : 'none',
      }}
    />
  )
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('cg-theme')
    if (stored) return stored === 'dark'
    return false
  })
  const [showThemeOverlay, setShowThemeOverlay] = useState(false)
  const [themeBlurActive, setThemeBlurActive] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      applyTheme(isDark)
      return undefined
    }

    setShowThemeOverlay(true)
    setThemeBlurActive(true)

    const apply = () => {
      if (typeof document.startViewTransition === 'function') {
        document.startViewTransition(() => applyTheme(isDark))
        return
      }
      applyTheme(isDark)
    }

    const applyTimer = window.setTimeout(apply, 40)

    const blurEndTimer = window.setTimeout(() => {
      setThemeBlurActive(false)
    }, THEME_BLUR_MS)

    const hideTimer = window.setTimeout(() => {
      setShowThemeOverlay(false)
    }, THEME_BLUR_MS + THEME_BLUR_FADE_MS)

    return () => {
      window.clearTimeout(applyTimer)
      window.clearTimeout(blurEndTimer)
      window.clearTimeout(hideTimer)
    }
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(v => !v) }}>
      {children}
      <ThemeTransitionOverlay active={themeBlurActive} visible={showThemeOverlay} />
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
