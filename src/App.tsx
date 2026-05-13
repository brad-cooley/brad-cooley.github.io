import './css/base.css'
import './css/desktop.css'
import './css/mobile-portrait.css'
import { NavigationProvider } from './hooks/useNavigation'
import { useTheme } from './hooks/useTheme'
import { useCustomCursor } from './hooks/useCustomCursor'
import DesktopLayout from './components/DesktopLayout'
import MobileLayout from './components/MobileLayout'

function AppContent() {
  const { toggleTheme } = useTheme()
  const cursorRef = useCustomCursor()

  return (
    <>
      {/* Custom cursor (fine-pointer / mouse only) */}
      <div className="cursor" aria-hidden="true" ref={cursorRef}></div>

      {/* Grain texture overlay */}
      <div className="grain" aria-hidden="true"></div>

      {/* Theme toggle */}
      <button
        className="theme-toggle"
        id="themeToggle"
        aria-label="Toggle color mode"
        onClick={toggleTheme}
      >
        <span className="theme-toggle-icon" aria-hidden="true"></span>
      </button>

      <div className="app-container">
        <DesktopLayout />
        <MobileLayout />
      </div>
    </>
  )
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  )
}
