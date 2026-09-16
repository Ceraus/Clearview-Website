import { useRef, useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

// A dynamic section divider that straddles the seam between two sections. The
// top edge of the next-section fill is a live wavy line that ebbs and flows.
export default function PlexusDivider({
  height = 200,
  overlap = 200,
  darkColor = '#020509',
  lightColor = '#f8fafc',
}) {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const apply = () => setCompact(query.matches)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  const dividerHeight = compact ? Math.min(height, 96) : height
  const dividerOverlap = compact ? Math.min(overlap, 96) : overlap

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')

    const sectionColor = isDark ? darkColor : lightColor
    const LINE = '41,182,255'
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    let raf = 0
    let w = 0
    let h = 0
    let pts = []

    const build = () => {
      const segCount = Math.max(6, Math.round(w / 150))
      pts = []
      for (let i = 0; i <= segCount; i++) {
        pts.push({
          x: (w * i) / segCount,
          baseY: h * 0.6,
          phase: Math.random() * Math.PI * 2,
          amp: 18 + Math.random() * 20,
          speed: 0.25 + Math.random() * 0.4,
        })
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    const borderPath = (border) => {
      ctx.beginPath()
      ctx.moveTo(border[0].x, border[0].y)
      for (let i = 1; i < border.length; i++) {
        const xc = (border[i - 1].x + border[i].x) / 2
        const yc = (border[i - 1].y + border[i].y) / 2
        ctx.quadraticCurveTo(border[i - 1].x, border[i - 1].y, xc, yc)
      }
      ctx.lineTo(border[border.length - 1].x, border[border.length - 1].y)
    }

    const draw = (t) => {
      const time = reduce ? 0 : t * 0.001
      ctx.clearRect(0, 0, w, h)

      const border = pts.map((p) => ({
        x: p.x,
        y: p.baseY + Math.sin(time * p.speed + p.phase) * p.amp,
      }))

      // Fill the next-section color below the live border edge.
      borderPath(border)
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fillStyle = sectionColor
      ctx.fill()

      // Glowing brand-gradient border line.
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, 'rgba(41,182,255,0.7)')
      grad.addColorStop(1, 'rgba(179,255,113,0.7)')
      borderPath(border)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.5
      ctx.shadowColor = `rgba(${LINE},0.85)`
      ctx.shadowBlur = 14
      ctx.stroke()
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [isDark, darkColor, lightColor, dividerHeight])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        height: `${dividerHeight}px`,
        marginTop: `-${dividerOverlap}px`,
        marginBottom: 0,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
