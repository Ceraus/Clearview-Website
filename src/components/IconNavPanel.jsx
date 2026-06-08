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
const SUBMENU_ICON_SIZE = 140
const SUBMENU_COLS = 4
const SUBMENU_EDGE_SPACING_RATIO = 0.2

export function ServicesIconMenu({
  onSelect,
  scale = SCALE,
  showTopFade = true,
  borderRadius = '0 0 20px 20px',
  showTitle = true,
  forceDark = false,
  layout = 'grid',
}) {
  const handleSelect = onSelect ?? scrollToService
  const { isDark } = useTheme()
  const isLightMenu = !isDark && !forceDark
  const isDarkMenu = isDark || forceDark
  const glassStyle = getGlassMenuStyle(isLightMenu)
  const isSubmenu = layout === 'column'
  const baseItemGap = Math.round(8 * scale * 0.9)
  const baseItemPadding = Math.round(8 * scale * 0.9)
  const itemGap = isSubmenu ? Math.round(baseItemGap * 0.5) : baseItemGap
  const itemPadding = isSubmenu ? Math.round(baseItemPadding * 0.25) : baseItemPadding
  const submenuEdgeSpacing = Math.round(SUBMENU_ICON_SIZE * SUBMENU_EDGE_SPACING_RATIO)
  const submenuWidth = SUBMENU_ICON_SIZE * SUBMENU_COLS + itemGap * (SUBMENU_COLS - 1) + submenuEdgeSpacing * 2
  const submenuTextPull = Math.round(6 * scale * 0.9 * 0.4)

  return (
    <div
      className={`relative overflow-hidden${forceDark ? ' services-menu-dark' : ''}${isLightMenu ? ' services-menu-light' : ''}`}
      style={{
        width: isSubmenu ? `${submenuWidth}px` : `min(${Math.round(1100 * scale)}px, 92vw)`,
        minWidth: isSubmenu ? `${submenuWidth}px` : undefined,
        ...glassStyle,
        transition: 'background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease, color 0.45s ease',
        borderTop: showTopFade ? 'none' : GLASS_MENU_BORDER,
        borderRadius,
        padding: isSubmenu
          ? `${submenuEdgeSpacing}px`
          : `${Math.round(32 * scale * 0.7)}px ${Math.round(28 * scale * 0.7)}px ${Math.round(22 * scale * 0.7)}px`,
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
              marginBottom: `${Math.round(isSubmenu ? 12 : 16 * scale * 0.7)}px`,
            }}
          >
            Solutions We Offer
          </p>
        )}

        <div
          className={isSubmenu ? 'grid grid-cols-4' : 'grid grid-cols-4 md:grid-cols-8'}
          style={{ gap: `${itemGap}px` }}
        >
          {SERVICES_DATA.map((service, index) => (
            <button
              key={service.linkRoute}
              type="button"
              onClick={() => handleSelect(index)}
              className={`group flex flex-col items-center rounded-xl transition-all duration-300 hover:scale-[1.07] cursor-pointer${isSubmenu ? ' w-full' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                gap: isSubmenu ? '0' : `${Math.round(6 * scale * 0.9)}px`,
                padding: `${itemPadding}px`,
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
                className={`object-contain transition-all duration-300 group-hover:scale-[1.14]${isSubmenu ? '' : ' w-full'}`}
                style={isSubmenu
                  ? {
                      display: 'block',
                      width: `${SUBMENU_ICON_SIZE}px`,
                      height: `${SUBMENU_ICON_SIZE}px`,
                    }
                  : {
                      maxWidth: `${Math.round(120 * scale)}px`,
                      height: 'auto',
                    }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span
                className={`text-center font-medium transition-colors duration-200${isSubmenu ? ' leading-none' : ' leading-tight'}${isDarkMenu ? ' group-hover:text-white' : ' group-hover:text-[#29b6ff]'}`}
                style={{
                  fontSize: isSubmenu ? `${0.68 * scale}rem` : `${0.75 * scale}rem`,
                  color: isDarkMenu ? 'rgba(255,255,255,0.88)' : 'rgba(15, 23, 42, 0.88)',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  ...(isSubmenu
                    ? {
                        lineHeight: 1,
                        marginTop: `-${Math.max(submenuTextPull, 4)}px`,
                      }
                    : {}),
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
