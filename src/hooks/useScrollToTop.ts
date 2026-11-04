import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Handles smooth scroll restoration and hash anchor navigation.
 * When navigating from another page to a homepage anchor (e.g. /#work),
 * delays slightly to ensure the DOM is mounted before scrolling into view.
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '')
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 80)
      return () => clearTimeout(timer)
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
}
