import React from 'react';
import { Link } from 'react-router-dom';

const SCENARIOS = [
  { 
    id: 'banking_fintech', 
    title: 'Banca, FinTech & Entidades Financieras', 
    tag: 'DORA / PCI-DSS', 
    desc: 'Cumplimiento estricto de DORA y PCI-DSS. Ocultación en RAM de Tarjetas, IBANs y scoring crediticio via PerimeterShield.' 
  },
  { 
    id: 'dev_rag_finops', 
    title: 'Desarrolladores & Integradores RAG', 
    tag: 'FinOps & RAG Safe', 
    desc: 'Ahorro de costes FinOps API hasta un 45% y erradicación de alucinaciones en RAG corporativo via LabEngine.' 
  },
  { 
    id: 'court_verifier_soc', 
    title: 'Peritos Judiciales, Despachos & SOCs', 
    tag: 'Evidencia Probatoria', 
    desc: 'Sellado criptográfico inmutable en RAM con firma Ed25519 y validez probatoria ante tribunales via EvidenceVault.' 
  },
  { 
    id: 'grc_dpo_iso', 
    title: 'Consultoras GRC, DPOs & Auditores ISO', 
    tag: 'EU AI Act / ISO 42001', 
    desc: 'Automatización de reportes AEPD/AESIA bajo el EU AI Act y generación del SoA para ISO/IEC 42001 via ComplianceSuite.' 
  },
  { 
    id: 'defense_gov_airgap', 
    title: 'Defensa, Infraestructuras Críticas & Gobierno', 
    tag: 'Militar Air-Gapped', 
    desc: 'Operación en entornos totalmente aislados (Air-Gapped) con emisión nula de datos al exterior via SovereigntyNode.' 
  },
  { 
    id: 'edtech_k12', 
    title: 'Plataformas EdTech & Centros Educativos', 
    tag: 'COPPA / K-12 Safe', 
    desc: 'Filtro pedagógico socrático compatible con COPPA que guía razonamientos sin dar respuestas directas via EduTutorGuard.' 
  },
  { 
    id: 'media_kyc_c2pa', 
    title: 'Plataformas de Medios, IP & Verificación KYC', 
    tag: 'KYC & C2PA Anti-Fraud', 
    desc: 'Antifraude en onboarding bancario (KYC) y auditoría de derechos de autor con marcas C2PA via DeepFakeShield & AuthorVault.' 
  }
];

export default function Store() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <header className="text-center max-w-3xl mx-auto mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full border border-[#C5A059]/30">
          Catálogo de Escenarios Comercializable
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white mt-3">
          ¿Qué quieres proteger hoy?
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Selecciona un escenario especializado. S.A.A.R.E. se encarga de empaquetar y ejecutar la lógica en el Runtime.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((sc) => (
          <article 
            key={sc.id} 
            className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-[#C5A059] transition-all duration-200 hover:-translate-y-1 shadow-lg"
          >
            <div>
              <span className="text-[10px] font-mono text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/20">
                {sc.tag}
              </span>
              <h2 className="text-lg font-bold text-white mt-3">{sc.title}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{sc.desc}</p>
            </div>
            <Link
              to={`/login?scenario=${sc.id}`}
              aria-label={`Activar escenario para ${sc.title}`}
              className="mt-6 text-center bg-[#C5A059] text-black font-extrabold text-xs py-2.5 rounded-xl hover:bg-white transition-all duration-200 font-mono shadow-md"
            >
              Activar Escenario
            </Link>
          </article>
        ))}
      </main>
    </div>
  );
}