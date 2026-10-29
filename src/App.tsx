import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { StatsBand } from './components/StatsBand'
import { About } from './components/About'
import { Projects } from './components/Projects'
import { ArchitectureDiagram } from './components/ArchitectureDiagram'
import { ApiPlayground } from './components/ApiPlayground'
import { SecurityShowcase } from './components/SecurityShowcase'
import { OpenApiDocs } from './components/OpenApiDocs'
import { CaseStudies } from './components/CaseStudies'
import { GithubActivity } from './components/GithubActivity'
import { Experience } from './components/Experience'
import { Contact } from './components/Contact'
import { useTheme } from './hooks/useTheme'
import { profile } from './content/profile'

export default function App() {
  const { theme, toggle } = useTheme()
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-amber focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <Nav theme={theme} onToggleTheme={toggle} />
      <main id="main">
        <Hero />
        <StatsBand />
        <About />
        <Projects />
        <ArchitectureDiagram />
        <ApiPlayground />
        <SecurityShowcase />
        <OpenApiDocs />
        <CaseStudies />
        <GithubActivity />
        <Experience />
        <Contact />
      </main>
      <footer className="bg-ink px-5 py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} {profile.name}. Built with React, TypeScript, Vite and Tailwind CSS.
      </footer>
    </>
  )
}
