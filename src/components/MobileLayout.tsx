import { useState, useCallback } from 'react'
import { useNavigation } from '../hooks/useNavigation'

const SECTIONS = [
  { num: '01', label: 'Home' },
  { num: '02', label: 'About' },
  { num: '03', label: 'Projects' },
  { num: '04', label: 'Writing' },
  { num: '05', label: 'Resume' },
]

export default function MobileLayout() {
  const { currentSection, goToSection, mobileContainerRef } = useNavigation()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const handleMenuItemClick = useCallback((index: number) => {
    goToSection(index)
    closeMenu()
  }, [goToSection, closeMenu])

  return (
    <div className="mobile-portrait-layout" id="mobilePortraitContainer" ref={mobileContainerRef}>
      {/* 01 · Home */}
      <div className="mobile-section home" data-index="0">
        <div className="mobile-content">
          <div className="mobile-eyebrow">01 / 05</div>
          <h2 className="mobile-name">Brad<br />Cooley</h2>
          <div className="mobile-rule"></div>
          <p className="mobile-role">Lead Data Engineer @ Mutually Human</p>
          <div className="mobile-links">
            <a href="https://github.com/brad-cooley" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
              GitHub<span className="link-arrow">{'\u2197'}</span>
            </a>
            <a href="https://linkedin.com/in/bradcooley" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
              LinkedIn<span className="link-arrow">{'\u2197'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 02 · About */}
      <div className="mobile-section" data-index="1">
        <div className="mobile-content mobile-about-content">
          <div className="mobile-eyebrow">02 / 05</div>
          <h2 className="mobile-section-title">About</h2>
          <div className="mobile-rule"></div>
          <p className="mobile-body-text">
            A passionate data engineer creating elegant solutions to complex problems, with an eye for the details that make them last. I design for the business and the people who use it, always leading with empathy.
          </p>
          <p className="mobile-body-text">
            Based in Grand Rapids, Michigan, but constantly exploring the world through code and travel. I'm always tinkering, learning, and building new things.
          </p>
          <span className="mobile-wip">
            Want to talk? <a href="mailto:brad@cooley.email">Email me<span className="link-arrow">{'\u2197'}</span></a>.
          </span>
        </div>
      </div>

      {/* 03 · Projects */}
      <div className="mobile-section" data-index="2">
        <div className="mobile-content">
          <div className="mobile-eyebrow">03 / 05</div>
          <h2 className="mobile-section-title">Projects</h2>
          <div className="mobile-rule"></div>
          <p className="mobile-body-text">
            A selection of work spanning web applications, data engineering, and open-source contributions.
          </p>
          <span className="mobile-wip">— Showcase launching soon</span>
        </div>
      </div>

      {/* 04 · Writing */}
      <div className="mobile-section" data-index="3">
        <div className="mobile-content">
          <div className="mobile-eyebrow">04 / 05</div>
          <h2 className="mobile-section-title">Writing</h2>
          <div className="mobile-rule"></div>
          <p className="mobile-body-text">
            Thoughts on technology, development practices, and the craft of building software.
          </p>
          <span className="mobile-wip">— First posts arriving soon</span>
        </div>
      </div>

      {/* 05 · Resume */}
      <div className="mobile-section" data-index="4">
        <div className="mobile-content">
          <div className="mobile-eyebrow">05 / 05</div>
          <h2 className="mobile-section-title">Resume</h2>
          <div className="mobile-rule"></div>
          <p className="mobile-body-text">
            Professional background, technical skills, and experience.
          </p>
          <span className="mobile-wip">— Full resume arriving soon</span>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="scroll-indicator" id="scrollIndicator" aria-label="Navigate sections" onClick={toggleMenu}>
        {SECTIONS.map((_, index) => (
          <div key={index} className={`scroll-dot${currentSection === index ? ' active' : ''}`} data-index={index}></div>
        ))}
      </div>

      {/* Slide-out menu */}
      <nav className={`scroll-menu${menuOpen ? ' active' : ''}`} id="scrollMenu" aria-label="Section navigation">
        {SECTIONS.map((section, index) => (
          <div
            key={section.label}
            className={`scroll-menu-item${currentSection === index ? ' active' : ''}`}
            data-index={index}
            role="button"
            tabIndex={0}
            onClick={() => handleMenuItemClick(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleMenuItemClick(index)
              }
            }}
          >
            <span className="scroll-menu-num">{section.num}</span>
            <span className="scroll-menu-label">{section.label}</span>
          </div>
        ))}
      </nav>

      <div className={`scroll-menu-backdrop${menuOpen ? ' active' : ''}`} id="scrollMenuBackdrop" onClick={closeMenu}></div>

      <div className="scroll-hint">
        <div className="scroll-hint-line"></div>
        <span>Scroll</span>
      </div>
    </div>
  )
}
