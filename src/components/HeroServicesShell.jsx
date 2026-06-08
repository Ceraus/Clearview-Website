import HeroEarthCanvas from './HeroEarthCanvas'
import HeroSection from './HeroSection'

export default function HeroServicesShell() {
  return (
    <div className="relative w-full overflow-x-hidden" style={{ overflowY: 'visible' }}>
      <div className="relative w-full">
        <div className="absolute inset-0 pointer-events-none" style={{ background: '#020509' }}>
          <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 0 }}>
            <HeroEarthCanvas />
          </div>
          <div
            className="absolute inset-0"
            style={{
              zIndex: 1,
              background: 'radial-gradient(ellipse at 8% 50%, rgba(2,5,20,0.5) 0%, transparent 45%), radial-gradient(ellipse at 92% 50%, rgba(2,5,20,0.55) 0%, transparent 45%)',
            }}
          />
        </div>

        <HeroSection />
      </div>
    </div>
  )
}
