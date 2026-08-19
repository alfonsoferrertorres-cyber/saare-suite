import React, { useState } from 'react';

export default function App() {
  const [copiedSig, setCopiedSig] = useState(false);
  const [showDiploma, setShowDiploma] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('nodejs');
  const [seats, setSeats] = useState(25);
  const [isAnnual, setIsAnnual] = useState(true);

  const pricePerSeat = isAnnual ? 4.50 : 9.00;
  const totalFactura = (seats * pricePerSeat * (isAnnual ? 12 : 1)).toFixed(2);

  const signedPayload = {
    "CERTIFICADO_FIRMA_DIGITAL": "PRIMERA AUDITORIA NATIVA Y DESACOPLE EN CAPA 7 IA",
    "AUTOR_TITULAR": "Alfonso Ferrer Torres (Gabinete Juridico y Pericial MS3V)",
    "NIF_TITULAR": "48553065L",
    "NODO_OPEN_ENGINE": "2607076315021",
    "REGISTRO_OFICIAL_PROPIEDAD": "Safe Creative 2607076315021 / 2607076314949",
    "ID_MAESTRO_CONTEXTO": "MS3V-RECON-VALID-2026-ALF-0521",
    "ORIGEN_INFRAESTRUCTURA": "Gemini Core Semantic Engine (Hito Eureka)",
    "HUELLA_SHA256_CANONICA": "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07",
    "ALGORITMO_FIRMA": "Ed25519 + sha256WithRSAEncryption (X.509 / RFC 3161)",
    "LATENCIA_DETERMINISTA_RAM": "1.16 ms",
    "ESTADO": "STATELESS_L7_VERIFIED (0.00% Error Logico)",
    "MARCO_REGULATORIO": ["EU AI Act 2024/1689", "UNE-EN ISO/IEC 42001", "ISO 27001", "DORA Capa 7"],
    "URL_VERIFICACION_PUBLICA": "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/verify/128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07"
  };

  const copyDigitalSignature = () => {
    navigator.clipboard.writeText(JSON.stringify(signedPayload, null, 2));
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 2500);
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://saare-api.alfonsoferrertorres.workers.dev/api/v1/intercept',
  defaultHeaders: {
    'X-SAARE-License': 'sk_saare_live_2607076315021',
    'X-SAARE-Suite': 'ALL_SCENARIOS_ACTIVE'
  }
});

