import React, { useState } from 'react';
import { sha256Hex } from '../api/crypto.js';

export default function ForensicView({ events = [] }) {
  const [digest, setDigest] = useState('');
  
  async function audit() {
    const safeEvents = Array.isArray(events) ? events : [];
    const base = JSON.stringify(safeEvents.map(e => ({ id: e?.id, verdict: e?.verdict, action: e?.action })));
    setDigest(await sha256Hex(base)); 
  }

  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <section className="view-grid cols-2">
      <div className="panel">
        <div className="panel-title">🧪 FORENSIC AUDIT <span>SAARE-MD-FOR</span></div>
        <p className="muted">Audita eventos del runtime, genera un digest local y prepara un recibo exportable. El contenido sensible se trata como demo y no se persiste por esta UI.</p>
        <button className="primary" onClick={audit}>Run forensic audit</button>
        <div className="hash-box"><span>SHA-256 DIGEST</span><code>{digest || '—'}</code></div>
      </div>
      <div className="panel table-panel">
        <div className="panel-title">EVENT TRACE <span>LOCAL / DEMO</span></div>
        <div className="table">
          {safeEvents.map(e => (
            <div className="tr" key={e?.id || Math.random()}>
              <span>{e?.time || '--:--'}</span>
              <b>{e?.action || 'UNKNOWN'}</b>
              <em className={e?.verdict || ''}>{e?.verdict || 'PENDING'}</em>
              <small>{e?.id || 'NO-ID'}</small>
            </div>
          ))}
        </div>
        <button className="secondary" onClick={() => window.print()}>Imprimir / guardar PDF</button>
      </div>
    </section>
  );
}