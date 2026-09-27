import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-saare-line">
      <table className={`w-full text-left text-sm text-saare-ink ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-saare-surface-2 text-xs font-mono uppercase text-saare-ink-dim border-b border-saare-line ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-saare-line ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return <tr className={`hover:bg-saare-surface-2/50 transition-colors ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = '' }) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}