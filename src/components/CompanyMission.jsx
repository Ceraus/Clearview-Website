import { useState } from 'react'
import SpinningLogoCanvas from './SpinningLogoCanvas'
import { NAV_BAR_HEIGHT } from '../constants/layout'

const OFFICE_IMAGE = '/assets/clearviewglobal-facade-blueprint.png'
const WORDMARK = '/assets/clearview-earth-logo-textonly.png'

export default function CompanyMission() {
  const [imageActive, setImageActive] = useState(false)

  return (
    <section
      id="company-mission"
      className="relative px-4"
      style={{
        background: 'var(--bg)',
        marginTop: 0,
        paddingTop: `${NAV_BAR_HEIGHT + 88}px`,
        paddingBottom: '140px',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          <div
            className="md:w-[42%] shrink-0 overflow-hidden rounded-2xl transition-all duration-300"
            style={{
              border: imageActive ? '1px solid rgba(41,182,255,0.42)' : '1px solid rgba(41,182,255,0.15)',
              boxShadow: imageActive
                ? '0 12px 48px rgba(15,23,42,0.18), 0 0 0 1px rgba(41,182,255,0.12)'
                : '0 8px 48px rgba(0,0,0,0.45)',
              minHeight: '280px',
            }}
            onMouseEnter={() => setImageActive(true)}
            onMouseLeave={() => setImageActive(false)}
          >
            <img
              src={OFFICE_IMAGE}
              alt="United Charities Building facade elevation at 287 Park Ave"
              className="w-full h-full min-h-[280px] object-cover object-top transition-transform duration-500"
              style={{ transform: imageActive ? 'scale(1.02)' : 'scale(1)' }}
              loading="lazy"
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-col items-center w-full text-center">
              <div className="flex items-center justify-center" style={{ gap: 0 }}>
                <SpinningLogoCanvas
                  maxWidth="min(7.7vw, 84px)"
                  height="min(7.7vw, 84px)"
                  marginBottom="0"
                />
                <img
                  src={WORDMARK}
                  alt="Clearview Global"
                  className="object-contain self-center"
                  style={{
                    display: 'block',
                    height: 'min(9.5vw, 72px)',
                    width: 'auto',
                    maxWidth: 'min(48vw, 220px)',
                    margin: 0,
                    padding: 0,
                    transform: 'translate(-10px, 8px)',
                  }}
                />
              </div>
              <p
                className="section-label text-[10px] tracking-[0.4em] uppercase font-light"
                style={{ margin: '6px 0 0' }}
              >
                Who We Are
              </p>
              <h2 className="gradient-title text-2xl md:text-3xl font-bold leading-snug mb-6 md:mb-8 mt-2">
                Our Company, Mission & Perspective
              </h2>
            </div>

            <div
              className="rounded-2xl p-8 md:p-10 w-full"
              style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border-md)',
                boxShadow: '0 12px 64px var(--shadow), 0 4px 24px var(--shadow)',
              }}
            >
              <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-body)' }}>
                Born in Manhattan (2009), Clearview Global was built on a single core belief: technology isn&apos;t an operational expense—it&apos;s your greatest strategic asset. Functioning as your extended team, our collective of system architects, cybersecurity experts, and tech strategists operates as a seamless extension of your organization. We prioritize architectural foresight over firefights, anticipating shifts, engineering secure infrastructure, and stopping issues before they disrupt your operations. The result is zero friction and total clarity; by proactively securing and managing enterprise-grade IT, we eliminate downtime and cyber threats, turning your tech stack into a definitive competitive advantage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
