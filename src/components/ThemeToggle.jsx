import { useTheme } from '../context/ThemeContext'

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed z-[60] flex items-center gap-2 transition-all duration-300 hover:scale-105"
      style={{
        top: '76px',
        right: '16px',
        padding: '7px 13px',
        borderRadius: '999px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border-md)',
        boxShadow: '0 4px 20px var(--shadow)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#29b6ff' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
