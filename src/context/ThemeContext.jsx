import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext({ isDark: false, toggle: () => {} })

export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.dataset.theme = 'light'
    localStorage.setItem('cg-theme', 'light')
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark: false, toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
