import HeroServicesShell from '../components/HeroServicesShell'
import IndustriesGrid from '../components/IndustriesGrid'
import CompanyMission from '../components/CompanyMission'
import ServicesShowcase from '../components/ServicesShowcase'
import SideDotNav from '../components/SideDotNav'

export default function HomePage() {
  return (
    <main>
      <SideDotNav />
      <HeroServicesShell />
      <ServicesShowcase />
      <CompanyMission />
      <IndustriesGrid />
    </main>
  )
}
