import { useEffect, useRef, useState } from 'react'
import { SERVICES_DATA } from '../data/siteData'
import { scrollToSection } from '../utils/navScroll'
import { useTheme } from '../context/ThemeContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const NAV_OFFSET = 70

function scrollToSlide(i) {
  const info = window.__showcaseInfo
  if (!info || !info.slideEls[i]) return
  const y = info.slideEls[i].getBoundingClientRect().top + window.scrollY - NAV_OFFSET
  window.scrollTo({ top: y, behavior: 'smooth' })
}

const CLICKED_LINK = '#475569'

function ServiceItem({ service, index, registerRef, stackOrder }) {
  const rootRef  = useRef()
  const imageRef = useRef()
  const [clickedLink, setClickedLink] = useState(null)
  const { isDark } = useTheme()
  const prev = SERVICES_DATA[index - 1] || null
  const next = SERVICES_DATA[index + 1] || null

  const setLinkColor = (el, id, hoverColor = '#29b6ff') => {
    if (!el) return
    el.style.color = clickedLink === id ? CLICKED_LINK : hoverColor
  }

  const resetLinkColor = (el, id) => {
    if (!el) return
    el.style.color = clickedLink === id ? CLICKED_LINK : 'var(--text-muted)'
  }

  useEffect(() => {
    registerRef(index, rootRef.current)
    if (!imageRef.current) return
    // Subtle reveal as each image scrolls into view
    const tween = gsap.fromTo(imageRef.current,
      { opacity: 0, scale: 1.05 },
      {
        opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 85%', once: true },
      }
    )
    return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill() }
  }, [index])

  return (
    <div
      ref={rootRef}
      data-index={index}
      id={`service-slide-${index}`}
      className="w-full flex flex-col"
      style={{ margin: 0, padding: 0, paddingBottom: '64px', overflow: 'visible', position: 'relative' }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '21 / 9',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          background: 'var(--bg)',
        }}
      >
        <div ref={imageRef} className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <img
            src={service.imagePath}
            alt={service.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.style.background = '#020509'
            }}
          />
        </div>
      </div>

      <div
        className="relative flex justify-center"
        style={{
          marginTop: '-149px',
          paddingInline: '4%',
          zIndex: stackOrder,
        }}
      >
        <div
          style={{
            width: 'min(92%, 1100px)',
            borderRadius: '16px',
            padding: '16px 26px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(41,182,255,0.05) 50%, rgba(255,255,255,0.04) 100%)',
            backdropFilter: 'blur(48px) saturate(200%) brightness(1.08)',
            WebkitBackdropFilter: 'blur(48px) saturate(200%) brightness(1.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderTop: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 0.5px rgba(41,182,255,0.12)',
          }}
        >
            <div className="flex flex-col gap-4 text-center">
              <div>
                <h2 className="text-lg font-bold leading-tight mb-1" style={{ color: 'var(--text-title)' }}>
                  {service.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  {service.description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-5 flex-wrap">
                <button
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                  style={{
                    color: clickedLink === 'back' ? CLICKED_LINK : 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => setLinkColor(e.currentTarget, 'back')}
                  onMouseLeave={(e) => resetLinkColor(e.currentTarget, 'back')}
                  onClick={() => {
                    setClickedLink('back')
                    if (prev) {
                      scrollToSlide(index - 1)
                    } else {
                      scrollToSection('services-showcase')
                    }
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M11 6.5H2M5 10L1.5 6.5 5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {prev ? `Back: ${prev.title}` : 'Back: Our Services'}
                </button>

                {next && (
                  <button
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                    style={{
                      color: clickedLink === 'next' ? CLICKED_LINK : '#29b6ff',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => setLinkColor(e.currentTarget, 'next', isDark ? '#b3ff71' : '#29b6ff')}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = clickedLink === 'next' ? CLICKED_LINK : '#29b6ff'
                    }}
                    onClick={() => {
                      setClickedLink('next')
                      scrollToSlide(index + 1)
                    }}
                  >
                    Next: {next.title}
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default function ServicesShowcase() {
  const sectionRef = useRef()
  const slideEls   = useRef([])
  const activeRef  = useRef(0)

  const registerRef = (i, el) => { slideEls.current[i] = el }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    window.__showcaseInfo = {
      sectionEl: section,
      totalSlides: SERVICES_DATA.length,
      slideEls: slideEls.current,
    }

    const handleScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2
      let best = 0, bestDist = Infinity
      slideEls.current.forEach((el, i) => {
        if (!el) return
        const center = el.offsetTop + el.offsetHeight / 2
        const dist = Math.abs(center - mid)
        if (dist < bestDist) { bestDist = dist; best = i }
      })
      if (best !== activeRef.current) {
        activeRef.current = best
        window.dispatchEvent(new CustomEvent('serviceChange', { detail: { index: best } }))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      delete window.__showcaseInfo
    }
  }, [])

  return (
    <section
      id="services-showcase"
      ref={sectionRef}
      className="relative w-full flex flex-col items-center"
      style={{ background: 'var(--bg)', gap: 0, margin: 0, paddingTop: '2.26vh', paddingBottom: '3.21vh', overflow: 'visible' }}
    >
      <div
        className="w-full max-w-7xl mx-auto px-4 relative z-10 text-center"
        style={{ marginBottom: '8px' }}
      >
        <p className="section-label text-[10px] tracking-[0.4em] uppercase mb-2 font-light">
          Solutions We Offer
        </p>
        <h2 className="gradient-title text-3xl md:text-4xl font-bold">
          Our Services
        </h2>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'visible' }}>
        {SERVICES_DATA.map((service, i) => (
          <ServiceItem
            key={service.linkRoute}
            service={service}
            index={i}
            registerRef={registerRef}
            stackOrder={SERVICES_DATA.length - i}
          />
        ))}
      </div>
    </section>
  )
}

