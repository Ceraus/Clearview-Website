import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AssetPreloader from './components/AssetPreloader'
import Navbar from './components/Navbar'
import ScrollProgressBar from './components/ScrollProgressBar'
import Footer from './components/Footer'
import PlexusDivider from './components/PlexusDivider'
import ScrollToTop from './components/ScrollToTop'
import ThemeToggle from './components/ThemeToggle'
import HomePage from './pages/HomePage'
import { ThemeProvider } from './context/ThemeContext'

const ManagedIT = lazy(() => import('./pages/services/ManagedIT'))
const CyberSecurity = lazy(() => import('./pages/services/CyberSecurity'))
const CloudHosting = lazy(() => import('./pages/services/CloudHosting'))
const ITSupport = lazy(() => import('./pages/services/ITSupport'))
const WifiWiring = lazy(() => import('./pages/services/WifiWiring'))
const SystemIntegration = lazy(() => import('./pages/services/SystemIntegration'))
const WebsiteDesign = lazy(() => import('./pages/services/WebsiteDesign'))
const AVIntegration = lazy(() => import('./pages/services/AVIntegration'))

const Construction = lazy(() => import('./pages/industries/Construction'))
const Finance = lazy(() => import('./pages/industries/Finance'))
const Healthcare = lazy(() => import('./pages/industries/Healthcare'))
const Legal = lazy(() => import('./pages/industries/Legal'))
const Retail = lazy(() => import('./pages/industries/Retail'))
const Manufacturing = lazy(() => import('./pages/industries/Manufacturing'))
const Entertainment = lazy(() => import('./pages/industries/Entertainment'))
const Education = lazy(() => import('./pages/industries/Education'))

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"
        />
        <span className="text-blue-400/50 text-xs tracking-widest uppercase">Loading</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AssetPreloader>
        <BrowserRouter>
          <ScrollProgressBar />
          <Navbar />
          <ThemeToggle />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/services/managed-it" element={<ManagedIT />} />
            <Route path="/services/cyber-security" element={<CyberSecurity />} />
            <Route path="/services/cloud-hosting" element={<CloudHosting />} />
            <Route path="/services/it-support" element={<ITSupport />} />
            <Route path="/services/wifi-wiring" element={<WifiWiring />} />
            <Route path="/services/system-integration" element={<SystemIntegration />} />
            <Route path="/services/website-design" element={<WebsiteDesign />} />
            <Route path="/services/av-integration" element={<AVIntegration />} />

            <Route path="/industries/construction" element={<Construction />} />
            <Route path="/industries/finance" element={<Finance />} />
            <Route path="/industries/healthcare" element={<Healthcare />} />
            <Route path="/industries/legal" element={<Legal />} />
            <Route path="/industries/retail" element={<Retail />} />
            <Route path="/industries/manufacturing" element={<Manufacturing />} />
            <Route path="/industries/entertainment" element={<Entertainment />} />
            <Route path="/industries/education" element={<Education />} />
            </Routes>
          </Suspense>
          <ScrollToTop />
          <PlexusDivider darkColor="#050a14" lightColor="#eef2f7" />
          <Footer />
        </BrowserRouter>
      </AssetPreloader>
    </ThemeProvider>
  )
}
