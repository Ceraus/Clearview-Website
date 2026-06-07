import SpinningLogoCanvas from './SpinningLogoCanvas'

const OFFICE_IMAGE = '/assets/clearviewglobal_outside.jpg'

export default function CompanyMission() {
  return (
    <section
      id="company-mission"
      className="relative px-4"
      style={{ background: 'var(--bg)', marginTop: 0, paddingTop: 0, paddingBottom: '80px' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
          <div
            className="md:w-[42%] shrink-0 overflow-hidden rounded-2xl"
            style={{
              border: '1px solid rgba(41,182,255,0.15)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.45)',
              minHeight: '280px',
            }}
          >
            <img
              src={OFFICE_IMAGE}
              alt="Clearview Global office exterior"
              className="w-full h-full min-h-[280px] object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-col items-center w-full text-center">
              <SpinningLogoCanvas
                maxWidth="min(100%, 420px)"
                height="min(14vw, 150px)"
                marginBottom="0"
              />
              <p
                className="section-label text-[10px] tracking-[0.4em] uppercase font-light"
                style={{ margin: '6px 0 0' }}
              >
                Who We Are
              </p>
              <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-6 md:mb-8 mt-2" style={{ color: 'var(--text-title)' }}>
                Our Company, Mission & Perspective
              </h2>
            </div>

            <div
              className="rounded-2xl p-8 md:p-10 flex-1"
              style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border-md)',
                boxShadow: '0 12px 64px var(--shadow), 0 4px 24px var(--shadow)',
              }}
            >
              <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: 'var(--text-body)' }}>
                Founded in Manhattan in 2009, Clearview Global is a premier IT consulting and managed services provider built on a core philosophy: technology should never be viewed merely as an operational cost, but as a strategic asset that unlocks your company&apos;s full potential. We are a dedicated collective of system architects, cybersecurity specialists, and technology strategists who operate as a seamless extension of your organization. Because we believe that reacting to problems is no longer a viable strategy in today&apos;s digital landscape, our approach is rooted in architectural foresight. We have spent over a decade mastering the complexities of digital infrastructure, anticipating technological shifts, and building highly secure, scalable systems so that you don&apos;t have to.
              </p>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-body)' }}>
                Our mission is to eliminate the friction between your business goals and the technology required to achieve them. By designing, securing, and maintaining enterprise-grade IT environments, we deliver proactive, uncompromising support that drives operational efficiency. We transform your IT investments into a definitive competitive advantage, ensuring your leadership team can stop worrying about downtime, complex integrations, or cyber threats. We care about your business, and we are with you for the long haul—empowering you to focus entirely on sustainable growth and market dominance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

