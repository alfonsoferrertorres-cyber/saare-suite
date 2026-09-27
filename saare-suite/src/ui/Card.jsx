import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-saare-surface border border-saare-line rounded-xl p-6 shadow-xl text-saare-ink ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 pb-3 border-b border-saare-line ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-display font-bold text-saare-ink ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}