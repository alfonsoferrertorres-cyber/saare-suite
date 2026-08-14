import crypto from "crypto";
import fs from "fs";

export function verifyReceiptOffline(filePath, publicKeyPem) {
  try {
    if (!fs.existsSync(filePath)) {
      return { ok: false, error: "Archivo no encontrado" };
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const receipt = JSON.parse(rawData);

    const canonicalPayload = JSON.stringify({
      "@context": receipt["@context"],
      "type": receipt.type,
      "evidenceId": receipt.evidenceId,
      "scenario": receipt.scenario,
      "timestamp": receipt.timestamp,
      "decision": receipt.decision,
      "reason": receipt.reason || ""
    });

    // Recalcular Content Hash para comprobar integridad de campos
    const calculatedHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
    if (calculatedHash !== receipt.contentHash) {
      return { ok: false, error: "CRITICAL: Alteracion detectada en el Content Hash" };
    }

    // Verificación nativa Ed25519 sobre el payload canónico
    const isValid = crypto.verify(
      null,
      Buffer.from(canonicalPayload, "utf-8"),
      publicKeyPem,
      Buffer.from(receipt.signature, "base64")
    );

    if (!isValid) {
      return { ok: false, error: "CRITICAL: Firma Ed25519 INVALIDA (El recibo fue alterado o forjado)" };
    }

    return { ok: true, status: "VERIFIED_OFFLINE_INTEGRITY_OK" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
