import React from 'react';

export default function GrcAuditView({ invariants, policies }) {
  const passed = invariants.filter((i) => i.state === 'PASS').length;
  return <section className="view-grid cols-2">
    <div className="panel">
      <div className="panel-title">GRC / AUDIT <span>CONTROL COVERAGE</span></div>
      <div className="coverage"><b>{passed}/8</b><span>invariants passing</span></div>
      <div className="invariant-list">{invariants.map((inv) => <div key={inv.id}><span>{inv.id}</span><b className={inv.state==='PASS'?'pass':'fail'}>{inv.state}</b></div>)}</div>
    </div>
    <div className="panel">
      <div className="panel-title">ACTIVE POLICIES <span>GOVERNANCE STATE</span></div>
      {policies.map((p) => <div className="policy-row" key={p.id}><div><b>{p.id}</b><span>{p.name}</span></div><em>{p.version}</em><strong>{p.state}</strong></div>)}
      <div className="small-note">FRIA / EU AI Act materials should be linked to the exact legal and operational record before production publication.</div>
    </div>
  </section>;
}
