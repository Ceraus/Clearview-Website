import HeroEarthCanvas from './HeroEarthCanvas'
import HeroSection from './HeroSection'
import { useTheme } from '../context/ThemeContext'

const HERO_FADE = {
  dark: '#020509',
  light: '#f8fafc',
}

export default function HeroServicesShell() {
  const { isDark } = useTheme()

  return (
    <div className="relative w-full overflow-x-hidden" style={{ overflowY: 'visible' }}>
      <div
        className="relative w-full"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 81%, rgba(0,0,0,0.35) 89%, rgba(0,0,0,0.08) 95%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 81%, rgba(0,0,0,0.35) 89%, rgba(0,0,0,0.08) 95%, transparent 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: '#020509' }}>
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <HeroEarthCanvas />
          </div>
          <div
            className="absolute inset-0"
            style={{
              zIndex: 1,
              background: 'radial-gradient(ellipse at 8% 50%, rgba(2,5,20,0.5) 0%, transparent 45%), radial-gradient(ellipse at 92% 50%, rgba(2,5,20,0.55) 0%, transparent 45%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0" style={{ zIndex: 2, height: '22%' }}>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${HERO_FADE.dark} 100%)`,
                opacity: isDark ? 1 : 0,
                transition: 'opacity 0.45s ease-in-out',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${HERO_FADE.light} 100%)`,
                opacity: isDark ? 0 : 1,
                transition: 'opacity 0.45s ease-in-out',
              }}
            />
          </div>
        </div>

        <HeroSection />
      </div>
    </div>
  )
}
