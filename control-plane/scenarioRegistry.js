// control-plane/scenarioRegistry.js
export const ScenarioRegistry = [
  {
    id: "cumplimiento_corporativo_es",
    category: "AI Workflows & Corporativo",
    title: "Cumplimiento Corporativo ES (Máxima Seguridad)",
    description: "Protección integral L7 con bloqueo determinista de PII, secretos y Prompt Injection en flujos corporativos.",
    version: "2.0.0",
    tag: "GATEWAY / SDK",
    integration_mode: "GATEWAY_HTTP",
    latency: "1.16 ms",
    codeTab: "nodejs",
    verified: "0.00% Fuga PII",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
    badgeColor: "#2F81F7",
    icon: "⚡",
    compliance_mapping: {
      dora: ["Art. 9(2) - Proteccion de sistemas TIC", "Art. 10 - Deteccion de actividades anomalas"],
      pci_dss_v4: ["Req 6.4.2 - WAF L7 para aplicaciones web", "Req 10.2.1 - Registros de auditoria inmutables"],
      iso_27001: ["A.8.16 - Monitorizacion de actividades", "A.8.28 - Codificacion segura"]
    },
    rules: {
      dlp: ["PII_DNI", "BANK_IBAN", "CREDIT_CARD"],
      unsupported_claim_detection: true,
      zero_disk: true
    },
    testVector: {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Auditar titular DNI 48593021X con cuenta ES2114650100722030876293" }]
    }
  },
  {
    id: "banca_dora_pci_dss",
    category: "Fintech & Banca",
    title: "Banca & DORA / PCI-DSS Strict",
    description: "Perfil estricto para entidades financieras bajo normativa europea y aislamiento de datos de tarjetas.",
    version: "2.0.0",
    tag: "VPC PRIVADA",
    integration_mode: "PRIVATE_CONTAINER",
    latency: "0.017 ms",
    codeTab: "cabi",
    verified: "DORA Capa 7 Ready",
    gradient: "linear-gradient(135deg, #713f12 0%, #0f172a 100%)",
    badgeColor: "#EAB308",
    icon: "🏦",
    compliance_mapping: {
      dora: ["Art. 9(4) - Aislamiento de fuentes de riesgo", "Art. 11 - Respuesta y recuperacion de incidentes"],
      pci_dss_v4: ["Req 3.4 - Proteccion de datos de tarjetahabientes (PII)", "Req 10.4.1 - Sincronizacion de tiempo y firmas"],
      iso_27001: ["A.5.15 - Control de acceso", "A.8.12 - Prevencion de fuga de datos (DLP)"]
    },
    rules: {
      air_gapped: true,
      dora_compliance: true,
      no_disk_logging: true
    },
    testVector: {
      model: "on-premise-llama3",
      messages: [{ role: "user", content: "Scoring crediticio cuenta ES9121000418450200051332 con tarjeta 4548123456789012" }]
    }
  },
  {
    id: "scn-edr-cabi",
    category: "Ciberseguridad",
    title: "Sensor Hook C-ABI In-Process (EDR)",
    description: "Biblioteca nativa compilada (.so/.dll) para agentes de endpoint. Purga atómica de memoria volátil mediante SYS_madvise.",
    version: "2.0.0",
    tag: "OEM BINARIO",
    integration_mode: "EMBEDDED_CABI",
    latency: "0.017 ms",
    codeTab: "cabi",
    verified: "Residuo Cero RAM",
    gradient: "linear-gradient(135deg, #065f46 0%, #0f172a 100%)",
    badgeColor: "#20C997",
    icon: "🛡️",
    compliance_mapping: {
      iso_27001: ["A.8.7 - Proteccion contra malware", "A.8.12 - Prevencion de fuga de datos en endpoint"],
      eu_ai_act: ["Art. 15 - Ciberseguridad y robustez del runtime"]
    },
    rules: {
      dlp: ["ALL_PATTERNS", "API_KEYS", "SECRETS"],
      purge_mechanism: "SYS_madvise",
      zero_disk: true
    },
    testVector: {
      model: "local-endpoint",
      messages: [{ role: "user", content: "Extracción interna: sk_live_99a8bc76d4e210" }]
    }
  },
  {
    id: "scn-gsi-forensic",
    category: "Auditoría & GRC",
    title: "Big Four: Bóveda de Evidencia Pericial",
    description: "Generación automatizada de Proof Bundles sellados con Ed25519 y RFC 3161 para auditorías de IA y dictámenes judiciales.",
    version: "2.0.0",
    tag: "ASIENTO AUDITOR",
    integration_mode: "SAAS_CONSOLE",
    latency: "RFC 3161",
    codeTab: "nodejs",
    verified: "Validez Pericial Plena",
    gradient: "linear-gradient(135deg, #831843 0%, #0f172a 100%)",
    badgeColor: "#FF4D5A",
    icon: "⚖️",
    compliance_mapping: {
      iso_42001: ["Control B.6 - Trazabilidad y gobernanza del ciclo de vida del dato"],
      eu_ai_act: ["Art. 12 - Registro automatico de eventos (Logs inmutables)"]
    },
    rules: {
      rfc3161_timestamp: true,
      merkle_tree_inclusion: true,
      rpi_anchor: "Safe Creative Nº 2607076315021"
    },
    testVector: {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Verificación de dictamen pericial conforme a ISO/IEC 42001" }]
    }
  },
  {
    id: "scn-sanidad-salud",
    category: "Sanidad & Salud",
    title: "Resguardo de Historias Clínicas (PII)",
    description: "Protección de historiales médicos ante herramientas de IA diagnóstica con enmascaramiento de patologías y DNI.",
    version: "2.0.0",
    tag: "ENCLAVE LOPDGDD",
    integration_mode: "PRIVATE_CONTAINER",
    latency: "1.16 ms",
    codeTab: "python",
    verified: "RGPD Art. 5 y 32",
    gradient: "linear-gradient(135deg, #4c1d95 0%, #0f172a 100%)",
    badgeColor: "#A855F7",
    icon: "🏥",
    compliance_mapping: {
      rgpd_lopdgdd: ["Art. 9 - Tratamiento de categorias especiales de datos (Salud)", "Art. 32 - Seguridad del tratamiento"]
    },
    rules: {
      health_data_masking: true,
      lopdgdd_strict: true
    },
    testVector: {
      model: "claude-3-5-sonnet",
      messages: [{ role: "user", content: "Paciente DNI 77482910M diagnosticado de cardiopatía isquémica" }]
    }
  },
  {
    id: "scn-fondos-prtr",
    category: "Fondos Europeos",
    title: "Trazabilidad Inmutable NextGen & PRTR",
    description: "Memoria técnica estructurada con enlaces de verificación Edge pública comprobables por inspectores de fondos comunitarios e IGAE.",
    version: "2.0.0",
    tag: "DOSSIER PRTR",
    integration_mode: "SAAS_CONSOLE",
    latency: "RFC 3161",
    codeTab: "curl",
    verified: "No-Clawback Log",
    gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    badgeColor: "#38BDF8",
    icon: "🇪🇺",
    compliance_mapping: {
      prtr_igae: ["Orden HFP/1030/2021 - Criterios de trazabilidad y prevencion del fraude TIC"],
      eu_ai_act: ["Art. 9 - Sistema de gestion de riesgos para fondos europeos"]
    },
    rules: {
      prtr_audit_trail: true,
      anti_clawback_protection: true
    },
    testVector: {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Auditoría ex-post proyecto financiado por NextGenerationEU" }]
    }
  }
];

export function getScenarioById(id) {
  if (!id) return ScenarioRegistry[0];
  return ScenarioRegistry.find(s => s.id.toLowerCase() === id.toLowerCase()) || ScenarioRegistry[0];
}