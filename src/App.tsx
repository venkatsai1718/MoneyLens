import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { SIPCalculator } from './pages/SIPCalculator'
import { StepUpSIPCalculator } from './pages/StepUpSIPCalculator'
import { SWPCalculator } from './pages/SWPCalculator'
import { FDCalculator } from './pages/FDCalculator'
import { LumpsumCalculator } from './pages/LumpsumCalculator'
import { RDCalculator } from './pages/RDCalculator'
import { PPFCalculator } from './pages/PPFCalculator'
import { NPSCalculator } from './pages/NPSCalculator'
import { GoalSIPCalculator } from './pages/GoalSIPCalculator'
import { CAGRCalculator } from './pages/CAGRCalculator'
import { InflationCalculator } from './pages/InflationCalculator'
import { Compare } from './pages/Compare'
import { Resources } from './pages/Resources'
import { NotFound } from './pages/NotFound'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  React.useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

/** Fades each page in on navigation by remounting (keyed on path) instead of just re-rendering in place. */
function AnimatedRoutes() {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="animate-fadeIn">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sip-calculator" element={<SIPCalculator />} />
        <Route path="/step-up-sip-calculator" element={<StepUpSIPCalculator />} />
        <Route path="/swp-calculator" element={<SWPCalculator />} />
        <Route path="/fd-calculator" element={<FDCalculator />} />
        <Route path="/lumpsum-calculator" element={<LumpsumCalculator />} />
        <Route path="/rd-calculator" element={<RDCalculator />} />
        <Route path="/ppf-calculator" element={<PPFCalculator />} />
        <Route path="/nps-calculator" element={<NPSCalculator />} />
        <Route path="/goal-sip-calculator" element={<GoalSIPCalculator />} />
        <Route path="/cagr-calculator" element={<CAGRCalculator />} />
        <Route path="/inflation-calculator" element={<InflationCalculator />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-snow">
          <Navbar />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
