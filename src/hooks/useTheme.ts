import { useCallback } from 'react'

export function useTheme() {
  const toggleTheme = useCallback(() => {
    const root = document.documentElement
    const current = root.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'

    const applyTheme = () => {
      root.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
    }

    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      applyTheme()
      return
    }

    document.startViewTransition(applyTheme)
  }, [])

  return { toggleTheme }
}
