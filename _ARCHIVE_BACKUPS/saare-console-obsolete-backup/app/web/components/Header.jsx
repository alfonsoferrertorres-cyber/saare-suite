import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#050811]/85 backdrop-blur-md border-b border-slate-800 px-6 lg:px-8 py-3.5 flex justify-between items-center transition-all">
      {/* Brand Identity & Logo */}
      <a href="/" className="flex items-center gap-3 group">
        <img 
          src="/logo_saare.ico" 
          alt="S.A.A.R.E. Logo" 
          className="h-8 w-8 rounded border border-slate-700 bg-black/60 p-1 group-hover:border-[#C5A059] transition-colors" 
        />
        <span className="font-serif font-extrabold text-[#C5A059] tracking-wider text-base lg:text-lg">
          S.A.A.R.E.
        </span>
      </a>

      {/* Main Navigation Links */}
      <nav className="hidden lg:flex gap-6 items-center text-xs font-semibold text-slate-300">
        <a href="/platform" className="hover:text-[#C5A059] transition-colors">Platform</a>
        <a href="/products" className="hover:text-[#C5A059] transition-colors">Products</a>
        <a href="/solutions" className="hover:text-[#C5A059] transition-colors">Solutions</a>
        <a href="/industries" className="hover:text-[#C5A059] transition-colors">Industries</a>
        <a 
          href="https://trust.saare.es" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-[#C5A059] transition-colors"
        >
          Trust Center
        </a>
        <a 
          href="https://docs.saare.es" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-[#C5A059] transition-colors"
        >
          Developers
        </a>
        <a href="/partners" className="hover:text-[#C5A059] transition-colors">Partners / OEM</a>
        <a href="/pricing" className="hover:text-[#C5A059] transition-colors">Pricing</a>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <a 
          href="https://app.saare.es" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs font-mono text-slate-300 hover:text-white px-3 py-2 transition-colors"
        >
          Console Login
        </a>
        <a 
          href="/discovery" 
          className="bg-[#C5A059] text-black hover:bg-white font-extrabold text-xs px-4 py-2 rounded transition-all shadow-lg hover:shadow-[#C5A059]/20"
        >
          Request Architecture
        </a>
      </div>
    </header>
  );
}