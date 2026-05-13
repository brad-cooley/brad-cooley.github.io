import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'

const SECTION_NAMES = ['home', 'about', 'projects', 'blog', 'resume']
const TOTAL_SECTIONS = 5
const WHEEL_THRESHOLD = 25
const DRAG_THRESHOLD = 0.2
const TRANSITION_LOCK_MS = 650
const RESIZE_DEBOUNCE = 150
const ORIENTATION_DELAY = 500

interface NavigationContextType {
  currentSection: number
  goToSection: (index: number, smooth?: boolean) => void
  nextSection: () => void
  previousSection: () => void
  isMobilePortrait: () => boolean
  totalSections: number
  // Refs for DOM elements that need imperative access
  sectionsContainerRef: React.RefObject<HTMLDivElement | null>
  mobileContainerRef: React.RefObject<HTMLDivElement | null>
  navItemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  navIndicatorRef: React.RefObject<HTMLDivElement | null>
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState(() => {
    const hash = location.hash.slice(1)
    const idx = SECTION_NAMES.indexOf(hash)
    return idx !== -1 ? idx : 0
  })

  const sectionsContainerRef = useRef<HTMLDivElement | null>(null)
  const mobileContainerRef = useRef<HTMLDivElement | null>(null)
  const navItemRefs = useRef<(HTMLDivElement | null)[]>([])
  const navIndicatorRef = useRef<HTMLDivElement | null>(null)

  const isTransitioningRef = useRef(false)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const currentSectionRef = useRef(currentSection)

  // Keep ref in sync
  useEffect(() => {
    currentSectionRef.current = currentSection
  }, [currentSection])

  const isMobilePortrait = useCallback(() => {
    return window.innerWidth <= 767 && window.innerHeight > window.innerWidth
  }, [])

  const startTransition = useCallback(() => {
    isTransitioningRef.current = true
    clearTimeout(transitionTimeoutRef.current)
    transitionTimeoutRef.current = setTimeout(() => {
      isTransitioningRef.current = false
    }, TRANSITION_LOCK_MS)
  }, [])

  const updateNavIndicator = useCallback((index: number) => {
    const activeItem = navItemRefs.current[index]
    const indicator = navIndicatorRef.current
    if (activeItem && indicator) {
      const isFirstPlacement = !indicator.style.left
      if (isFirstPlacement) indicator.style.transition = 'none'
      indicator.style.left = `${activeItem.offsetLeft}px`
      indicator.style.width = `${activeItem.offsetWidth}px`
      if (isFirstPlacement) {
        requestAnimationFrame(() => {
          indicator.style.transition = ''
        })
      }
    }
  }, [])

  const goToSection = useCallback((index: number, smooth = true) => {
    if (index < 0 || index >= TOTAL_SECTIONS) return

    setCurrentSection(index)
    currentSectionRef.current = index

    if (isMobilePortrait()) {
      const container = mobileContainerRef.current
      if (!container) return
      const targetScroll = index * container.clientHeight
      container.scrollTo({ top: targetScroll, behavior: smooth ? 'smooth' : 'auto' })
    } else {
      const container = sectionsContainerRef.current
      if (!container) return
      container.classList.toggle('no-transition', !smooth)
      container.style.transform = `translateX(-${index * 100}vw)`
      updateNavIndicator(index)
      if (!smooth) {
        setTimeout(() => {
          container.classList.remove('no-transition')
        }, 50)
      }
    }
  }, [isMobilePortrait, updateNavIndicator])

  const nextSection = useCallback(() => {
    const current = currentSectionRef.current
    if (current < TOTAL_SECTIONS - 1) {
      startTransition()
      goToSection(current + 1)
    } else if (isMobilePortrait()) {
      const container = mobileContainerRef.current
      if (container) {
        container.classList.add('bounce-end')
        setTimeout(() => container.classList.remove('bounce-end'), 300)
      }
    }
  }, [goToSection, isMobilePortrait, startTransition])

  const previousSection = useCallback(() => {
    const current = currentSectionRef.current
    if (current > 0) {
      startTransition()
      goToSection(current - 1)
    } else if (isMobilePortrait()) {
      const container = mobileContainerRef.current
      if (container) {
        container.classList.add('bounce-start')
        setTimeout(() => container.classList.remove('bounce-start'), 300)
      }
    }
  }, [goToSection, isMobilePortrait, startTransition])

