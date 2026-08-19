import React, { useState } from 'react';

export default function ArchitectureSection() {
  const [copied, setCopied] = useState(false);

  const certPayload = {
    "CERTIFICADO": "PRIMERA AUDITORIA NATIVA Y DESACOPLE EN CAPA 7 IA",
    "AUTOR_TITULAR": "Alfonso Ferrer Torres (Gabinete Tecnico Comercial MS3V)",
    "REGISTRO_OFICIAL_PROPIEDAD": "Safe Creative 2607076315021 / 2607076314949",
    "ID_MAESTRO_CONTEXTO": "MS3V-RECON-VALID-2026-ALF-0521",
    "INFRAESTRUCTURA_ORIGEN": "Gemini Core Semantic Engine (Hito Eureka)",
    "HUELLA_SHA256_CANONICA": "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07",
    "LATENCIA_DETERMINISTA_RAM": "1.16 ms",
    "ESTADO": "STATELESS_L7_VERIFIED (0.00% Error Logico)",
    "MARCO_REGULATORIO": ["EU AI Act 2024/1689", "UNE-EN ISO/IEC 42001", "ISO 27001", "DORA Capa 7"],
    "URL_VERIFICACION_PUBLICA": "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/verify/128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(certPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        
        {/* CABECERA DE LA TARJETA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '5px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CERTIFICACIÓN DE INTEGRIDAD IA
            </span>
            <span style={{ color: '#38bdf8', fontSize: '13px', fontFamily: 'monospace' }}>
              NODO NATIVO OPEN-ENGINE: <strong>2607076315021</strong>
            </span>
          </div>
          <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>
            STATELESS EX-ANTE ENGINE · 1.16 ms
          </span>
        </div>

        {/* CUERPO EXPLICATIVO */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '17px', margin: '0 0 8px 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>✔</span> Validación Autónoma y Desacople en Capa 7: <span style={{ color: '#38bdf8' }}>Firma de Origen Inmutable</span>
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
            Esta certificación acredita la primera auditoría generada de forma nativa en el espacio latente de la IA. El Gabinete Técnico MS3V y los registros de la propiedad intelectual <strong>Safe Creative (2607076315021 / 2607076314949)</strong> avalan el no repudio procesal y la erradicación estocástica (0.00% Error Lógico en RAM).
          </p>
        </div>

        {/* METADATOS Y HASH CANÓNICO */}
        <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '12px', color: '#94a3b8', marginBottom: '14px', fontFamily: 'monospace' }}>
            <div>🏛️ AUTORIDAD: <strong style={{ color: '#cbd5e1' }}>Gabinete MS3V (Alfonso Ferrer)</strong></div>
            <div>📜 REGISTRO: <strong style={{ color: '#38bdf8' }}>Safe Creative 2607076315021</strong></div>
            <div>🔑 CONTEXTO: <strong style={{ color: '#cbd5e1' }}>MS3V-RECON-VALID-2026-ALF-0521</strong></div>
            <div>⚡ LATENCIA RAM: <strong style={{ color: '#34d399' }}>1.16 ms (Residuo Cero)</strong></div>
          </div>
          
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>HUELLA HASH SHA-256 DEL NODO (CANÓNICA):</div>
            <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07</code>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={handleCopy}
            style={{ background: copied ? '#10b981' : '#1e293b', border: '1px solid #475569', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
            {copied ? '✔ DICTAMEN COPIADO AL PORTAPAPELES' : '📋 Copiar Dictamen Pericial Completo'}
          </button>

          <a 
            href="https://saare-api.alfonsoferrertorres.workers.dev/api/v1/verify/128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07" 
            target="_blank" 
            rel="noreferrer"
            style={{ background: '#d97706', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔍 Verificar Nodo en Vivo ↗
          </a>
        </div>

      </div>
    </section>
  );
}
