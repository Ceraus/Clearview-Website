import { useEffect, useState } from 'react'
import { getSiteAssetUrls } from '../utils/assetPreload'

export default function AssetPreloader({ children }) {
  const [ready, setReady] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    const urls = getSiteAssetUrls()
    let completed = 0

    const tasks = urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image()
          const finish = () => {
            if (cancelled) return
            completed += 1
            setProgress(completed / urls.length)
            resolve()
          }
          img.onload = finish
          img.onerror = finish
          img.src = url
        }),
    )

    Promise.all(tasks).then(() => {
      if (!cancelled) {
        setProgress(1)
        setReady(true)
      }
    })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    const timer = setTimeout(() => setShowOverlay(false), 650)
    return () => clearTimeout(timer)
  }, [ready])

  return (
    <>
      {children}

      {showOverlay && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: ready ? 'rgba(2,5,9,0)' : 'rgba(2,5,9,0.72)',
            backdropFilter: ready ? 'blur(0px)' : 'blur(16px)',
            WebkitBackdropFilter: ready ? 'blur(0px)' : 'blur(16px)',
            opacity: ready ? 0 : 1,
            transition: 'opacity 0.55s ease, backdrop-filter 0.65s ease, -webkit-backdrop-filter 0.65s ease, background 0.55s ease',
            pointerEvents: ready ? 'none' : 'auto',
          }}
        >
          <img
            src="/assets/clearviewlogo.svg"
            alt="Clearview Global"
            className="mb-8 object-contain"
            style={{
              width: 'min(220px, 52vw)',
              filter: 'drop-shadow(0 0 24px rgba(41,182,255,0.45))',
            }}
          />
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: 'min(240px, 60vw)',
              height: '3px',
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                width: `${Math.round(progress * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #29b6ff 0%, #b3ff71 100%)',
                transition: 'width 0.25s ease',
              }}
            />
          </div>
          <p
            className="mt-4 text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Loading {Math.round(progress * 100)}%
          </p>
        </div>
      )}
    </>
  )
}
