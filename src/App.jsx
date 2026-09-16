import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AssetPreloader from './components/AssetPreloader'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PlexusDivider from './components/PlexusDivider'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import LeParcPage from './pages/LeParcPage'
import { ThemeProvider } from './context/ThemeContext'
import { LE_PARC_PATH } from './components/LeParcIntake'

export default function App() {
  return (
    <ThemeProvider>
      <AssetPreloader>
        <BrowserRouter>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path={LE_PARC_PATH} element={<LeParcPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ScrollToTop />
          <PlexusDivider darkColor="#050a14" lightColor="#eef2f7" />
          <Footer />
        </BrowserRouter>
      </AssetPreloader>
    </ThemeProvider>
  )
}
