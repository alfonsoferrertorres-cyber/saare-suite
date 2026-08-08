import React from 'react';
import { Link } from 'react-router-dom';

export default function Developers() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-4 py-1.5 rounded-full border border-[#00f0ff]/20 inline-block">
            Developer Resources & API
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Runtime Integration Hub
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Connect SAARE engine into your application pipeline using UNIX Domain Sockets, REST proxies, or native C/Rust ABI language bindings.
          </p>
        </div>

        {/* CODE EXAMPLE BOX */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-4 max-w-3xl mx-auto backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-mono text-xs font-bold text-[#00f0ff]">POSIX Socket Low-Overhead Connection</span>
            <span className="font-mono text-[10px] text-slate-500">Node.js / JavaScript</span>
          </div>

          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 bg-[#050811] rounded-xl border border-slate-800/80 leading-relaxed">
            <code>{`const net = require('net');

// Connect to high-performance local UNIX Domain Socket
const socket = net.connect('/var/run/saare_core.sock');

// Forward OpenAI-compatible payload for ex-ante RAM inspection
const payload = {
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Execute workflow analysis' }]
};

socket.write(JSON.stringify(payload));`}</code>
          </pre>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/discovery"
            className="inline-block bg-[#00f0ff] hover:bg-[#38bdf8] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#00f0ff]/20"
          >
            Access Developer Sandbox
          </Link>
        </div>

      </div>
    </div>
  );
}