export function scrollToSection(id, offset = 64) {
  const el = document.getElementById(id)
  if (!el) return false
  const y = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: y, behavior: 'smooth' })
  return true
}

export function scrollToService(index, offset = 70) {
  const info = window.__showcaseInfo
  if (info?.slideEls?.[index]) {
    const y = info.slideEls[index].getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
    return true
  }
  return scrollToSection('services-showcase', offset)
}

export function scrollToIndustry(index, offset = 64) {
  const scrolled = scrollToSection(`industry-tile-${index}`, offset)
  if (!scrolled) scrollToSection('industries', offset)
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('industryHighlight', { detail: { index } }))
  }, 450)
}