  // Desktop: wheel, drag, keyboard
  useEffect(() => {
    const container = sectionsContainerRef.current
    let isDragging = false
    let startX = 0
    let currentX = 0
    let initialTransform = 0

    const getTransformX = (): number => {
      if (!container) return 0
      const style = window.getComputedStyle(container)
      const matrix = new DOMMatrixReadOnly(style.transform)
      return matrix.m41
    }

    const constrainTransform = (transform: number): number => {
      const maxTransform = 0
      const minTransform = -(TOTAL_SECTIONS - 1) * window.innerWidth
      if (transform > maxTransform) {
        const excess = transform - maxTransform
        return maxTransform + excess * 0.3
      } else if (transform < minTransform) {
        const excess = minTransform - transform
        return minTransform - excess * 0.3
      }
      return transform
    }

    const handleWheel = (e: WheelEvent) => {
      if (isMobilePortrait()) return
      e.preventDefault()
      if (isTransitioningRef.current) return
      const delta = e.deltaX || e.deltaY
      if (Math.abs(delta) > WHEEL_THRESHOLD) {
        startTransition()
        if (delta > 0) {
          const cur = currentSectionRef.current
          if (cur < TOTAL_SECTIONS - 1) goToSection(cur + 1)
        } else {
          const cur = currentSectionRef.current
          if (cur > 0) goToSection(cur - 1)
        }
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (isMobilePortrait()) return
      e.preventDefault()
      isDragging = true
      startX = e.clientX
      currentX = e.clientX
      initialTransform = getTransformX()
      container?.classList.add('no-transition')
      document.querySelector('.cursor')?.classList.add('is-dragging')
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (isMobilePortrait()) return
      isDragging = true
      startX = e.touches[0].clientX
      currentX = e.touches[0].clientX
      initialTransform = getTransformX()
      container?.classList.add('no-transition')
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMobilePortrait()) return
      currentX = e.clientX
      const deltaX = currentX - startX
      const newTransform = initialTransform + deltaX
      const constrained = constrainTransform(newTransform)
      if (container) container.style.transform = `translateX(${constrained}px)`
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || isMobilePortrait()) return
      currentX = e.touches[0].clientX
      const deltaX = currentX - startX
      const newTransform = initialTransform + deltaX
      const constrained = constrainTransform(newTransform)
      if (container) container.style.transform = `translateX(${constrained}px)`
    }

    const handleDragEnd = () => {
      if (!isDragging || isMobilePortrait()) return
      isDragging = false
      container?.classList.remove('no-transition')
      document.querySelector('.cursor')?.classList.remove('is-dragging')

      const deltaX = currentX - startX
      const threshold = window.innerWidth * DRAG_THRESHOLD
      let newSection = currentSectionRef.current

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && currentSectionRef.current > 0) {
          newSection = currentSectionRef.current - 1
        } else if (deltaX < 0 && currentSectionRef.current < TOTAL_SECTIONS - 1) {
          newSection = currentSectionRef.current + 1
        }
      }

      goToSection(newSection)
    }

    const handleContextMenu = (e: MouseEvent) => {
      if (isDragging) e.preventDefault()
    }

    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          if (!isTransitioningRef.current) {
            startTransition()
            const cur = currentSectionRef.current
            if (cur > 0) goToSection(cur - 1)
          }
          break
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          if (!isTransitioningRef.current) {
            startTransition()
            const cur = currentSectionRef.current
            if (cur < TOTAL_SECTIONS - 1) goToSection(cur + 1)
          }
          break
        default: {
          const num = parseInt(e.key)
          if (num >= 1 && num <= 5) {
            e.preventDefault()
            goToSection(num - 1)
          }
        }
      }
    }

    let resizeTimeout: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        goToSection(currentSectionRef.current, false)
      }, RESIZE_DEBOUNCE)
    }

    const handleOrientation = () => {
      setTimeout(() => {
        goToSection(currentSectionRef.current, false)
      }, ORIENTATION_DELAY)
    }

    container?.addEventListener('wheel', handleWheel, { passive: false })
    container?.addEventListener('mousedown', handleMouseDown)
    container?.addEventListener('touchstart', handleTouchStart, { passive: true })
    container?.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleDragEnd, { passive: true })
    document.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientation)

    // Initial placement
    setTimeout(() => {
      goToSection(currentSectionRef.current, false)
    }, 100)

    return () => {
      container?.removeEventListener('wheel', handleWheel)
      container?.removeEventListener('mousedown', handleMouseDown)
      container?.removeEventListener('touchstart', handleTouchStart)
      container?.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleDragEnd)
      document.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientation)
      clearTimeout(resizeTimeout)
    }
  }, [goToSection, isMobilePortrait, startTransition])

  // Mobile scroll tracking
  useEffect(() => {
    const container = mobileContainerRef.current
    if (!container) return

    let scrollTimeout: ReturnType<typeof setTimeout>
    let touchStartY = 0

    const handleScroll = () => {
      const { clientHeight, scrollTop } = container
      const exactIndex = (scrollTop + clientHeight * 0.5) / clientHeight
      const newIndex = Math.max(0, Math.min(Math.floor(exactIndex), TOTAL_SECTIONS - 1))
      if (newIndex !== currentSectionRef.current) {
        setCurrentSection(newIndex)
        currentSectionRef.current = newIndex
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const currentIndex = Math.round(scrollTop / clientHeight)
        const targetIndex = Math.max(0, Math.min(currentIndex, TOTAL_SECTIONS - 1))
        if (targetIndex !== currentSectionRef.current) {
          goToSection(targetIndex)
        }
      }, 150)
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const deltaY = touchStartY - touchEndY
      const threshold = 50

      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          if (currentSectionRef.current < TOTAL_SECTIONS - 1) {
            goToSection(currentSectionRef.current + 1)
          } else {
            container.classList.add('bounce-end')
            setTimeout(() => container.classList.remove('bounce-end'), 300)
          }
        } else {
          if (currentSectionRef.current > 0) {
            goToSection(currentSectionRef.current - 1)
          } else {
            container.classList.add('bounce-start')
            setTimeout(() => container.classList.remove('bounce-start'), 300)
          }
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      clearTimeout(scrollTimeout)
    }
  }, [goToSection])

  return (
    <NavigationContext.Provider value={{
      currentSection,
      goToSection,
      nextSection,
      previousSection,
      isMobilePortrait,
      totalSections: TOTAL_SECTIONS,
      sectionsContainerRef,
      mobileContainerRef,
      navItemRefs,
      navIndicatorRef,
    }}>
      {children}
    </NavigationContext.Provider>
  )
}
