import React,{useState} from 'react';
import { verifyEvidence } from '../api/controlPlane.js';

export default function EvidenceVerify(){
  const [hash,setHash]=useState('6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842');
  const [res,setRes]=useState(null); const [busy,setBusy]=useState(false);
  async function verify(){setBusy(true);setRes(await verifyEvidence(hash));setBusy(false)}
  return <section className="view-grid cols-2">
    <div className="panel verify-card"><div className="panel-title">EVIDENCE VERIFIER <span>/verify/:hash</span></div><label>Hash / evidence ID<input value={hash} onChange={e=>setHash(e.target.value)} /></label><button className="primary" onClick={verify} disabled={busy}>{busy?'Verificando…':'Verify offline contract'}</button>{res&&<div className="verified"><b>✓ {res.verified?'VERIFIED':'NOT VERIFIED'}</b><span>{res.algorithm}</span><span>{res.timestamp}</span></div>}</div>
    <div className="panel chain"><div className="panel-title">EVIDENCE CHAIN <span>REFERENCE</span></div><Chain label="DIGEST" value="SHA-256"/><Chain label="MERKLE ROOT" value="6f1b3986…c7f1a842"/><Chain label="SIGNATURE" value="Ed25519"/><Chain label="TIMESTAMP" value="RFC 3161 / eIDAS"/></div>
  </section>;
}
function Chain({label,value}){return <div className="chain-row"><span>{label}</span><b>{value}</b></div>}
