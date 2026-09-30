import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    danger: 'bg-red-950/80 text-red-400 border-red-800/80',
    red: 'bg-red-950/80 text-red-400 border-red-800/80',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
    info: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/80',
    cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/80',
    blue: 'bg-blue-950/80 text-blue-400 border-blue-800/80',
    purple: 'bg-purple-950/80 text-purple-400 border-purple-800/80',
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;