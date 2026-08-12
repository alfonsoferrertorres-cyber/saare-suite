// Traducción comercial de módulos internos a impacto corporativo

export const COMMERCIAL_SCENARIOS = [
  {
    id: 'scen-corp-governance',
    name: 'Cumplimiento Corporativo — Máxima Seguridad',
    badge: 'Recomendado Enterprise',
    description: 'Aislamiento total de datos sensibles, filtrado PII en tiempo real y prevención de exfiltración de credenciales.',
    impact: 'Protección 100% frente a fugas GDPR / HIPAA',
    underlying_modules: ['SAARE-MD-SECU', 'TokenMatrix', 'PerimeterShield'],
    governance_level: 'STRICT'
  },
  {
    id: 'scen-operational-efficiency',
    name: 'Gobernanza de Modelos & Control de Costes',
    badge: 'Optimización IA',
    description: 'Enrutamiento dinámico L7 hacia modelos eficientes, optimización de ventana de contexto y throttling por departamento.',
    impact: 'Reducción estimada del 35% en consumo de tokens API',
    underlying_modules: ['CostGuard', 'L7-Router', 'QuotaEnforcer'],
    governance_level: 'BALANCED'
  },
  {
    id: 'scen-dev-sandbox',
    name: 'Entorno Seguro para Ingenieros & Devs',
    badge: 'Developer Tier',
    description: 'Inspección de peticiones gRPC/HTTP sin alteración de velocidad, soporte para auditorías de código internas.',
    impact: 'Desarrollo ágil con trazabilidad en vivo',
    underlying_modules: ['TechnicalTrace', 'DevProxy', 'EvidenceVault'],
    governance_level: 'PERMISSIVE'
  }
];
