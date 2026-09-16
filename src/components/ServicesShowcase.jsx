import { useCallback, useEffect, useRef, useState } from 'react'
import { SERVICES_DATA } from '../data/siteData'
import { getServiceScrollOffset, scrollToSection, scrollToService } from '../utils/navScroll'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP_QUERY = '(min-width: 1280px)'
const LAST_INDEX = SERVICES_DATA.length - 1

function scrollToSlide(i) {
  scrollToService(i)
}

function clampIndex(index) {
  return Math.max(0, Math.min(LAST_INDEX, index))
}

function useDesktopShowcase() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

const CLICKED_LINK = '#475569'
const GLASS_DIALOGUE_STYLE = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 50%, rgba(248,250,252,0.9) 100%)',
  backdropFilter: 'blur(48px) saturate(180%)',
  WebkitBackdropFilter: 'blur(48px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.98)',
  borderTop: '1px solid #ffffff',
  boxShadow: '0 8px 40px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(15,23,42,0.05)',
}

function ServiceListItem({ service, index, registerRef }) {
  const rootRef = useRef()

  useEffect(() => {
    registerRef(index, rootRef.current)
  }, [index, registerRef])

  return (
    <article
      ref={rootRef}
      id={`service-slide-${index}`}
      className="service-list-item"
    >
      <div className="service-list-media">
        <img
          src={service.imagePath}
          alt={service.title}
          className="service-list-image"
          loading={index === 0 ? 'eager' : 'lazy'}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.style.background = '#020509'
          }}
        />
      </div>
      <div className="service-list-copy">
        <h3 className="service-list-title">{service.title}</h3>
        <p className="service-list-description">{service.description}</p>
      </div>
    </article>
  )
}

