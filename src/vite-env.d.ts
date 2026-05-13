/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

// View Transitions API
interface Document {
  startViewTransition?: (callback: () => void) => void
}