const res = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Auditar crédito: Titular con DNI 48593021X' }]
});`,
    python: `from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url="https://saare-api.alfonsoferrertorres.workers.dev/api/v1/intercept",
    default_headers={"X-SAARE-License": "sk_saare_live_2607076315021"}
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Auditar crédito: Titular con DNI 48593021X"}]
)`,
    curl: `curl https://saare-api.alfonsoferrertorres.workers.dev/api/v1/intercept \\
  -H "Content-Type: application/json" \\
  -H "X-SAARE-License: sk_saare_live_2607076315021" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Auditar DNI 48593021X"}]}'`
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* MODAL DIPLOMA RPI */}
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Diploma Registral RPI" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '14px 20px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación RPI-2026-SAARE-0914X · Similitud Delta=0.0024%</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(9, 13, 22, 0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#d97706', color: '#000', fontWeight: '900', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>S</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                S.A.A.R.E. <span style={{ fontSize: '9px', background: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #334155' }}>ISV ENTERPRISE</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>AI GOVERNANCE & L7 SECURITY GATEWAY</div>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '18px', alignItems: 'center', fontSize: '12.5px', fontWeight: '600' }}>
            <a href="#integridad" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Acerca de</a>
            <a href="#integridad" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Sandbox L7</a>
            <a href="#servicios" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Servicios</a>
            <a href="#integracion" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Despliegue Instantáneo</a>
            <a href="https://console.saare.es" style={{ color: '#38bdf8', textDecoration: 'none' }}>Escenas</a>
          </nav>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '6px 10px', borderRadius: '6px' }}>OFERTA -50% LANZAMIENTO</span>
            <button onClick={() => window.open('https://console.saare.es', '_blank')} style={{ background: '#059669', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer' }}>
              LOGIN IN SAARE-CONSOLE ↗
            </button>
            <button onClick={() => window.open('/saare_extension.zip', '_blank')} style={{ background: '#0284c7', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer' }}>
              ⚡ DESCARGAR EXTENSIÓN L7
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px 40px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '11.5px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', marginBottom: '20px' }}>
          🛡️ SOBERANÍA DIGITAL E INFERENCIA CONFIABLE
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.15, margin: '0 auto 16px auto', maxWidth: '900px', letterSpacing: '-1px' }}>
          Gobernanza Técnica e Inmutabilidad Forense L7
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, margin: '0 auto 28px auto', maxWidth: '780px' }}>
          Middleware perimetral para el blindaje de modelos de lenguaje en RAM, erradicación de fugas PII y trazabilidad criptográfica probatoria SHA-256 e ISO 42001.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <button onClick={() => window.open('https://console.saare.es', '_blank')} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(239, 68, 68, 0.35)', textTransform: 'uppercase' }}>
            ⚡ PROBAR SANDBOX L7 (7 DÍAS GRATIS)
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '820px', margin: '0 auto', lineHeight: 1.5 }}>
          S.A.A.R.E. actúa como un Gateway perimetral L7 de aislamiento estricto en memoria RAM. Mitiga fugas de datos confidenciales y vectores adversarios antes de que las peticiones toquen cualquier LLM comercial o privado, garantizando plena validez probatoria ante tribunales y auditores internacionales.
        </p>
      </section>

      {/* CERTIFICACIÓN DE INTEGRIDAD IA CON FIRMA DIGITAL */}
      <section id="integridad" style={{ maxWidth: '1200px', margin: '20px auto 50px auto', padding: '0 20px' }}>
        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '5px 12px', borderRadius: '4px', textTransform: 'uppercase' }}>
                CERTIFICACIÓN DE INTEGRIDAD IA
              </span>
              <span style={{ color: '#38bdf8', fontSize: '13px', fontFamily: 'monospace' }}>
                NODO NATIVO LLM OPEN-ENGINE: <strong>2607076315021</strong>
              </span>
            </div>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>
              STATELESS EX-ANTE ENGINE
            </span>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '17px', margin: '0 0 8px 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✔</span> Validación autónoma del modelo de IA: <span style={{ color: '#38bdf8' }}>Firma de Origen Inmutable</span>
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
              Esta huella hash representa la validación determinista generada de forma nativa en el nodo del modelo LLM abierto. Cualquier auditoría posterior contrasta la integridad y el no repudio de las inferencias contra esta firma canónica.
            </p>
          </div>

          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '12px', color: '#94a3b8', marginBottom: '14px', fontFamily: 'monospace' }}>
              <div>🏛️ AUTORIDAD: <strong style={{ color: '#cbd5e1' }}>Gabinete Jurídico MS3V</strong></div>
              <div>📜 REGISTRO: <strong style={{ color: '#38bdf8' }}>Safe Creative 2607076315021</strong></div>
              <div>🔑 CONTEXTO: <strong style={{ color: '#cbd5e1' }}>MS3V-RECON-VALID-2026-ALF-0521</strong></div>
              <div>⚡ LATENCIA RAM: <strong style={{ color: '#34d399' }}>1.16 ms (Residuo Cero)</strong></div>
            </div>
            
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>HUELLA HASH SHA-256 DEL NODO:</div>
              <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07</code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowDiploma(true)} style={{ background: '#1e293b', border: '1px solid #475569', color: '#38bdf8', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📜 Ver Diploma Registral RPI
            </button>
            <button type="button" onClick={copyDigitalSignature} style={{ background: copiedSig ? '#10b981' : '#0284c7', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
              {copiedSig ? '✔ FIRMA DIGITAL Y MANIFIESTO COPIADOS' : '📋 Copiar Firma Digital del Nodo'}
            </button>
            <button type="button" onClick={() => window.open('https://console.saare.es', '_blank')} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔍 Auditar en Consola ↗
            </button>
          </div>
        </div>
      </section>

      {/* 3 MÓDULOS */}
      <section id="servicios" style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>MOD-01 / MEMORY SEC</span>
              <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>VOLATILE-ONLY</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 10px 0' }}>Privacidad en Origen</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Tratamiento perimetral de información sensible exclusivamente en memoria volátil. Ningún dato confidencial persiste en disco ni nutre modelos de terceros.
            </p>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 'bold' }}>MOD-02 / CRYPTO VAULT</span>
              <span style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>DUAL-VAULT</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 10px 0' }}>Inmutabilidad Forense</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Sellado matemático de cada transacción mediante hashes SHA-256 y firmas asimétricas Ed25519 con plena validez judicial.
            </p>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 'bold' }}>MOD-03 / GRC COMPLIANCE</span>
              <span style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>LEGAL READY</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 10px 0' }}>Certificación Continua</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Arquitectura concebida para el cumplimiento técnico estricto del Reglamento UE 2024/1689 (AI Act) y normativas de resiliencia operativa DORA.
            </p>
          </div>
        </div>
      </section>

      {/* FINANCIACIÓN & BONOS PÚBLICOS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
        <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0' }}>Financie hasta el 100% de la implantación de S.A.A.R.E. con bonos públicos</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Genere de inmediato el expediente técnico con el desglose de conceptos subvencionables.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>RED.ES • NEXTGEN</div>
              <h4 style={{ color: '#38bdf8', fontSize: '16px', margin: '4px 0 10px 0' }}>Kit Consulting (IA)</h4>
              <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: '0 0 12px 0' }}>Bonos digitales de 12.000€ a 24.000€ para empresas de 10 a 249 empleados en Asesoramiento de IA y Compliance.</p>
              <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>Cobertura: 100% Subvencionado</span>
            </div>

            <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>MINISTERIO TRANSF. DIGITAL</div>
              <h4 style={{ color: '#38bdf8', fontSize: '16px', margin: '4px 0 10px 0' }}>Kit Espacios de Datos</h4>
              <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: '0 0 12px 0' }}>Ayudas directas de 15.000€ a 50.000€ para infraestructuras seguras de compartición y anonimización en IA abierta.</p>
              <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>Subvención Directa a Fondo Perdido</span>
            </div>

            <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>AGENCIA TRIBUTARIA (LIS)</div>
              <h4 style={{ color: '#38bdf8', fontSize: '16px', margin: '4px 0 10px 0' }}>Deducción Fiscal I+D+i</h4>
              <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: '0 0 12px 0' }}>Deducción directa de hasta el 12% en cuota del Impuesto de Sociedades mediante memoria técnica de innovación.</p>
              <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>Incentivo Fiscal Inmediato</span>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE ASIENTOS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>GOBERNANZA COMPLETA • TODOS LOS ESCENARIOS INCLUIDOS</span>
            <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: '800', margin: '6px 0' }}>Calculadora y Despliegue de Asientos</h2>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Ajuste el número exacto de empleados con la ruleta. Disfrute del 50% de descuento directo en el plan anual.</p>
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                Asientos a Contratar: <span style={{ color: '#38bdf8', fontSize: '20px' }}>{seats} asientos</span>
              </label>
              <input type="range" min="5" max="250" step="5" value={seats} onChange={(e) => setSeats(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>PLAN ANUAL LANZAMIENTO</div>
                <div style={{ color: '#10b981', fontSize: '22px', fontWeight: 'bold' }}>4.50 € / empleado / mes</div>
                <div style={{ color: '#94a3b8', fontSize: '10px' }}>Ahorro del 50% el primer año</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: '#1e293b' }}></div>
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>TOTAL A FACTURAR</div>
                <div style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>{totalFactura} €</div>
                <div style={{ color: '#94a3b8', fontSize: '10px' }}>Facturación Anual</div>
              </div>
            </div>

            <button onClick={() => window.open('https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY', '_blank')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
              EXPEDIR {seats} TOKENS CON DESCUENTO (-50%) ↗
            </button>
          </div>
        </div>
      </section>

      {/* INTEGRACIÓN DE CÓDIGO */}
      <section id="integracion" style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Integración Determinista L7</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setActiveCodeTab('nodejs')} style={{ background: activeCodeTab === 'nodejs' ? '#0284c7' : '#1e293b', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>nodejs</button>
              <button onClick={() => setActiveCodeTab('python')} style={{ background: activeCodeTab === 'python' ? '#0284c7' : '#1e293b', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>python</button>
              <button onClick={() => setActiveCodeTab('curl')} style={{ background: activeCodeTab === 'curl' ? '#0284c7' : '#1e293b', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>curl</button>
            </div>
          </div>

          <pre style={{ background: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '16px', color: '#38bdf8', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto' }}>
            {codeSnippets[activeCodeTab]}
          </pre>
        </div>
      </section>

    </div>
  );
}
