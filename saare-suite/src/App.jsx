import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './pages/Home';
import Apps from './pages/Apps';
import Main from './pages/Main';
import Arquitectura from './pages/Arquitectura';

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Título */}
        <Link to="/" className="text-amber-500 font-bold text-lg tracking-wider hover:opacity-90 transition-opacity">
          MS3V SAARE
        </Link>

        {/* Pestañas de Navegación de la Suite */}
        <nav className="flex items-center space-x-8 text-sm font-medium">
          <Link to="/" className="hover:text-amber-400 transition-colors">Inicio</Link>
          <Link to="/main" className="hover:text-amber-400 transition-colors">Main</Link>
          <Link to="/apps" className="hover:text-amber-400 transition-colors">Apps</Link>
          <Link to="/arquitectura" className="hover:text-amber-400 transition-colors">Arquitectura</Link>
        </nav>

        {/* Botón de Entrada */}
        <a
          href="https://master.saare-console.pages.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-all"
        >
          Abrir Consola
        </a>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#060911] text-white font-sans antialiased">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/arquitectura" element={<Arquitectura />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}