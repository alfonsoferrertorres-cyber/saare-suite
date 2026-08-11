export const ScenarioRegistry = [
  {
    id: "cumplimiento_corporativo_es",
    title: "Cumplimiento Corporativo ES (Máxima Seguridad)",
    description: "Protección integral L7 con bloqueo de PII y Prompt Injection",
    version: "2.0.0",
    compliance_mapping: {
      dora: ["Art. 9(2) - Proteccion de sistemas TIC", "Art. 10 - Deteccion de actividades anomalas"],
      pci_dss_v4: ["Req 6.4.2 - WAF L7 para aplicaciones web", "Req 10.2.1 - Registros de auditoria inmutables"],
      iso_27001: ["A.8.16 - Monitorizacion de actividades", "A.8.28 - Codificacion segura"]
    }
  },
  {
    id: "banca_dora_pci_dss",
    title: "Banca & DORA / PCI-DSS Strict",
    description: "Perfil estricto para entidades financieras bajo normativa europea",
    version: "2.0.0",
    compliance_mapping: {
      dora: ["Art. 9(4) - Aislamiento de fuentes de riesgo", "Art. 11 - Respuesta y recuperacion de incidentes"],
      pci_dss_v4: ["Req 3.4 - Proteccion de datos de tarjetahabientes (PII)", "Req 10.4.1 - Sincronizacion de tiempo y firmas"],
      iso_27001: ["A.5.15 - Control de acceso", "A.8.12 - Prevencion de fuga de datos (DLP)"]
    }
  }
];

