import GlobalPartnersLegend from './GlobalPartnersLegend'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full z-10 flex flex-col items-center justify-center overflow-hidden"
      style={{ height: '51.42vh', minHeight: '378px', background: 'transparent', pointerEvents: 'none' }}
    >
      <img
        src="/assets/clearviewlogo.png"
        alt="Clearview Global"
        className="relative z-10 w-auto object-contain"
        style={{
          height: 'clamp(78px, 12.42vh, 130px)',
          filter: 'drop-shadow(0 0 32px rgba(41,182,255,0.55)) drop-shadow(0 4px 18px rgba(0,0,0,0.8))',
        }}
      />
      <GlobalPartnersLegend />
    </section>
  )
}
