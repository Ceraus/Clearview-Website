export function getGlassMenuStyle(isLight) {
  return {
    background: isLight ? 'rgba(255, 255, 255, 0.825)' : 'rgba(3, 7, 20, 0.825)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(41,182,255,0.23)',
    boxShadow: '0 4px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
  }
}

export const GLASS_MENU_BORDER = '1px solid rgba(41,182,255,0.23)'

export const GLASS_MENU_HOVER_BG = 'rgba(41,182,255,0.126)'

export const GLASS_MENU_HOVER_SHADOW = '0 0 25px rgba(41,182,255,0.168)'
