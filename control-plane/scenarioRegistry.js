/**
 * S.A.A.R.E. Control-Plane L7 Scenario Registry
 * Catálogo Canónico de Escenarios de Cumplimiento, Directivas L7 y Bóvedas Periciales
 */

export const ScenarioRegistry = [
  {
    id: "cumplimiento_corporativo_es",
    category: "AI Workflows & Corporativo",
    title: "Cumplimiento Corporativo ES (Máxima Seguridad)",
    description: "Protección integral L7 con bloqueo determinista de PII, secretos y Prompt Injection en flujos corporativos y pipelines n8n / LangChain.",
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
      dora: ["Art. 9(2) - Protección de sistemas TIC", "Art. 10 - Detección de actividades anómalas"],
      pci_dss_v4: ["Req 6.4.2 - WAF L7 para aplicaciones web", "Req 10.2.1 - Registros de auditoría inmutables"],
      iso_27001: ["A.8.16 - Monitorización de actividades", "A.8.28 - Codificación segura"],
      rgpd_lopdgdd: ["Art. 5 - Principio de minimización", "Art. 32 - Seguridad del tratamiento"]
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
    description: "Perfil estricto para entidades financieras bajo normativa europea y aislamiento total de datos de tarjetas en memoria volátil.",
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
      dora: ["Art. 9(4) - Aislamiento de fuentes de riesgo", "Art. 11 - Respuesta y recuperación de incidentes"],
      pci_dss_v4: ["Req 3.4 - Protección de datos de tarjetahabientes (PAN/CVV)", "Req 10.4.1 - Sincronización de tiempo y firmas"],
      iso_27001: ["A.5.15 - Control de acceso", "A.8.12 - Prevención de fuga de datos (DLP)"]
    },
    rules: {
      air_gapped: true,
      dora_compliance: true,
      no_disk_logging: true,
      purge_mechanism: "SYS_madvise"
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
    description: "Biblioteca nativa compilada (.so/.dll) para agentes de endpoint. Purga atómica de memoria volátil mediante SYS_madvise sin escrituras a disco.",
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
      iso_27001: ["A.8.7 - Protección contra malware", "A.8.12 - Prevención de fuga de datos en endpoint"],
      eu_ai_act: ["Art. 15 - Ciberseguridad y robustez del runtime L7"]
    },
    rules: {
      dlp: ["ALL_PATTERNS", "API_KEYS", "SECRETS", "DAN_MODE_INJECTIONS"],
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
      eu_ai_act: ["Art. 12 - Registro automático de eventos (Logs inmutables)"]
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
    description: "Protección de historiales médicos ante herramientas de IA diagnóstica con enmascaramiento de patologías, tratamientos y DNI/CIP.",
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
      rgpd_lopdgdd: ["Art. 9 - Tratamiento de categorías especiales de datos (Salud)", "Art. 32 - Seguridad del tratamiento"]
    },
    rules: {
      health_data_masking: true,
      lopdgdd_strict: true,
      zero_disk: true
    },
    testVector: {
      model: "claude-3-5-sonnet",
      messages: [{ role: "user", content: "Paciente DNI 77482910M diagnosticado de cardiopatía isquémica con receta farmacológica" }]
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
      prtr_igae: ["Orden HFP/1030/2021 - Criterios de trazabilidad y prevención del fraude TIC"],
      eu_ai_act: ["Art. 9 - Sistema de gestión de riesgos para fondos europeos"]
    },
    rules: {
      prtr_audit_trail: true,
      anti_clawback_protection: true,
      dnsh_compliance_check: true
    },
    testVector: {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Auditoría ex-post proyecto financiado por NextGenerationEU Plan de Recuperación" }]
    }
  },
  {
    id: "scn-global-subsidies-hub",
    category: "Fondos & Subvenciones Multipaís",
    title: "Subvenciones Globales & Fondos Públicos (All-in-One Hub)",
    description: "Bóveda unificada para convocatorias públicas de España (LGS/PRTR/Kit Digital), Unión Europea (Horizon/RRF), EE.UU. (2 CFR 200/SBIR), UK y Latinoamérica con certificación de no doble financiación.",
    version: "1.0.0",
    tag: "GLOBAL GRANTS",
    integration_mode: "GATEWAY_HTTP",
    latency: "1.16 ms",
    codeTab: "nodejs",
    verified: "Anti-Double Funding",
    gradient: "linear-gradient(135deg, #047857 0%, #0f172a 100%)",
    badgeColor: "#10B981",
    icon: "🌐",
    compliance_mapping: {
      espana: ["Ley 38/2003 General de Subvenciones", "Orden HFP/1030/2021 PRTR", "Bases Reguladoras Red.es"],
      union_europea: ["Reglamento (UE) 2021/241 (RRF)", "Horizon Europe (UE 2021/695)", "Directiva Antifraude OLAF"],
      estados_unidos: ["Uniform Guidance (2 CFR 200)", "SBIR / STTR Reauthorization Act", "CHIPS & IRA Acts"],
      reino_unido: ["UK Subsidy Control Act 2022", "Innovate UK Grants Criteria"],
      latinoamerica: ["CORFO / ANID (Chile)", "CONACYT (México)", "FINEP (Brasil)"]
    },
    rules: {
      enforce_no_double_funding: true,
      enforce_dnsh_principle: true,
      enforce_daci_conflict: true,
      jurisdictions: ["ES", "EU", "US", "UK", "LATAM"],
      rfc3161_timestamp: true
    },
    testVector: {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Verificar elegibilidad y memoria técnica para factura INV-2026-EU-089 sin solapamiento de subvenciones" }]
    }
  },
  {
    id: "scn-edge-gateway",
    category: "Cloud Gateway & WAF",
    title: "Proxy Inverso Global en Cloudflare Edge",
    description: "Inspección distribuida en más de 300 centros de datos mundiales con inyección determinista de cabeceras L7-SEAL y control de acceso Zero-Trust.",
    version: "2.0.0",
    tag: "EDGE MIDDLEWARE",
    integration_mode: "GATEWAY_HTTP",
    latency: "1.16 ms",
    codeTab: "nodejs",
    verified: "300+ Edge Nodes",
    gradient: "linear-gradient(135deg, #0e7490 0%, #0f172a 100%)",
    badgeColor: "#06B6D4",
    icon: "🌐",
    compliance_mapping: {
      iso_27001: ["A.8.20 - Seguridad en redes", "A.8.26 - Requisitos de seguridad en aplicaciones"],
      dora: ["Art. 9 - Protección y prevención perimetral TIC"]
    },
    rules: {
      edge_inspection: true,
      inject_crypto_seal: true,
      rate_limiting_ddos: true
    },
    testVector: {
      model: "cloudflare-workers-ai",
      messages: [{ role: "user", content: "Validación de cabeceras perimetrales X-SAARE-Client-ID y mitigación L7" }]
    }
  },
  {
    id: "scn-kit-consulting",
    category: "Kit Consulting & PYME",
    title: "Red.es: Diagnóstico Kit Consulting & Handshake",
    description: "Supervisión delegada de sesiones de asesoramiento digital con consentimiento volátil en RAM para justificación ante Red.es.",
    version: "2.0.0",
    tag: "KIT DIGITAL / PYME",
    integration_mode: "SAAS_CONSOLE",
    latency: "1.16 ms",
    codeTab: "nodejs",
    verified: "Justificación Red.es",
    gradient: "linear-gradient(135deg, #be123c 0%, #0f172a 100%)",
    badgeColor: "#F43F5E",
    icon: "💼",
    compliance_mapping: {
      red_es: ["Bases Reguladoras Programa Asesores Digitales / Kit Consulting", "Requisitos de Evidencia de Sesión"]
    },
    rules: {
      pyme_advisory_audit: true,
      consent_ram_only: true,
      zero_disk: true
    },
    testVector: {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Generación de informe de asesoramiento en IA para PYME beneficiaria NIF B12345678" }]
    }
  },
  {
    id: "scn-legal-grounding",
    category: "LegalTech & Contratos",
    title: "LegalTech: Grounding Estricto en Contratos",
    description: "Revisión documental contractual con rechazo automático (No-Unsupported-Claims) ante alucinaciones que no consten en el corpus litigioso.",
    version: "2.0.0",
    tag: "CONTRATOS & DERECHO",
    integration_mode: "GATEWAY_HTTP",
    latency: "1.16 ms",
    codeTab: "python",
    verified: "Zero Hallucination",
    gradient: "linear-gradient(135deg, #4338ca 0%, #0f172a 100%)",
    badgeColor: "#6366F1",
    icon: "📜",
    compliance_mapping: {
      iso_42001: ["Control B.6.3 - Mitigación de sesgos y alucinaciones en modelos de IA"],
      eu_ai_act: ["Art. 10 - Gobernanza del conjunto de datos"]
    },
    rules: {
      strict_corpus_grounding: true,
      reject_unsupported_clauses: true
    },
    testVector: {
      model: "claude-3-5-sonnet",
      messages: [{ role: "user", content: "Analizar cláusula de rescisión unilateral y verificar si existe penalización en el texto base" }]
    }
  },
  {
    id: "scn-insurtech-claims",
    category: "Insurtech & Seguros",
    title: "Insurtech: Detección de Fraude en Siniestros",
    description: "Cadena causal inmutable y cotejo pericial de partes de accidentes, informes médicos y fotografías periciales de siniestros.",
    version: "2.0.0",
    tag: "PERITAJE SEGUROS",
    integration_mode: "PRIVATE_CONTAINER",
    latency: "1.16 ms",
    codeTab: "python",
    verified: "Cadena Custodia",
    gradient: "linear-gradient(135deg, #0f766e 0%, #0f172a 100%)",
    badgeColor: "#14B8A6",
    icon: "🚗",
    compliance_mapping: {
      ley_contrato_seguro: ["Ley 50/1980 de Contrato de Seguro - Deber de declaración del riesgo y prueba pericial"],
      iso_27001: ["A.8.10 - Supresión segura de datos periciales"]
    },
    rules: {
      claims_causal_chain: true,
      fraud_signature_verification: true
    },
    testVector: {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Validar coherencia de daños en vehículo matrícula 1234-XYZ frente al atestado pericial" }]
    }
  }
];

/**
 * Busca un escenario por ID admitiendo indiferentemente guiones o guiones bajos
 * @param {string} id - Identificador del escenario
 * @returns {object} Escenario coincidente o el primero por defecto
 */
export function getScenarioById(id) {
  if (!id || typeof id !== 'string') return ScenarioRegistry[0];

  const normalizedQuery = id.trim().toLowerCase().replace(/[-_]/g, '');

  const match = ScenarioRegistry.find(s => {
    const normalizedTarget = s.id.toLowerCase().replace(/[-_]/g, '');
    return normalizedTarget === normalizedQuery;
  });

  return match || ScenarioRegistry[0];
}