import { useEffect, useState } from 'react'

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
      setProgress(Math.min(1, Math.max(0, ratio)))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0"
      style={{
        top: '64px',
        height: '3px',
        zIndex: 60,
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background:
            'linear-gradient(90deg, rgba(41,182,255,0.85) 0%, rgba(179,255,113,0.85) 100%)',
          boxShadow: '0 0 14px rgba(41,182,255,0.85), 0 0 6px rgba(179,255,113,0.6)',
          transition: 'width 0.12s linear',
        }}
      />
    </div>
  )
}
