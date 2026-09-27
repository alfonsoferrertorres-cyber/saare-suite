import React from 'react';

const variantStyles = {
  default: 'bg-saare-surface-2 text-saare-ink border-saare-line',
  allow: 'bg-saare-allow/10 text-saare-allow border-saare-allow/30',
  deny: 'bg-saare-deny/10 text-saare-deny border-saare-deny/30',
  seal: 'bg-saare-seal/10 text-saare-seal border-saare-seal/30',
  accent: 'bg-saare-accent/10 text-saare-accent border-saare-accent/30',
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
    >
      {children}
    </span>
  );
}