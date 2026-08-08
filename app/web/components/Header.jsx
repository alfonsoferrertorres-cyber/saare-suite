import React from 'react';

export default function Header() {
  return (
    <header class="sticky top-0 z-50 bg-[#050811]/85 backdrop-blur-md border-b border-slate-800 px-8 py-3.5 flex justify-between items-center">
      <a href="/" class="flex items-center gap-3">
        <img src="/logo_saare.ico" alt="SAARE" class="h-8 w-8 rounded border border-slate-700 bg-black/60 p-1" />
        <span class="font-serif font-extrabold text-white tracking-wider">SAARE PLATFORM</span>
      </a>

      <nav class="hidden lg:flex gap-6 items-center text-xs font-semibold text-slate-300">
        <a href="/platform" class="hover:text-white transition-colors">Platform</a>
        <a href="/products" class="hover:text-white transition-colors">Products</a>
        <a href="/solutions" class="hover:text-white transition-colors">Solutions</a>
        <a href="/industries" class="hover:text-white transition-colors">Industries</a>
        <a href="https://trust.saare.es" class="hover:text-[#00f0ff] transition-colors">Trust Center</a>
        <a href="https://docs.saare.es" class="hover:text-white transition-colors">Developers</a>
        <a href="/partners" class="hover:text-white transition-colors">Partners / OEM</a>
        <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="https://app.saare.es" class="text-xs font-mono text-slate-300 hover:text-white px-3 py-2">
          Console Login
        </a>
        <a href="/discovery" class="bg-[#C5A059] text-black hover:bg-white font-extrabold text-xs px-4 py-2 rounded transition-all">
          Request Architecture
        </a>
      </div>
    </header>
  );
}