import React,{useMemo,useState} from 'react';
import GovernanceToolbar from './components/GovernanceToolbar.jsx';
import ExecutiveView from './components/ExecutiveView.jsx';
import GrcAuditView from './components/GrcAuditView.jsx';
import EnforcementView from './components/EnforcementView.jsx';
import ForensicView from './components/ForensicView.jsx';
import EvidenceVerify from './components/EvidenceVerify.jsx';
import ResilienceLab from './components/ResilienceLab.jsx';
import SubsidiesHub from './components/SubsidiesHub.jsx';
import DossierExporter from './components/DossierExporter.jsx';

const baseEvents=[
 {id:'VRD-001',time:'09:12:44',agent:'treasury-agent-04',action:'SEND_PAYMENT',verdict:'DENY'},
 {id:'VRD-002',time:'09:13:18',agent:'data-agent-07',action:'READ_FINANCIAL_DATA',verdict:'REVIEW'},
 {id:'VRD-003',time:'09:14:02',agent:'support-agent-02',action:'READ_PUBLIC_DATA',verdict:'ALLOW'},
 {id:'VRD-004',time:'09:15:36',agent:'data-agent-07',action:'EXPORT_CUSTOMERS',verdict:'DENY'}
];
const policies=[
 {id:'FIN-PAYMENT-042',name:'Financial payment boundary',version:'v17',state:'ACTIVE'},
 {id:'PII-EGRESS-006',name:'Sensitive information egress',version:'v9',state:'ACTIVE'},
 {id:'AGENCY-SCOPE-013',name:'Agent action scope',version:'v4',state:'ACTIVE'}
];
const invariants=Array.from({length:8},(_,i)=>({id:`INV-${String(i+1).padStart(2,'0')}`,state:'PASS'}));

export default function App(){
 const [view,setView]=useState('executive'); const [mode,setMode]=useState('SAARE-MD-CORP'); const [events,setEvents]=useState(baseEvents);
 const stats=useMemo(()=>({total:events.length,allow:events.filter(e=>e.verdict==='ALLOW').length,deny:events.filter(e=>e.verdict==='DENY').length,review:events.filter(e=>e.verdict==='REVIEW').length}),[events]);
 function addEvent(verdict){ setEvents(e=>[...e,{id:`VRD-${String(e.length+1).padStart(3,'0')}`,time:new Date().toLocaleTimeString('es-ES'),agent:'demo-agent',action:'SIMULATED_ACTION',verdict}]); }
 const nav=[['executive','EXECUTIVE'],['enforcement','ENFORCEMENT'],['resilience','RESILIENCE LAB'],['grc','GRC & AUDIT'],['forensic','FORENSIC AUDIT'],['evidence','EVIDENCE VERIFY'],['subsidies','SUBSIDIES HUB'],['export','DOSSIER EXPORT']];
 return <div className="app-shell">
   <aside className="sidebar">
     <div className="side-brand"><div className="brand-icon">S</div><div><b>S.A.A.R.E.</b><small>v7 PRO / CONTROL PLANE</small></div></div>
     <div className="status-card"><span><i></i>CONTROL PLANE</span><b>OPERATIONAL / DEMO</b><small>Backend adapter: {import.meta.env.VITE_CONTROL_PLANE_URL?'CONNECTED':'LOCAL FALLBACK'}</small></div>
     <div className="side-section">WORKSPACE</div>
     {nav.map(([id,label])=><button className={`nav-item ${view===id?'active':''}`} key={id} onClick={()=>setView(id)}><span>{iconFor(id)}</span>{label}</button>)}
     <div className="side-bottom"><div><span>PROTOCOL</span><b>SGP 1.0</b></div><div><span>STATE</span><b>FAIL-CLOSED</b></div></div>
   </aside>
   <main className="main">
     <div className="topline"><div><span className="route">CONTROL PLANE / {view.toUpperCase()}</span><h1>{pageTitle(view)}</h1></div><div className="top-actions"><span className="pill">MS3V-RECON-VALID-2026-ALF-0521</span><button onClick={()=>document.documentElement.classList.toggle('compact')}>◐</button></div></div>
     <GovernanceToolbar mode={mode} setMode={setMode} onExport={()=>setView('export')} />
     {view==='executive'&&<ExecutiveView stats={stats} mode={mode}/>} 
     {view==='enforcement'&&<EnforcementView onEvent={addEvent}/>} 
     {view==='resilience'&&<ResilienceLab/>}
     {view==='grc'&&<GrcAuditView invariants={invariants} policies={policies}/>} 
     {view==='forensic'&&<ForensicView events={events}/>} 
     {view==='evidence'&&<EvidenceVerify/>}
     {view==='subsidies'&&<SubsidiesHub/>}
     {view==='export'&&<DossierExporter events={events}/>} 
     <footer><span>SAARE SGP 1.0 · Local-first governance console</span><span>DEMO / BENCHMARK / REFERENCE / LIVE labeling required for production claims</span></footer>
   </main>
 </div>;
}
function iconFor(id){return {executive:'▣',enforcement:'⚡',resilience:'◈',grc:'▤',forensic:'⌁',evidence:'✓',subsidies:'⌘',export:'⇩'}[id]}
function pageTitle(view){return {executive:'Executive control center',enforcement:'Runtime enforcement',resilience:'Resilience laboratory',grc:'Governance & audit',forensic:'Forensic trace',evidence:'Independent verification',subsidies:'Subsidies Hub',export:'Evidence dossier'}[view]}
