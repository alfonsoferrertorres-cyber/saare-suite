import React,{useState} from 'react';

const programs=[
 {id:'KIT-CONSULTING',title:'Kit Consulting',scope:'Ciberseguridad · gobierno del dato · adaptación IA'},
 {id:'KIT-DIGITAL',title:'Kit Digital',scope:'Despliegue de herramientas digitales / IA segura'},
 {id:'INCIBE',title:'Misiones Ciberseguridad',scope:'Ciberresiliencia · evidencia digital · preservación'},
 {id:'CDTI',title:'CDTI / Misiones',scope:'I+D · resiliencia · evidencia técnica'}
];
export default function SubsidiesHub(){
 const [selected,setSelected]=useState(programs[0].id); const [status,setStatus]=useState('');
 function exportDossier(){
   const p=programs.find(x=>x.id===selected); const dossier={generatedAt:new Date().toISOString(),program:p,protocol:'MS3V-RECON-VALID-2026-ALF-0521',controls:['FAIL-CLOSED','L7 INTERCEPTION','CRYPTOGRAPHIC EVIDENCE','ZERO-DISK / VOLATILE MEMORY']};
   const blob=new Blob([JSON.stringify(dossier,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`SAARE-${p.id}-dossier.json`; a.click(); URL.revokeObjectURL(url); setStatus('Dossier JSON generado. Conecta el exportador oficial al expediente real antes de presentarlo.');
 }
 return <section className="view-grid cols-2"><div className="panel"><div className="panel-title">🏛️ SUBSIDIES HUB <span>GOVERNANCE / FUNDING</span></div><p className="muted">Generación estructurada de paquetes de justificación a partir de controles técnicos documentados.</p>{programs.map(p=><button key={p.id} className={`program ${selected===p.id?'selected':''}`} onClick={()=>setSelected(p.id)}><b>{p.title}</b><span>{p.scope}</span></button>)}<button className="primary" onClick={exportDossier}>Export dossier JSON</button>{status&&<div className="success-note">{status}</div>}</div><div className="panel dossier-preview"><div className="panel-title">DOSSIER PREVIEW <span>{selected}</span></div><pre>{JSON.stringify({protocol:'MS3V-RECON-VALID-2026-ALF-0521',activeMode:'SAARE-MD-CORP',evidence:['digest','merkle','ed25519','rfc3161'],resilience:'8 invariants / fail-closed',program:selected},null,2)}</pre><button className="secondary" onClick={()=>window.print()}>Imprimir dossier</button></div></section>;
}
