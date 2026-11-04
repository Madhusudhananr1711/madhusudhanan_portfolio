import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/': 'Madhusudhanan R — Java Full Stack Developer',
  '/architecture': 'Architecture Explorer — Madhusudhanan R',
  '/api-playground': 'API Playground — Madhusudhanan R',
  '/security': 'Security Showcase — Madhusudhanan R',
  '/docs': 'API Documentation — Madhusudhanan R',
  '/case-studies': 'Case Studies — Madhusudhanan R',
}

export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const title = titles[pathname] || 'Madhusudhanan R — Java Full Stack Developer'
    document.title = title
  }, [pathname])
}
