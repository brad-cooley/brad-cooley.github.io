import { useNavigation } from '../hooks/useNavigation'
import ParticlePortrait from './ParticlePortrait'
import headshot from '../assets/img/headshot.png'

const NAV_ITEMS = [
  { num: '01', label: 'Home' },
  { num: '02', label: 'About' },
  { num: '03', label: 'Projects' },
  { num: '04', label: 'Writing' },
  { num: '05', label: 'Resume' },
]

export default function DesktopLayout() {
  const { currentSection, goToSection, sectionsContainerRef, navItemRefs, navIndicatorRef } = useNavigation()

  return (
    <div className="desktop-layout">
      <div className="sections-container" ref={sectionsContainerRef}>
        {/* 01 · Home */}
        <section className={`section home-section${currentSection === 0 ? ' active' : ''}`}>
          <div className="section-ghost-num" aria-hidden="true">01</div>
          <div className="home-content">
            <div className="home-name">
              <h1>Brad<br />Cooley</h1>
            </div>
            <div className="home-rule"></div>
            <div className="home-footer">
              <p className="home-title">Lead Data Engineer @ Mutually Human</p>
              <div className="home-links">
                <a href="https://github.com/brad-cooley" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                  GitHub<span className="link-arrow">{'\u2197'}</span>
                </a>
                <a href="https://linkedin.com/in/bradcooley" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
                  LinkedIn<span className="link-arrow">{'\u2197'}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 02 · About */}
        <section className={`section about-section${currentSection === 1 ? ' active' : ''}`} data-section="about">
          <div className="section-ghost-num" aria-hidden="true">02</div>
          <div className="about-layout">
            <div className="about-portrait-col">
              <ParticlePortrait imageSrc={headshot} gap={3} particleSize={1.2} />
            </div>
            <div className="about-text-col">
              <span className="section-eyebrow">02 — About</span>
              <h2 className="section-title">Who<br />I am.</h2>
              <p className="section-body-text">
                A passionate data engineer creating elegant solutions to complex problems, with an eye for the details that make them last. I design for the business and the people who use it, always leading with empathy.
              </p>
              <p className="section-body-text">
                Based in Grand Rapids, Michigan, but constantly exploring the world through code and travel. I'm always tinkering, learning, and building new things.
              </p>
              <span className="section-wip">
                Want to talk? <a href="mailto:brad@cooley.email">Email me<span className="link-arrow">{'\u2197'}</span></a>.
              </span>
            </div>
          </div>
        </section>

        {/* 03 · Projects */}
        <section className={`section${currentSection === 2 ? ' active' : ''}`} data-section="projects">
          <div className="section-ghost-num" aria-hidden="true">03</div>
          <div className="section-inner">
            <div className="section-label-col">
              <span className="section-eyebrow">03 — Projects</span>
              <h2 className="section-title">What<br />I&nbsp;build.</h2>
            </div>
            <div className="section-text-col">
              <p className="section-body-text">
                A selection of work spanning web applications, data engineering, and open-source contributions. Each project represents a journey of learning and craft.
              </p>
              <span className="section-wip">— Showcase launching soon</span>
            </div>
          </div>
        </section>

        {/* 04 · Writing */}
        <section className={`section${currentSection === 3 ? ' active' : ''}`} data-section="blog">
          <div className="section-ghost-num" aria-hidden="true">04</div>
          <div className="section-inner">
            <div className="section-label-col">
              <span className="section-eyebrow">04 — Writing</span>
              <h2 className="section-title">How<br />I&nbsp;think.</h2>
            </div>
            <div className="section-text-col">
              <p className="section-body-text">
                Thoughts on technology, development practices, and the craft of building software. A documentation of my learning journey.
              </p>
              <span className="section-wip">— First posts arriving soon</span>
            </div>
          </div>
        </section>

        {/* 05 · Resume */}
        <section className={`section${currentSection === 4 ? ' active' : ''}`} data-section="resume">
          <div className="section-ghost-num" aria-hidden="true">05</div>
          <div className="section-inner">
            <div className="section-label-col">
              <span className="section-eyebrow">05 — Resume</span>
              <h2 className="section-title">What<br />I've done.</h2>
            </div>
            <div className="section-text-col">
              <p className="section-body-text">
                Professional background, technical skills, and experience. A comprehensive look at my career journey as a software and data engineer.
              </p>
              <span className="section-wip">— Full resume arriving soon</span>
            </div>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <nav className="bottom-nav" aria-label="Site navigation">
        <div className="nav-container" data-nav-container>
          <div className="nav-indicator" aria-hidden="true" ref={navIndicatorRef}></div>
          {NAV_ITEMS.map((item, index) => (
            <div
              key={item.label}
              className={`nav-item${currentSection === index ? ' active' : ''}`}
              data-section={index}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              ref={(el) => { navItemRefs.current[index] = el }}
              onClick={() => goToSection(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goToSection(index)
                }
              }}
            >
              <span className="nav-num">{item.num}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
