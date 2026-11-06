export const ScenarioRegistry = [
  {
    id: "cumplimiento_corporativo_integral",
    tag: "PRIVACIDAD ES",
    title: "ESPAÑA - LOPDGDD & AEPD",
    desc: "Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII en memoria RAM.",
    policyId: "POL-RGPD-PII-01",
    version: "4.2.1",
    effectColor: "#ef4444",
    effectText: "El DNI/IBAN se redacta o bloquea antes de que la petición salga hacia el LLM."
  },
  {
    id: "razonamiento_activo_l7",
    tag: "CIBERSEGURIDAD",
    title: "TOP L7: JAILBREAK & PROMPT INJECTION GUARD",
    desc: "Mitigación de ataques adversarios, modo DAN y anulación de directivas.",
    policyId: "POL-AI-ACT-ROBUSTNESS-15",
    version: "3.4.0",
    effectColor: "#0284c7",
    effectText: "Corta la conexión al socket L7 si el prompt intenta saltarse las restricciones del modelo."
  },
  {
    id: "deepfake_fake_disprover",
    tag: "TRAZABILIDAD",
    title: "FACT-CHECKING FORENSE & NO-UNSUPPORTED CLAIMS",
    desc: "Sellado criptográfico SHA-256 / Ed25519 y rechazo de alucinaciones sin respaldo causal.",
    policyId: "POL-HONOR-SYNTHETIC-03",
    version: "2.0.0",
    effectColor: "#ef4444",
    effectText: "Si la inferencia no coincide con el corpus pericial, emite un dictamen RECHAZADO."
  },
  {
    id: "subvenciones_requisitos_infranqueables",
    tag: "FINOPS IT",
    title: "OPTIMIZADOR DE TOKENS & COSTGUARD",
    desc: "Sanitización de espacios en blanco y compresión contextual reduciendo consumo de tokens (20-35%).",
    policyId: "POL-GRANTS-DNSH-05",
    version: "2.1.0",
    effectColor: "#0284c7",
    effectText: "Comprime el contexto en RAM ahorrando costes de API por cada consulta."
  },
  {
    id: "banca_dora_pci",
    tag: "BANCA / DORA",
    title: "BANCA & FINTECH: DORA CAPA 7 & PCI-DSS",
    desc: "Aislamiento de cuentas corrientes, tarjetas y atestación de purga RAM (SYS_madvise) con Zero-Disk Writes.",
    policyId: "POL-FIN-TREASURY-01",
    version: "4.2.1",
    effectColor: "#f59e0b",
    effectText: "Garantiza no persistencia de datos crediticios o bancarios en almacenamiento físico."
  },
  {
    id: "sanidad_historia_clinica",
    tag: "SALUD LOPD",
    title: "SANIDAD: RESGUARDO DE HISTORIAS CLÍNICAS",
    desc: "Anonimización y bloqueo de diagnósticos médicos y recetas bajo el amparo de RGPD Art. 9.",
    policyId: "POL-RGPD-HEALTH-ART9",
    version: "1.0.0",
    effectColor: "#8b5cf6",
    effectText: "Impide la transmisión de historiales clínicos sin procesar a nubes de IA públicas."
  },
  {
    id: "auditoria_dictamen_normativo",
    tag: "GSI / PERITAJE",
    title: "AUDITORÍA & DICTAMEN PERICIAL SGP 1.0",
    desc: "Cadena de custodia RFC 3161 y anclaje probatorio fiduciario de veredictos emitidos.",
    policyId: "POL-CORP-GOVERNANCE-01",
    version: "1.0.0",
    effectColor: "#10b981",
    effectText: "Genera el Proof Bundle firmado con Ed25519 e integrable en informes periciales."
  },
  {
    id: "orquestacion_workflows_guard",
    tag: "ORQUESTADORES / WORKFLOWS",
    title: "ORQUESTACIÓN & TOOL GATEWAY L7",
    desc: "Inspección de Tool Calling, Execution Permits con Single-Use JTI y anti-repetición.",
    policyId: "POL-CRM-LEAST-PRIV-03",
    version: "1.4.0",
    effectColor: "#06b6d4",
    effectText: "Emite token de autorización de un solo uso antes de permitir el dispatch del nodo."
  }
];

export function getScenarioById(id) {
  if (!id) return null;
  return ScenarioRegistry.find(s => s.id === id) || null;
}

export function getScenarioByPolicyId(policyId) {
  if (!policyId) return null;
  return ScenarioRegistry.find(s => s.policyId === policyId) || null;
}

export function getLiveRegulatoryMatrix() {
  return {
    jurisdiction: "ES_EU",
    standard: "SGP_1.0",
    governanceVersion: "10.0.4",
    activeDirectives: ScenarioRegistry.length,
    timestamp: new Date().toISOString(),
    matrix: ScenarioRegistry.map(s => ({
      id: s.id,
      policyId: s.policyId,
      version: s.version,
      tag: s.tag,
      title: s.title,
      effectText: s.effectText
    }))
  };
}