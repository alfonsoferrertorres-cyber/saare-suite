import React from 'react';

export default function ExecutiveView({ 
  stats = { total: 0, allow: 0, deny: 0, review: 0 }, 
  mode = 'SAARE-MD-IPRES' 
}) {
  // Aseguramos que stats tenga valores válidos si llega parcialmente o undefined
  const safeStats = {
    total: stats?.total ?? 0,
    allow: stats?.allow ?? 0,
    deny: stats?.deny ?? 0,
    review: stats?.review ?? 0,
  };

  return (
    <section className="view-grid">
      <div className="hero-panel executive-panel">
        <div className="eyebrow">EXECUTIVE / CEO</div>
        <h2>Controla qué pueden hacer tus agentes.</h2>
        <p>Una vista para comité: riesgo, acciones gobernadas, veredictos y evidencia. Sin entrar en la implementación antes de entender el impacto.</p>
        <div className="executive-kpis">
          <Kpi label="Acciones gobernadas" value={safeStats.total.toLocaleString('es-ES')} />
          <Kpi label="ALLOW" value={safeStats.allow} tone="green" />
          <Kpi label="DENY" value={safeStats.deny} tone="red" />
          <Kpi label="REVIEW" value={safeStats.review} tone="amber" />
        </div>
      </div>
      <div className="panel card-list">
        <div className="panel-title">EXECUTIVE READOUT <span>{mode}</span></div>
        <div className="readout"><b>Execution boundary</b><span>Data Plane / L7</span></div>
        <div className="readout"><b>Default safety mode</b><span>FAIL-CLOSED</span></div>
        <div className="readout"><b>Decision model</b><span>ALLOW / DENY / REVIEW</span></div>
        <div className="readout"><b>Evidence</b><span>Digest · Merkle · Signature · Timestamp</span></div>
      </div>
    </section>
  );
}

function Kpi({ label, value, tone = '' }) { 
  return (
    <div className={`kpi ${tone}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  ); 
}