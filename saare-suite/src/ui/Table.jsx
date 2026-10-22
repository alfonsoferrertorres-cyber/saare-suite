import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
      <table className={`w-full text-left text-xs text-slate-300 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return <thead className={`bg-slate-900 border-b border-slate-800 text-slate-400 font-mono ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-slate-800/60 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return <tr className={`hover:bg-slate-900/40 transition-colors ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = '' }) {
  return <th className={`p-3 font-semibold uppercase tracking-wider text-[10px] ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }) {
  return <td className={`p-3 font-mono ${className}`}>{children}</td>;
}

export default Table;