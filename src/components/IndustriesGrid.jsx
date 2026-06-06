import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { INDUSTRIES_DATA } from '../data/siteData'

export default function IndustriesGrid() {
  const location = useLocation()

  useEffect(() => {
    const match = location.hash.match(/^#industry-tile-(\d+)$/)
    if (!match) return undefined
    const index = Number(match[1])
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('industryHighlight', { detail: { index } }))
    }, 450)
    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash])

  return (
    <section
      id="industries"
      className="relative overflow-hidden px-4"
      style={{ background: '#020509', paddingTop: '54px', paddingBottom: '10vh' }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center" style={{ marginBottom: '54px' }}>
          <p className="text-[10px] tracking-[0.4em] uppercase mb-2 font-light" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Who We Serve
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Industries We{' '}
            <span style={{
              background: 'linear-gradient(135deg, #29b6ff 0%, #b3ff71 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Empower
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {INDUSTRIES_DATA.map((industry, index) => (
            <BentoTile key={industry.linkRoute} industry={industry} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BentoTile({ industry, index }) {
  const [hovered, setHovered] = useState(false)
  const [highlighted, setHighlighted] = useState(false)

  useEffect(() => {
    const onHighlight = (e) => {
      if (e.detail?.index !== index) return
      setHighlighted(true)
    }
    window.addEventListener('industryHighlight', onHighlight)
    return () => window.removeEventListener('industryHighlight', onHighlight)
  }, [index])

  useEffect(() => {
    if (!highlighted) return undefined
    const timer = window.setTimeout(() => setHighlighted(false), 3500)
    return () => window.clearTimeout(timer)
  }, [highlighted])

  const tileStyle = highlighted
    ? {
        background: 'rgba(3,7,20,0.95)',
        border: '2px solid rgba(41,182,255,0.85)',
        boxShadow: '0 14px 56px rgba(0,0,0,0.8), 0 0 42px rgba(41,182,255,0.45), 0 0 72px rgba(41,182,255,0.2)',
        transform: 'translateY(-5px) scale(1.02)',
      }
    : hovered
      ? {
          background: 'rgba(3,7,20,0.88)',
          border: '1px solid rgba(41,182,255,0.45)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.7), 0 0 28px rgba(41,182,255,0.1)',
          transform: 'translateY(-2px)',
        }
      : {
          background: 'rgba(3,7,20,0.75)',
          border: '1px solid rgba(41,182,255,0.2)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.55)',
          transform: 'translateY(0)',
        }

  const glowOpacity = highlighted ? 1 : hovered ? 1 : 0
  const glowBackground = highlighted
    ? 'radial-gradient(ellipse at 50% 30%, rgba(41,182,255,0.22) 0%, rgba(41,182,255,0.08) 45%, transparent 72%)'
    : 'radial-gradient(ellipse at 50% 30%, rgba(41,182,255,0.08) 0%, transparent 70%)'
  const baseIconScale = 1.2
  const iconScale = baseIconScale * (highlighted ? 1.1 : hovered ? 1.05 : 1)

  return (
    <div
      id={`industry-tile-${index}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden select-none transition-all duration-300"
      style={{
        ...tileStyle,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {highlighted && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl z-[5]"
          style={{
            boxShadow: 'inset 0 0 32px rgba(41,182,255,0.18)',
          }}
        />
      )}

      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none rounded-2xl z-10"
        style={{
          background: glowBackground,
          opacity: glowOpacity,
        }}
      />

      <span
        className="absolute top-2 right-3 text-sm font-bold select-none z-20 transition-colors duration-300"
        style={{ color: '#b3ff71', fontVariantNumeric: 'tabular-nums' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="relative w-full flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
        <img
          src={industry.iconPath}
          alt={industry.title}
          className="transition-all duration-300"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${iconScale})`,
            filter: highlighted ? 'drop-shadow(0 0 14px rgba(41,182,255,0.55))' : 'none',
          }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      <div
        className="relative z-20 px-3 pb-3 flex flex-col items-center text-center gap-1"
        style={{ marginTop: 'calc(-0.15 * 2.5rem)' }}
      >
        <h3
          className="font-semibold text-sm leading-snug transition-colors duration-300"
          style={{
            color: highlighted ? '#b3ff71' : hovered ? '#29b6ff' : 'white',
            textShadow: highlighted ? '0 0 18px rgba(41,182,255,0.45)' : 'none',
          }}
        >
          {industry.title}
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {industry.description}
        </p>
      </div>
    </div>
  )
}
