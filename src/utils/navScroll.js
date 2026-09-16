import { NAV_SCROLL_OFFSET } from '../constants/layout'

export function getNavScrollOffset() {
  const nav = document.querySelector('[data-site-nav]')
  const height = nav?.getBoundingClientRect().height
  if (height) return Math.round(height + 1)
  return NAV_SCROLL_OFFSET
}

export function getServiceScrollOffset() {
  return getNavScrollOffset()
}

export function scrollToSection(id, offset = getNavScrollOffset()) {
  const el = document.getElementById(id)
  if (!el) return false
  const y = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: y, behavior: 'smooth' })
  return true
}

export function scrollToService(index, offset) {
  const info = window.__showcaseInfo
  const useOffset = offset ?? getServiceScrollOffset()
  if (typeof info?.goToIndex === 'function') {
    info.goToIndex(index)
    return true
  }
  if (info?.slideEls?.[index]) {
    const y = info.slideEls[index].getBoundingClientRect().top + window.scrollY - useOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    return true
  }
  return scrollToSection('services-showcase', useOffset)
}
