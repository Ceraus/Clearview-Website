import { NAV_BAR_HEIGHT, NAV_SCROLL_OFFSET } from '../constants/layout'

export function getServiceScrollOffset() {
  return NAV_BAR_HEIGHT + 8
}

export function scrollToSection(id, offset = NAV_SCROLL_OFFSET) {
  const el = document.getElementById(id)
  if (!el) return false
  const y = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: y, behavior: 'smooth' })
  return true
}

export function scrollToService(index, offset) {
  const info = window.__showcaseInfo
  const useOffset = offset ?? getServiceScrollOffset()
  if (info?.slideEls?.[index]) {
    const y = info.slideEls[index].getBoundingClientRect().top + window.scrollY - useOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    return true
  }
  return scrollToSection('services-showcase', useOffset)
}

