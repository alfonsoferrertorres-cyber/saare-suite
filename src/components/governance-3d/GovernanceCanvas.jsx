import React from 'react';
import HeroBackground from '../canvas/HeroBackground';

export default function GovernanceCanvas({ 
  isVerified = true, 
  activeFlow = true, 
  onSelectModule 
}) {
  return (
    <div className="relative w-full h-[600px] bg-[#050811] rounded-xl overflow-hidden border border-slate-800">
      <HeroBackground />
    </div>
  );
}