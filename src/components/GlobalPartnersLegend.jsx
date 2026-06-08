export default function GlobalPartnersLegend() {
  return (
    <div
      className="inline-flex items-center mt-[15px]"
      style={{
        gap: '9px',
        padding: '9px 13px',
        borderRadius: '12px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 50%, rgba(41,182,255,0.04) 100%)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderTop: '1px solid rgba(255,255,255,0.34)',
        boxShadow: '0 7px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          flexShrink: 0,
          background: 'radial-gradient(circle at 35% 35%, #29b6ff 0%, #176fb4 45%, #0d4f7a 100%)',
          boxShadow: '0 0 8px rgba(23,111,180,0.85), 0 0 14px rgba(23,111,180,0.35)',
        }}
      />
      <span
        className="font-medium uppercase whitespace-nowrap"
        style={{
          fontSize: '9px',
          letterSpacing: '0.202em',
          color: 'rgba(255,255,255,0.88)',
        }}
      >
        Our Current Global Partners
      </span>
    </div>
  )
}
