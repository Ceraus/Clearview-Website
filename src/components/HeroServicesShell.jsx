import HeroEarthCanvas from './HeroEarthCanvas'
import HeroSection from './HeroSection'
import IconNavPanel from './IconNavPanel'

export default function HeroServicesShell() {
  return (
    <div className="relative w-full overflow-x-hidden" style={{ background: '#020509', overflowY: 'visible' }}>
      <div className="absolute inset-0 pointer-events-none">
        <HeroEarthCanvas />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 8% 50%, rgba(2,5,20,0.5) 0%, transparent 45%), radial-gradient(ellipse at 92% 50%, rgba(2,5,20,0.55) 0%, transparent 45%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-12"
          style={{ background: 'linear-gradient(to bottom, transparent, #020509)' }}
        />
      </div>

      <HeroSection />
      <IconNavPanel />
    </div>
  )
}
