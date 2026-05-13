import { useEffect, useRef } from 'react'

export function useCustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor || !window.matchMedia('(pointer: fine)').matches) return

    let rafPending = false
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2

    const handleMouseMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (!rafPending) {
        rafPending = true
        requestAnimationFrame(() => {
          cursor.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`
          rafPending = false
        })
      }
    }

    const handleMouseLeave = () => {
      cursor.style.opacity = '0'
    }

    const handleMouseEnter = () => {
      cursor.style.opacity = '1'
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    // Hover targets
    const setupHoverListeners = () => {
      const hoverTargets = document.querySelectorAll(
        "a, button, [role='button'], .nav-item, .scroll-dot, .scroll-menu-item"
      )
      const enterHandler = () => cursor.classList.add('is-hovering')
      const leaveHandler = () => cursor.classList.remove('is-hovering')

      hoverTargets.forEach((el) => {
        el.addEventListener('mouseenter', enterHandler)
        el.addEventListener('mouseleave', leaveHandler)
      })

      return () => {
        hoverTargets.forEach((el) => {
          el.removeEventListener('mouseenter', enterHandler)
          el.removeEventListener('mouseleave', leaveHandler)
        })
      }
    }

    // Set up hover listeners after a brief delay to ensure DOM readiness
    let cleanupHover: (() => void) | undefined
    const timeout = setTimeout(() => {
      cleanupHover = setupHoverListeners()
    }, 200)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      clearTimeout(timeout)
      cleanupHover?.()
    }
  }, [])

  return cursorRef
}
