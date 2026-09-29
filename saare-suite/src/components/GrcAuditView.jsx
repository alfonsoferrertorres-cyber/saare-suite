import React from 'react';

export default function GrcAuditView({ invariants = [], policies = [] }) {
  const safeInvariants = Array.isArray(invariants) ? invariants : [];
  const safePolicies = Array.isArray(policies) ? policies : [];
  
  const passed = safeInvariants.filter((i) => i?.state === 'PASS').length;

  return (
    <section className="view-grid cols-2">
      <div className="panel">
        <div className="panel-title">GRC / AUDIT <span>CONTROL COVERAGE</span></div>
        <div className="coverage"><b>{passed}/8</b><span>invariants passing</span></div>
        <div className="invariant-list">
          {safeInvariants.map((inv) => (
            <div key={inv?.id || Math.random()}>
              <span>{inv?.id || 'INV-00'}</span>
              <b className={inv?.state === 'PASS' ? 'pass' : 'fail'}>{inv?.state || 'FAIL'}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="panel-title">ACTIVE POLICIES <span>GOVERNANCE STATE</span></div>
        {safePolicies.map((p) => (
          <div className="policy-row" key={p?.id || Math.random()}>
            <div>
              <b>{p?.id || 'POL-00'}</b>
              <span>{p?.name || 'Innominate Policy'}</span>
            </div>
            <em>{p?.version || 'v1.0'}</em>
            <strong>{p?.state || 'ACTIVE'}</strong>
          </div>
        ))}
        <div className="small-note">FRIA / EU AI Act materials should be linked to the exact legal and operational record before production publication.</div>
      </div>
    </section>
  );
}