import HeroEarthCanvas from './HeroEarthCanvas'
import HeroSection from './HeroSection'

export default function HeroServicesShell() {
  return (
    <div className="relative w-full overflow-x-hidden" style={{ overflowY: 'visible', paddingBottom: 'min(5vh, 45px)' }}>
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: '0 0 50% 50% / 0 0 72px 72px',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: '#020509' }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 38% 38%, #1b4f86 0%, #0a2950 38%, #051022 68%, #020509 100%)',
            }}
          />
          <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 0 }}>
            <HeroEarthCanvas />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              background:
                'radial-gradient(ellipse at 50% 48%, rgba(2,5,12,0.42) 0%, rgba(2,5,9,0.18) 42%, transparent 72%), radial-gradient(ellipse at 8% 50%, rgba(2,5,20,0.5) 0%, transparent 45%), radial-gradient(ellipse at 92% 50%, rgba(2,5,20,0.55) 0%, transparent 45%)',
            }}
          />
        </div>

        <HeroSection />
      </div>
    </div>
  )
}
