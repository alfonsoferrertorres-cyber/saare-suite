const HSM_CONFIG = {
  provider: "MOCK_HSM_KMS",
  keySpec: "ED25519",
  fipsLevel: "FIPS 140-3 Level 3",
  hsmSlotId: "SLOT-SAARE-L7-01"
};

export async function signEvidenceReceipt(payload) {
  const timestamp = new Date().toISOString();
  const evidenceId = 'EV-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8) + '-' + Math.floor(1000 + Math.random() * 9000);
  const mockSignature = 'HSM_' + HSM_CONFIG.provider + '_SIG_' + Math.random().toString(36).substring(2, 15).toUpperCase() + '_ED25519';

  return {
    "@context": "https://schema.saare.ai/v4/evidence.jsonld",
    "type": "GovernanceDecisionReceipt",
    "evidenceId": evidenceId,
    "timestamp": timestamp,
    "scenario": payload.scenarioId || "GLOBAL_L7_INSPECTOR",
    "userAnonymized": payload.userAnonymized || "USER-ANON-HSM",
    "decision": payload.decision || "PERMITIDO",
    "reason": payload.reason || "Auditoría en Nodo MS3V L7 - Sin Infracción",
    "cryptoLineage": {
      "hsmProvider": HSM_CONFIG.provider,
      "fipsCertification": HSM_CONFIG.fipsLevel,
      "keySlot": HSM_CONFIG.hsmSlotId,
      "sha256DataHash": 'sha256-' + Math.random().toString(36).substring(2, 34),
      "remoteSignature": mockSignature
    },
    "verificationUrl": "https://node.saare.ai/verify?id=" + evidenceId
  };
}