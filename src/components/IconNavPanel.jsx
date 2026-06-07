import { SERVICES_DATA } from '../data/siteData'
import { scrollToService } from '../utils/navScroll'
import { useTheme } from '../context/ThemeContext'
import {
  getGlassMenuStyle,
  GLASS_MENU_BORDER,
  GLASS_MENU_HOVER_BG,
  GLASS_MENU_HOVER_SHADOW,
} from '../utils/menuGlassStyles'

const SCALE = 1.15

export function ServicesIconMenu({
  onSelect,
  scale = SCALE,
  showTopFade = true,
  borderRadius = '0 0 20px 20px',
  showTitle = true,
  forceDark = false,
}) {
  const handleSelect = onSelect ?? scrollToService
  const { isDark } = useTheme()
  const isLightMenu = !isDark && !forceDark
  const isDarkMenu = isDark || forceDark
  const glassStyle = getGlassMenuStyle(isLightMenu)

  return (
    <div
      className={`relative overflow-hidden${forceDark ? ' services-menu-dark' : ''}${isLightMenu ? ' services-menu-light' : ''}`}
      style={{
        width: `min(${Math.round(1100 * scale)}px, 92vw)`,
        ...glassStyle,
        transition: 'background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease, color 0.45s ease',
        borderTop: showTopFade ? 'none' : GLASS_MENU_BORDER,
        borderRadius,
        padding: `${Math.round(32 * scale * 0.7)}px ${Math.round(28 * scale * 0.7)}px ${Math.round(22 * scale * 0.7)}px`,
        ...(showTopFade
          ? {
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.58) 14%, black 36%, black 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.58) 14%, black 36%, black 100%)',
            }
          : {}),
      }}
    >
      <div className="relative">
        {showTitle && (
          <p
            className="section-label text-center text-[10px] tracking-[0.4em] font-light"
            style={{
              color: isDarkMenu ? '#ffffff' : 'rgba(15, 23, 42, 0.88)',
              marginBottom: `${Math.round(16 * scale * 0.7)}px`,
            }}
          >
            Services We Offer
          </p>
        )}

        <div className="grid grid-cols-4 md:grid-cols-8" style={{ gap: `${Math.round(8 * scale * 0.9)}px` }}>
          {SERVICES_DATA.map((service, index) => (
            <button
              key={service.linkRoute}
              type="button"
              onClick={() => handleSelect(index)}
              className="group flex flex-col items-center rounded-xl transition-all duration-300 hover:scale-[1.07] cursor-pointer"
              style={{
                background: 'transparent',
                border: 'none',
                gap: `${Math.round(6 * scale * 0.9)}px`,
                padding: `${Math.round(8 * scale * 0.9)}px`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GLASS_MENU_HOVER_BG
                e.currentTarget.style.boxShadow = GLASS_MENU_HOVER_SHADOW
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <img
                src={service.iconPath}
                alt={service.title}
                className="w-full object-contain transition-all duration-300 group-hover:scale-[1.14]"
                style={{ maxWidth: `${Math.round(120 * scale)}px`, height: 'auto' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span
                className={`text-center font-medium leading-tight transition-colors duration-200${isDarkMenu ? ' group-hover:text-white' : ' group-hover:text-[#29b6ff]'}`}
                style={{
                  fontSize: `${0.75 * scale}rem`,
                  color: isDarkMenu ? 'rgba(255,255,255,0.88)' : 'rgba(15, 23, 42, 0.88)',
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
  )
}

export default function IconNavPanel() {
  return (
    <section
      id="services-nav"
      className="relative z-20 flex flex-col items-center px-4 pt-0 pb-0"
      style={{ background: 'transparent', overflow: 'visible', marginTop: '85px', marginBottom: '-70px' }}
    >
      <ServicesIconMenu showTopFade />
    </section>
  )
}
