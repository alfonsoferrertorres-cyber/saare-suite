import React from 'react';

export default function DossierExporter({ events = [] }) {
  const safeEvents = Array.isArray(events) ? events : [];

  function exportJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      eventCount: safeEvents.length,
      events: safeEvents,
      labels: { DEMO: true, BENCHMARK: true, REFERENCE: true, LIVE: false }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'saare-evidence-dossier.json';
    a.click();
    URL.revokeObjectURL(u);
  }

  function exportCsv() {
    const rows = [
      ['id', 'time', 'agent', 'action', 'verdict'],
      ...safeEvents.map(e => [e?.id, e?.time, e?.agent, e?.action, e?.verdict])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'saare-evidence-trace.csv';
    a.click();
    URL.revokeObjectURL(u);
  }

  return (
    <div className="panel export-panel">
      <div className="panel-title">DOSSIER EXPORTER <span>SAARE-MD-IPRES</span></div>
      <p className="muted">Exporta un paquete de evidencia para revisión. Los artefactos generados por esta UI son de demostración.</p>
      <div className="export-buttons">
        <button className="primary" onClick={exportJson}>JSON firmado-ready</button>
        <button className="secondary" onClick={exportCsv}>CSV trace</button>
        <button className="secondary" onClick={() => window.print()}>PDF / print</button>
      </div>
    </div>
  );
}