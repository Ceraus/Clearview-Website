import { useState } from 'react'
import SpinningLogoCanvas from './SpinningLogoCanvas'

const OFFICE_IMAGE = '/assets/clearviewglobal-facade-blueprint.webp'
const WORDMARK = '/assets/clearview-earth-logo-textonly.png'

export default function CompanyMission() {
  const [imageActive, setImageActive] = useState(false)

  return (
    <section
      id="company-mission"
      className="company-mission relative px-4"
      style={{ background: 'var(--bg)', marginTop: 0 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="company-fold">
          <div
            className="company-blueprint shrink-0 rounded-2xl transition-all duration-300"
            style={{
              border: imageActive ? '1px solid rgba(41,182,255,0.42)' : '1px solid rgba(41,182,255,0.15)',
              boxShadow: imageActive
                ? '0 12px 48px rgba(15,23,42,0.18), 0 0 0 1px rgba(41,182,255,0.12)'
                : '0 8px 48px rgba(0,0,0,0.45)',
            }}
            onMouseEnter={() => setImageActive(true)}
            onMouseLeave={() => setImageActive(false)}
          >
            <img
              src={OFFICE_IMAGE}
              alt="United Charities Building facade elevation at 287 Park Ave"
              className="company-blueprint-image"
              fetchPriority="high"
            />
          </div>

          <div className="company-copy">
            <div className="company-identity flex flex-col items-center w-full text-center">
              <div className="company-identity-mark flex items-center justify-center">
                <SpinningLogoCanvas
                  maxWidth="var(--company-logo-size)"
                  height="var(--company-logo-size)"
                  marginBottom="0"
                />
                <img
                  src={WORDMARK}
                  alt=""
                  className="company-wordmark object-contain self-center"
                />
              </div>
              <p
                className="section-label section-heading__label uppercase font-light"
                style={{ margin: '8px 0 0' }}
              >
                Who We Are
              </p>
              <h1 className="gradient-title company-heading font-bold leading-snug">
                Our Company, Mission & Perspective
              </h1>
            </div>

            <div
              className="company-body rounded-2xl p-5 sm:p-8 lg:p-10 w-full"
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
