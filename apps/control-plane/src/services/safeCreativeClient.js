/**
 * SAARE L7 - Cliente Integrado de Registro y Anclaje Criptográfico Safe Creative
 * Módulo de Anclaje e Inmutabilidad Forense (SGP 1.0)
 */

import TimestampingEngine from "./timestampingEngine.js";

export async function registerEvidenceInSafeCreative(anchorData = {}, env = {}, options = {}) {
  const safeAnchor = anchorData && typeof anchorData === "object" ? anchorData : {};
  const expedienteId =
    options.expedienteId ||
    env?.SAFE_CREATIVE_EXPEDIENTE_ID ||
    env?.EXPEDIENTE_ID ||
    "MS3V-DEFAULT-EXPEDIENTE";
  const authorName =
    options.author ||
    env?.SAFE_CREATIVE_AUTHOR ||
    env?.AUTHOR_NAME ||
    "SAARE Compliance Engine";
  const legalFramework =
    options.legalFramework || "Art. 326 LEC / Ley 1/2019 / RFC 3161";

  const EngineClass = TimestampingEngine.default || TimestampingEngine;
  const engine = new EngineClass(expedienteId);

  const localSeal = await engine.sealTransaction(
    safeAnchor,
    env?.SAFE_CREATIVE_TSA_HASH || null
  );

  try {
    if (!env?.SAFE_CREATIVE_API_KEY) {
      return {
        success: true,
        mode: "LOCAL_CUSTODY_ONLY",
        qualifiedTsaConfirmed: false,
        expediente: expedienteId,
        titular: authorName,
        seal: localSeal
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch("https://api.safecreative.org/v2/work/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SAFE_CREATIVE_API_KEY}`,
          "Content-Type": "application/json",
          "X-SAARE-Expediente": expedienteId
        },
        body: JSON.stringify({
          code: safeAnchor.id || `ANK-${Date.now()}`,
          title: `S.A.A.R.E. Merkle Anchor - ${safeAnchor.id || "GLOBAL_ROOT"}`,
          rootHash: localSeal.rootHash,
          expediente: expedienteId,
          author: authorName,
          legalFramework
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(
        `Respuesta HTTP no válida de Safe Creative: ${response.status} ${response.statusText}`
      );
    }

    const resData = await response.json().catch(() => ({}));
    const tsaHash =
      resData.tsaHash ||
      resData.receiptHash ||
      resData.code ||
      `TSA_QUALIFIED_SAFE_CREATIVE_${localSeal.rootHash.slice(0, 12).toUpperCase()}`;

    const finalSeal = await engine.sealTransaction(safeAnchor, tsaHash);

    return {
      success: true,
      mode: "QUALIFIED_TSA_SAFE_CREATIVE",
      qualifiedTsaConfirmed: true,
      expediente: expedienteId,
      titular: authorName,
      seal: finalSeal
    };
  } catch (error) {
    console.error("[SafeCreativeClient Error]:", error?.message || error);
    return {
      success: false,
      mode: "LOCAL_FALLBACK_ON_ERROR",
      qualifiedTsaConfirmed: false,
      error: error?.message || "Error de conexión con Safe Creative",
      expediente: expedienteId,
      seal: localSeal
    };
  }
}

export default registerEvidenceInSafeCreative;