function ServiceItem({ service, index, registerRef, stackOrder, isActive }) {
  const rootRef = useRef()
  const imageRef = useRef()
  const [clickedLink, setClickedLink] = useState(null)
  const prev = SERVICES_DATA[index - 1] || null
  const next = SERVICES_DATA[index + 1] || null

  const setLinkColor = (el, id, hoverColor = '#29b6ff') => {
    if (!el) return
    el.style.color = clickedLink === id ? CLICKED_LINK : hoverColor
  }

  const resetLinkColor = (el, id) => {
    if (!el) return
    el.style.color = clickedLink === id ? CLICKED_LINK : '#64748b'
  }

  useEffect(() => {
    registerRef(index, rootRef.current)
    if (!imageRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) {
      imageRef.current.style.opacity = '1'
      return undefined
    }
    const tween = gsap.fromTo(imageRef.current,
      { opacity: 0, scale: 1.05 },
      {
        opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 85%', once: true },
      }
    )
    return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill() }
  }, [index, registerRef])

  return (
    <div
      ref={rootRef}
      data-index={index}
      id={`service-slide-${index}`}
      className="w-full flex flex-col pb-10 md:pb-16"
      style={{ margin: 0, overflow: 'visible', position: 'relative' }}
    >
      <div
        className="service-slide-media w-full relative overflow-hidden"
        style={{ boxSizing: 'border-box', background: 'var(--bg)' }}
      >
        <div ref={imageRef} className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <img
            src={service.imagePath}
            alt={service.title}
            className="w-full h-full object-cover object-center lg:object-contain"
            loading={index === 0 ? 'eager' : 'lazy'}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.style.background = '#020509'
            }}
          />
        </div>
      </div>

      <div
        className="relative flex justify-center px-3 sm:px-4 md:px-0 mt-5 sm:mt-6 md:-mt-44 lg:-mt-64 xl:-mt-[309px]"
        style={{
          zIndex: stackOrder,
        }}
      >
        <div
          className="w-full max-w-[1430px] rounded-2xl md:rounded-[21px] p-[21px] sm:p-[26px] md:px-[34px] md:py-[21px] transition-shadow duration-300"
          style={{
            ...GLASS_DIALOGUE_STYLE,
            boxShadow: isActive
              ? '0 10px 44px rgba(15,23,42,0.16), 0 0 0 1px rgba(41,182,255,0.18)'
              : GLASS_DIALOGUE_STYLE.boxShadow,
          }}
        >
            <div className="flex flex-col gap-5 sm:gap-6 text-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold leading-tight mb-2 sm:mb-1" style={{ color: '#176fb4' }}>
                  {service.title}
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: '#475569' }}>
                  {service.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-5">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors duration-200 sm:whitespace-nowrap"
                  style={{
                    color: clickedLink === 'back' ? CLICKED_LINK : '#64748b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    minHeight: 44,
                    minWidth: 44,
                    padding: '10px 12px',
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
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors duration-200 sm:whitespace-nowrap"
                    style={{
                      color: clickedLink === 'next' ? CLICKED_LINK : '#29b6ff',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      minHeight: 44,
                      minWidth: 44,
                      padding: '10px 12px',
                    }}
                    onMouseEnter={(e) => setLinkColor(e.currentTarget, 'next', '#29b6ff')}
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
  const slideEls = useRef([])
  const activeRef = useRef(0)
  const isDesktop = useDesktopShowcase()
  const [activeIndex, setActiveIndex] = useState(0)

  const registerRef = useCallback((i, el) => { slideEls.current[i] = el }, [])

  const setActive = useCallback((index) => {
    const next = clampIndex(index)
    if (next === activeRef.current) return
    activeRef.current = next
    setActiveIndex(next)
    window.dispatchEvent(new CustomEvent('serviceChange', { detail: { index: next } }))
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const goToIndex = (index) => {
      const next = clampIndex(index)
      activeRef.current = next
      setActiveIndex(next)
      window.dispatchEvent(new CustomEvent('serviceChange', { detail: { index: next } }))

      const el = slideEls.current[next]
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - getServiceScrollOffset()
        window.scrollTo({ top: y, behavior: 'smooth' })
        return
      }
      scrollToSection('services-showcase')
    }

    window.__showcaseInfo = {
      sectionEl: section,
      totalSlides: SERVICES_DATA.length,
      slideEls: slideEls.current,
      goToIndex,
    }

    const handleScroll = () => {
      const mid = window.innerHeight * 0.42
      let best = 0
      let bestDist = Infinity
      slideEls.current.forEach((el, i) => {
        if (!el) return
        const center = el.getBoundingClientRect().top + el.offsetHeight / 2
        const dist = Math.abs(center - mid)
        if (dist < bestDist) { bestDist = dist; best = i }
      })
      setActive(best)
    }

    const handleKey = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return
      const rect = section.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.25
      if (!inView) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToIndex(activeRef.current + 1)
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToIndex(activeRef.current - 1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKey)
    handleScroll()

    const hash = window.location.hash
    const match = hash.match(/^#service-(?:slide-)?(\d+)$/)
    if (match) goToIndex(Number(match[1]))

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKey)
      delete window.__showcaseInfo
    }
  }, [setActive])

  return (
    <section
      id="services-showcase"
      ref={sectionRef}
      className="relative w-full flex flex-col items-center"
      style={{
        background: 'var(--bg)',
        gap: 0,
        margin: 0,
        paddingTop: '2.26vh',
        paddingBottom: 'clamp(48px, 8vh, 140px)',
        overflow: 'visible',
      }}
    >
      <div
        className="w-full max-w-7xl mx-auto px-4 relative z-10 text-center"
        style={{ marginBottom: isDesktop ? '8px' : '12px' }}
      >
        <p className="section-label section-heading__label uppercase mb-2">
          Solutions We Offer
        </p>
        <h2 className="gradient-title section-heading__title">
          Our Services
        </h2>
      </div>

      {isDesktop ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'visible' }}>
          {SERVICES_DATA.map((service, i) => (
            <ServiceItem
              key={service.title}
              service={service}
              index={i}
              registerRef={registerRef}
              stackOrder={SERVICES_DATA.length - i}
              isActive={activeIndex === i}
            />
          ))}
        </div>
      ) : (
        <div className="service-list">
          {SERVICES_DATA.map((service, i) => (
            <ServiceListItem
              key={service.title}
              service={service}
              index={i}
              registerRef={registerRef}
            />
          ))}
        </div>
      )}
    </section>
  )
}
