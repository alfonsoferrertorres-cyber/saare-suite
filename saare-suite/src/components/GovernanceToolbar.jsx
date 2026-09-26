import React from 'react';

export default function GovernanceToolbar({ mode, setMode, onExport }) {
  const modes = [
    ['SAARE-MD-FOR', 'Forense'],
    ['SAARE-MD-CORP', 'Corporate'],
    ['SAARE-MD-SECU', 'Enforcement'],
    ['SAARE-MD-VERD', 'Verdict'],
    ['SAARE-MD-LEGAL', 'Legal'],
    ['SAARE-MD-IPRES', 'IP / Preservation']
  ];
  return <div className="governance-toolbar">
    <div className="toolbar-main">
      <span className="toolbar-label">GOVERNANCE / MODE</span>
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        {modes.map(([id, label]) => <option value={id} key={id}>{id} · {label}</option>)}
      </select>
    </div>
    <div className="toolbar-actions">
      <button onClick={onExport}>Export evidence</button>
    </div>
  </div>;
}
