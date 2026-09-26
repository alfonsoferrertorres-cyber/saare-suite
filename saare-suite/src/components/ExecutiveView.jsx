import React from 'react';

export default function ExecutiveView({ stats, mode }) {
  return <section className="view-grid">
    <div className="hero-panel executive-panel">
      <div className="eyebrow">EXECUTIVE / CEO</div>
      <h2>Controla qué pueden hacer tus agentes.</h2>
      <p>Una vista para comité: riesgo, acciones gobernadas, veredictos y evidencia. Sin entrar en la implementación antes de entender el impacto.</p>
      <div className="executive-kpis">
        <Kpi label="Acciones gobernadas" value={stats.total.toLocaleString('es-ES')} />
        <Kpi label="ALLOW" value={stats.allow} tone="green" />
        <Kpi label="DENY" value={stats.deny} tone="red" />
        <Kpi label="REVIEW" value={stats.review} tone="amber" />
      </div>
    </div>
    <div className="panel card-list">
      <div className="panel-title">EXECUTIVE READOUT <span>{mode}</span></div>
      <div className="readout"><b>Execution boundary</b><span>Data Plane / L7</span></div>
      <div className="readout"><b>Default safety mode</b><span>FAIL-CLOSED</span></div>
      <div className="readout"><b>Decision model</b><span>ALLOW / DENY / REVIEW</span></div>
      <div className="readout"><b>Evidence</b><span>Digest · Merkle · Signature · Timestamp</span></div>
    </div>
  </section>;
}

function Kpi({label,value,tone=''}) { return <div className={`kpi ${tone}`}><span>{label}</span><b>{value}</b></div>; }
