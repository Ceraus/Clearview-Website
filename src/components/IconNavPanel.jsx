import { SERVICES_DATA } from '../data/siteData'
import PlexusOverlay from './PlexusOverlay'

function scrollToService(index) {
  const info = window.__showcaseInfo
  if (info?.slideEls?.[index]) {
    const y = info.slideEls[index].getBoundingClientRect().top + window.scrollY - 70
    window.scrollTo({ top: y, behavior: 'smooth' })
    return
  }
  const el = document.getElementById('services-showcase')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const SCALE = 1.15

export default function IconNavPanel() {
  return (
    <section
      id="services-nav"
      className="relative z-20 flex flex-col items-center px-4 pt-0 pb-0"
      style={{ background: 'transparent', overflow: 'visible', marginTop: '15px' }}
    >
      <div
        className="relative overflow-hidden z-10"
        style={{
          width: `min(${Math.round(1100 * SCALE)}px, 92vw)`,
          background: 'rgba(3, 7, 20, 0.42)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(41,182,255,0.18)',
          boxShadow: '0 4px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          borderRadius: '0 0 20px 20px',
          padding: `${Math.round(20 * SCALE)}px ${Math.round(28 * SCALE)}px ${Math.round(22 * SCALE)}px`,
        }}
      >
        <PlexusOverlay className="rounded-b-[20px]" opacity={0.7} nodeCount={81} linkDist={115} />

        <div className="relative" style={{ zIndex: 1 }}>
        <h2
          className="text-center font-bold"
          style={{
            fontSize: `${1.5 * SCALE}rem`,
            letterSpacing: '0.04em',
            color: 'white',
            fontFamily: "'Inter', system-ui, sans-serif",
            marginBottom: `${Math.round(16 * SCALE)}px`,
          }}
        >
          Our Services
        </h2>

        <div className="grid grid-cols-8" style={{ gap: `${Math.round(8 * SCALE)}px` }}>
          {SERVICES_DATA.map((service, index) => (
            <button
              key={service.linkRoute}
              onClick={() => scrollToService(index)}
              className="group flex flex-col items-center rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{ background: 'transparent', border: 'none', gap: `${Math.round(6 * SCALE)}px`, padding: `${Math.round(8 * SCALE)}px` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(41,182,255,0.09)'
                e.currentTarget.style.boxShadow = '0 0 18px rgba(41,182,255,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <img
                src={service.iconPath}
                alt={service.title}
                className="w-full object-contain transition-all duration-300 group-hover:scale-110"
                style={{ maxWidth: `${Math.round(120 * SCALE)}px`, height: 'auto' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span
                className="text-center font-medium leading-tight transition-colors duration-200 group-hover:text-white"
                style={{
                  fontSize: `${0.75 * SCALE}rem`,
                  color: 'rgba(255,255,255,0.65)',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {service.title}
              </span>
            </button>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
