import { Link } from 'react-router-dom'
import { SERVICES_DATA, INDUSTRIES_DATA } from '../data/siteData'

export default function SubPage({ type, slug }) {
  const allData = type === 'service' ? SERVICES_DATA : INDUSTRIES_DATA
  const routeBase = type === 'service' ? '/services/' : '/industries/'
  const accentColor = type === 'service' ? '#29b6ff' : '#b3ff71'

  const item = allData.find((d) => d.linkRoute === `${routeBase}${slug}`)

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#03060e' }}>
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <Link to="/" className="text-sm transition-colors hover:opacity-80" style={{ color: '#29b6ff' }}>← Back to Home</Link>
      </div>
    )
  }

  const others = allData.filter((d) => d.linkRoute !== item.linkRoute).slice(0, 3)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #03060e 0%, #050a14 100%)' }}>

      <div className="relative min-h-[52vh] flex items-end overflow-hidden">
        {item.imagePath && (
          <>
            <img src={item.imagePath} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-25" onError={(e) => { e.target.style.display = 'none' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(3,6,14,0.55) 0%, rgba(3,6,14,0.8) 55%, #03060e 100%)' }} />
          </>
        )}
        {!item.imagePath && (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #050f28 0%, #0a1e42 50%, #040c1c 100%)' }} />
        )}

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-14 w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-xs mb-8 transition-colors hover:opacity-80 group" style={{ color: 'rgba(41,182,255,0.65)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.5 7H2.5M6 3.5l-3.5 3.5L6 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 rounded-full" style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }} />
            <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: `${accentColor}80` }}>
              {type === 'service' ? 'Service' : 'Industry'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">{item.title}</h1>

          {item.iconPath && (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
              style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}>
              <img src={item.iconPath} alt={item.title} className="w-8 h-8 object-contain"
                style={{ filter: 'brightness(0) saturate(100%) invert(60%) sepia(80%) saturate(400%) hue-rotate(170deg) brightness(120%)' }}
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          <div className="md:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-5">Overview</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {['Rapid Deployment', 'Enterprise-Grade Security', '24/7 Support', 'Scalable Solutions'].map((feat) => (
                <div key={feat} className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accentColor}22` }}>
              <h3 className="text-white font-semibold text-sm mb-3">Ready to Get Started?</h3>
              <p className="text-xs leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Our team is ready to assess your needs and deliver a customized solution.
              </p>
              <a
                href="mailto:info@clearviewglobal.com"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-[#03060e] transition-all duration-300 hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`, boxShadow: `0 4px 18px ${accentColor}35` }}
              >
                Request a Consultation
              </a>
              <div className="mt-3 flex items-center justify-center">
                <a href="tel:2129201234" className="text-[10px] transition-colors hover:opacity-80" style={{ color: `${accentColor}70` }}>
                  212-920-1234
                </a>
              </div>
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <div>
            <h3 className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {type === 'service' ? 'Other Services' : 'Other Industries'}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {others.map((other) => (
                <Link
                  key={other.linkRoute}
                  to={other.linkRoute}
                  className="group p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = `1px solid ${accentColor}25`
                    e.currentTarget.style.background = `${accentColor}0d`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  }}
                >
                  <h4 className="text-white/75 text-xs font-medium mb-2 transition-colors group-hover:text-white">{other.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{other.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] transition-colors" style={{ color: `${accentColor}70` }}>
                    Learn More
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5h8M6.5 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
