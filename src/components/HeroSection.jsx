export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full z-10 flex items-center justify-center overflow-hidden"
      style={{ height: '27vh', minHeight: '198px', background: 'transparent' }}
    >
      <img
        src="/assets/clearviewlogo.png"
        alt="Clearview Global"
        className="relative z-10 w-auto object-contain"
        style={{
          height: 'clamp(78px, 12.42vh, 130px)',
          transform: 'translateY(30px)',
          filter: 'drop-shadow(0 0 32px rgba(41,182,255,0.55)) drop-shadow(0 4px 18px rgba(0,0,0,0.8))',
        }}
      />
    </section>
  )
}
