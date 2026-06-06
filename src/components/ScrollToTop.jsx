import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.25)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-300"
      style={{
        right: '20px',
        bottom: '20px',
        width: '44px',
        height: '44px',
        background: 'rgba(3,7,20,0.85)',
        border: '1px solid rgba(41,182,255,0.35)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.45), 0 0 16px rgba(41,182,255,0.12)',
        cursor: 'pointer',
        color: '#29b6ff',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(41,182,255,0.15)'
        e.currentTarget.style.border = '1px solid rgba(41,182,255,0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(3,7,20,0.85)'
        e.currentTarget.style.border = '1px solid rgba(41,182,255,0.35)'
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
