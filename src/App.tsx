import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

// Lazy load dedicated pages to optimize initial bundle size & performance
const ArchitecturePage = lazy(() =>
  import('./pages/ArchitecturePage').then((m) => ({ default: m.ArchitecturePage })),
)
const ApiPlaygroundPage = lazy(() =>
  import('./pages/ApiPlaygroundPage').then((m) => ({ default: m.ApiPlaygroundPage })),
)
const SecurityPage = lazy(() =>
  import('./pages/SecurityPage').then((m) => ({ default: m.SecurityPage })),
)
const DocsPage = lazy(() =>
  import('./pages/DocsPage').then((m) => ({ default: m.DocsPage })),
)
const CaseStudiesPage = lazy(() =>
  import('./pages/CaseStudiesPage').then((m) => ({ default: m.CaseStudiesPage })),
)

function PageLoader() {
  return (
    <div className="surface min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="h-10 w-10 border-4 border-amber border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-mono text-xs uppercase tracking-widest muted">Loading Page…</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/api-playground" element={<ApiPlaygroundPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}
