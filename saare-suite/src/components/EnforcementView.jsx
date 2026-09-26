import React, { useState } from 'react';
import { interceptAction } from '../api/controlPlane.js';

export default function EnforcementView({ onEvent }) {
  const [form, setForm] = useState({ agent:'treasury-agent-04', action:'SEND_PAYMENT', prompt:'Transfer 85.000 EUR to IBAN ES7620770024003102575766', policy:'FIN-PAYMENT-042:v17', forceReview:false });
  const [result,setResult] = useState(null);
  const [busy,setBusy] = useState(false);

  async function run(e){ e?.preventDefault(); setBusy(true); const r=await interceptAction(form); setResult(r); setBusy(false); if(r?.verdict) onEvent?.(r.verdict); }
  const set = (key,value)=>setForm(f=>({...f,[key]:value}));

  return <section className="enforcement-grid">
    <form className="panel form-panel" onSubmit={run}>
      <div className="panel-title">⚡ S.A.A.R.E. ENFORCEMENT <span>/api/v1/intercept</span></div>
      <label>Agent<input value={form.agent} onChange={e=>set('agent',e.target.value)} /></label>
      <label>Action<select value={form.action} onChange={e=>set('action',e.target.value)}><option>SEND_PAYMENT</option><option>READ_FINANCIAL_DATA</option><option>EXPORT_CUSTOMERS</option><option>DELETE_RECORDS</option><option>READ_PUBLIC_DATA</option></select></label>
      <label>Prompt / payload<input value={form.prompt} onChange={e=>set('prompt',e.target.value)} /></label>
      <label>Policy<input value={form.policy} onChange={e=>set('policy',e.target.value)} /></label>
      <label className="checkbox"><input type="checkbox" checked={form.forceReview} onChange={e=>set('forceReview',e.target.checked)} /> Forzar REVIEW</label>
      <button className="primary" type="submit" disabled={busy}>{busy?'Evaluando…':'Interceptar y juzgar'}</button>
    </form>
    <div className="panel result-panel">
      <div className="panel-title">VEREDICTO</div>
      {!result ? <div className="empty-state">Sin ejecución. Somete una acción al motor.</div> : <>
        <div className={`verdict-big ${result.verdict}`}>{result.verdict}</div>
        <p className="result-reason">{result.reasons?.join(' · ')}</p>
        <div className="result-meta"><div><span>TRACE</span><b>{result.traceId}</b></div><div><span>POLICY</span><b>{result.policy}</b></div><div><span>PII</span><b>{result.piiDetected?'DETECTED / SANITIZED':'NOT DETECTED'}</b></div><div><span>MODE</span><b>FAIL-CLOSED</b></div></div>
      </>}
    </div>
  </section>;
}
