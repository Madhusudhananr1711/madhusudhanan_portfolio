import { Hero } from '../components/Hero'
import { StatsBand } from '../components/StatsBand'
import { About } from '../components/About'
import { Projects } from '../components/Projects'
import { TechnicalDeepDives } from '../components/TechnicalDeepDives'
import { GithubActivity } from '../components/GithubActivity'
import { Experience } from '../components/Experience'
import { Contact } from '../components/Contact'

export function HomePage() {
  return (
    <>
      <Hero />
      <StatsBand />
      <About />
      <Projects />
      <TechnicalDeepDives />
      <GithubActivity />
      <Experience />
      <Contact />
    </>
  )
}
