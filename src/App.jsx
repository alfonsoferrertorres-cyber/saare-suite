import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Platform from './pages/Platform';
import Products from './pages/Products';
import Solutions from './pages/Solutions';
import Discovery from './pages/Discovery';
import Pricing from './pages/Pricing';
import Partners from './pages/Partners';
import Developers from './pages/Developers';
import Trust from './pages/Trust';
import Legal from './pages/Legal';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050811] text-white flex flex-col justify-between selection:bg-[#C5A059] selection:text-black">
        
        {/* Enterprise Header Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#050811]/90 backdrop-blur-md border-b border-slate-800/80 px-6 sm:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="font-serif font-extrabold text-white text-lg tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
            SAARE PLATFORM
          </Link>

          {/* Infrastructure Navigation Links */}
          <nav className="hidden lg:flex gap-6 text-xs font-semibold text-slate-300">
            <Link to="/platform" className="hover:text-white transition-colors cursor-pointer">Platform</Link>
            <Link to="/products" className="hover:text-white transition-colors cursor-pointer">Products</Link>
            <Link to="/solutions" className="hover:text-white transition-colors cursor-pointer">Solutions</Link>
            <Link to="/pricing" className="hover:text-white transition-colors cursor-pointer">Pricing & Licensing</Link>
            <Link to="/partners" className="hover:text-white transition-colors cursor-pointer">Partners & OEM</Link>
            <Link to="/developers" className="hover:text-[#00f0ff] transition-colors cursor-pointer">Developers</Link>
            <Link to="/trust" className="hover:text-[#C5A059] transition-colors cursor-pointer">Trust Center</Link>
          </nav>

          {/* Primary Funnel Call To Actions */}
          <div className="flex items-center gap-3">
            <Link 
              to="/discovery" 
              className="border border-slate-700 text-slate-300 hover:text-white hover:border-[#00f0ff] font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
            >
              Start Discovery
            </Link>
            <Link 
              to="/pricing" 
              className="bg-[#C5A059] text-black hover:bg-[#d6b16a] font-extrabold text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-[#C5A059]/10 cursor-pointer"
            >
              Request Architecture
            </Link>
          </div>
        </header>

        {/* SPA Views Container */}
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/products" element={<Products />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/trust" element={<Trust />} />
            
            {/* Rutas Legales B2B & Stripe Compliance */}
            <Route path="/terms" element={<Legal />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/eula" element={<Legal />} />

            {/* Fallback 404 Route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Corporate Footer Con Enlaces Legales */}
        <footer className="py-6 px-6 border-t border-slate-900 bg-[#050811]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
            <div>
              MS3V S.A.A.R.E. SL • Enterprise AI Governance Infrastructure
            </div>
            <div className="flex gap-6 text-[11px]">
              <Link to="/terms" className="hover:text-[#C5A059] transition-colors">Términos</Link>
              <Link to="/privacy" className="hover:text-[#00f0ff] transition-colors">Privacidad</Link>
              <Link to="/eula" className="hover:text-purple-400 transition-colors">EULA</Link>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}