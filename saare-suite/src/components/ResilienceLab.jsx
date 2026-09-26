import React,{useState} from 'react';
import { checkResilience } from '../api/controlPlane.js';

export default function ResilienceLab(){
 const [delta,setDelta]=useState(0.004); const [result,setResult]=useState(null); const [busy,setBusy]=useState(false);
 async function run(){setBusy(true);setResult(await checkResilience({delta:Number(delta)}));setBusy(false)}
 return <section className="lab-grid">
   <div className="panel lab-control"><div className="panel-title">🧪 SAARE RESILIENCE LAB <span>/api/v1/resilience/check</span></div>
     <div className="lab-metric"><span>THRESHOLD</span><b>Δ &lt; 0.01%</b></div>
     <label>Simulated systemic delta: <b>{Number(delta).toFixed(3)}%</b><input type="range" min="0" max="0.02" step="0.001" value={delta} onChange={e=>setDelta(e.target.value)} /></label>
     <button className="primary" onClick={run} disabled={busy}>{busy?'Running invariants…':'🧪 Invariant Audit'}</button>
     <p className="muted">Una desviación que supere el umbral de la especificación aportada se modela aquí como transición a aislamiento forense.</p>
   </div>
   <div className="panel"><div className="panel-title">8 INVARIANTS <span>FAIL-CLOSED</span></div>{result?<><div className={`lab-state ${result.status}`}>{result.status}</div><div className="invariant-grid">{result.invariants.map(i=><div key={i.id}><span>{i.id}</span><b className={i.state==='PASS'?'pass':'fail'}>{i.state}</b></div>)}</div></>:<div className="empty-state">Ejecuta el audit para obtener estado.</div>}</div>
 </section>;
}
