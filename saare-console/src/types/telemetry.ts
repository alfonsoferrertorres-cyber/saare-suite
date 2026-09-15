// types/telemetry.ts
export interface SaareL7Telemetry {
  timestamp: string;
  cryptoSeal: string; // Firmado con Ed25519 (ISO/IEC 27037)
  merkleRoot: string;
  dnshCompliance: {
    ramOnlyExecution: boolean;
    gpuConsumptionDropPercentage: number; // Ej: 45
    diskWriteBytes: 0;
  };
  auditStandard: {
    euAiActCompliance: boolean;
    humanSupervisionExAnte: boolean;
    friaRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  policy: {
    id: string;
    verdict: 'ALLOW' | 'BLOCK' | 'REDACT';
    piiFiltered: boolean;
    promptInjectionBlocked: boolean;
  };
}