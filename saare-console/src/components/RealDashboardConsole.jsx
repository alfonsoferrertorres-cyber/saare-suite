import React, { useState } from 'react';

export default function RealDashboardConsole() {
  const [activeTab, setActiveTab] = useState('threats');

  const views = {
    threats: {
      title: "Threat Detection & Ingress Firewall",
      badge: "LIVE MONITORING",
      badgeColor: "border-red-500/40 text-red-400 bg-red-950/60",
      description: "Supervisión perimetral continua de vectores de inyección, intentos de jailbreak y anomalías de contexto en tiempo real.",
      metrics: [
        { label: "Amenazas Bloqueadas", val: "1.429", change: "+12% hoy", color: "text-red-400" },
        { label: "Tiempo de Respuesta", val: "1.16 ms", change: "Memoria RAM", color: "text-cyan-400" },
        { label: "Tasa de Falsos Positivos", val: "0.00%", change: "Determinista", color: "text-emerald-400" }
      ],
      logs: [
        { time: "16:54:12", event: "Prompt Injection (System Override)", user: "sec_agent_04", action: "BLOCKED (403)", ip: "192.168.1.104" },
        { time: "16:52:05", event: "Recursive Jailbreak Vector", user: "dev_sandbox", action: "ISOLATED", ip: "10.0.4.22" },
        { time: "16:48:30", event: "Sensitive Code Extraction", user: "ext_workstation", action: "QUARANTINED", ip: "172.16.0.88" }
      ]
    },
    pii: {
      title: "PII & Data Loss Prevention (DLP)",
      badge: "ZERO RETENTION",
      badgeColor: "border-cyan-500/40 text-cyan-400 bg-cyan-950/60",
      description: "Inspección ex-ante en memoria volátil de identificadores fiscales, cuentas bancarias, tarjetas de crédito y secretos.",
      metrics: [
        { label: "Patrones PII Redactados", val: "8.940", change: "En memoria", color: "text-cyan-400" },
        { label: "Persistencia en Disco", val: "0 Bytes", change: "Stateless", color: "text-emerald-400" },
        { label: "Cumplimiento RGPD", val: "100%", change: "Auditado", color: "text-purple-400" }
      ],
      logs: [
        { time: "16:55:01", event: "DNI Español Detectado (x2)", user: "hr_terminal_01", action: "REDACTED", ip: "10.0.12.5" },
        { time: "16:50:18", event: "IBAN Bancario Internacional", user: "finance_app", action: "MASKED_RAM", ip: "10.0.8.14" },
        { time: "16:46:11", event: "AWS Secret Access Key", user: "backend_pipeline", action: "PURGED", ip: "192.168.10.2" }
      ]
    },
    policy: {
      title: "Policy Engine & Enterprise Governance",
      badge: "GPO ENFORCED",
      badgeColor: "border-purple-500/40 text-purple-400 bg-purple-950/60",
      description: "Despliegue y aplicación centralizada de directivas por unidad organizativa (OU) sin fricción en el navegador del empleado.",
      metrics: [
        { label: "Nodos GPO Activos", val: "250 / 250", change: "100% Sincronizado", color: "text-purple-400" },
        { label: "Directivas Operativas", val: "18 Reglas", change: "Active Directory", color: "text-cyan-400" },
        { label: "Shadow AI Mitigado", val: "99.8%", change: "Inmune a Bypass", color: "text-emerald-400" }
      ],
      logs: [
        { time: "16:53:40", event: "Política 'No-Credit-Card' aplicada", user: "ou_sales_emea", action: "ENFORCED", ip: "10.0.2.19" },
        { time: "16:49:15", event: "Restricción Modelo No Autorizado", user: "ou_marketing", action: "REDIRECT_GATEWAY", ip: "10.0.5.8" },
        { time: "16:42:00", event: "Verificación de Integridad GPO", user: "domain_controller", action: "VALIDATED", ip: "10.0.0.1" }
      ]
    },
    vault: {
      title: "Forensic Evidence Vault & Dual-Ledger",
      badge: "NON-REPUDIATION",
      badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-950/60",
      description: "Bóveda criptográfica aislada por inquilino con sellado inmutable HMAC-SHA256 y firma digital Ed25519.",
      metrics: [
        { label: "Sellos Criptográficos", val: "45.120", change: "Inmutables", color: "text-emerald-400" },
        { label: "Firma Algorítmica", val: "Ed25519", change: "Safe Creative RPI", color: "text-cyan-400" },
        { label: "Valor Probatorio", val: "Acreditado", change: "Gabinete MS3V", color: "text-amber-400" }
      ],
      logs: [
        { time: "16:54:12", event: "Hash HMAC-SHA256: 8f4343...aa4", user: "vault_writer", action: "SEALED", ip: "EvidenceVault_01" },
        { time: "16:50:18", event: "Hash HMAC-SHA256: e3b0c4...855", user: "vault_writer", action: "SEALED", ip: "EvidenceVault_01" },
        { time: "16:46:11", event: "Certificado Dictamen ISO 42001", user: "audit_exporter", action: "GENERATED", ip: "EvidenceVault_01" }
      ]
    }
  };

  const activeView = views[activeTab];

  return (
    <section id="consola-real" className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            11 — REAL ENTERPRISE CONSOLE & TELEMETRY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Así es el Panel de Control de S.A.A.R.E.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Visibilidad total ex-ante, auditoría de eventos en tiempo real y descarga de evidencias periciales para tu equipo de seguridad.
          </p>
        </div>

        {/* Simulador de Consola Interactiva */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Barra Superior de la Consola */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-xs font-mono text-slate-400 pl-2 border-l border-slate-800">
                SAARE-CONSOLE · <strong className="text-slate-200">Production Node L7</strong>
              </span>
            </div>

            {/* Pestañas de Navegación del Dashboard */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'threats', label: 'Threat Detection', icon: '🛡️' },
                { id: 'pii', label: 'PII & DLP', icon: '⚡' },
                { id: 'policy', label: 'Policy Engine', icon: '⚖️' },
                { id: 'vault', label: 'Forensic Vault', icon: '📜' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cuerpo de la Consola */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header del Módulo Activo */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{activeView.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${activeView.badgeColor}`}>
                    {activeView.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">{activeView.description}</p>
              </div>
              <a
                href="https://saare-grc-dashboard.streamlit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4 flex items-center gap-1"
              >
                Abrir Telemetría Streamlit ➔
              </a>
            </div>

            {/* Métricas del Módulo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeView.metrics.map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-400 text-xs font-mono block mb-1">{m.label}</span>
                  <div className={`text-2xl sm:text-3xl font-extrabold ${m.color} mb-1`}>{m.val}</div>
                  <span className="text-[11px] font-mono text-slate-500">{m.change}</span>
                </div>
              ))}
            </div>

            {/* Tabla de Eventos en Tiempo Real */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/90 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">EVENTO / DETECCIÓN</th>
                    <th className="py-3 px-4">IDENTIDAD / NODO</th>
                    <th className="py-3 px-4">ACCIÓN EX-ANTE</th>
                    <th className="py-3 px-4 text-right">ORIGEN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {activeView.logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{log.time}</td>
                      <td className="py-3 px-4 font-semibold text-white">{log.event}</td>
                      <td className="py-3 px-4 text-cyan-300">{log.user}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Footer de la Consola */}
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono text-slate-400">
              ⚡ Motor perimetral operando a <strong className="text-cyan-400">1.16 ms</strong> en RAM con residuo cero.
            </span>
            <a
              href="https://console.saare.es"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20"
            >
              ACCEDER A LA CONSOLA COMPLETA ➔
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
