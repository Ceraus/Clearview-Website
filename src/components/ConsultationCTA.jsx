const ACCENT = '#29b6ff'

export default function ConsultationCTA() {
  return (
    <section className="relative px-4" style={{ background: '#020509', paddingTop: '32px', paddingBottom: '32px' }}>
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22` }}
        >
          <h3 className="text-white font-semibold text-sm mb-3">Ready to Get Started?</h3>
          <p className="text-xs leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Our team is ready to assess your needs and deliver a customized solution.
          </p>
          <a
            href="mailto:info@clearviewglobal.com"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-[#03060e] transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT}cc 100%)`,
              boxShadow: `0 4px 18px ${ACCENT}35`,
            }}
          >
            Request a Consultation
          </a>
          <div className="mt-3 flex items-center justify-center">
            <a
              href="tel:2129201234"
              className="text-[10px] transition-colors hover:opacity-80"
              style={{ color: `${ACCENT}70` }}
            >
              212-920-1234
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
