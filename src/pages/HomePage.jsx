import CompanyMission from '../components/CompanyMission'
import ServicesShowcase from '../components/ServicesShowcase'

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <CompanyMission />
      <ServicesShowcase />
    </main>
  )
}
