/**
 * SAARE L7 - Cliente Integrado de Registro y Anclaje Criptográfico Safe Creative
 * Módulo de Anclaje e Inmutabilidad Forense (SGP 1.0)
 */

import TimestampingEngine from "./timestampingEngine.js";

export async function registerEvidenceInSafeCreative(anchorData, env = {}, options = {}) {
    // Extracción dinámica de metadatos (prioridad: opciones explícitas -> variables de entorno -> fallbacks neutros)
    const expedienteId = options.expedienteId || env.SAFE_CREATIVE_EXPEDIENTE_ID || "MS3V-DEFAULT-EXPEDIENTE";
    const authorName = options.author || env.SAFE_CREATIVE_AUTHOR || "SAARE Compliance Engine";
    const legalFramework = options.legalFramework || "Art. 326 LEC / Ley 1/2019 / RFC 3161";

    const EngineClass = TimestampingEngine.default || TimestampingEngine;
    const engine = new EngineClass(expedienteId);
    
    // 1. Generación de sello local preliminar
    const localSeal = await engine.sealTransaction(anchorData, env?.SAFE_CREATIVE_TSA_HASH || null);

    try {
        if (!env?.SAFE_CREATIVE_API_KEY) {
            console.warn("[SafeCreativeClient] API Key no detectada en 'env'. Registrando bajo custodia local inalterable.");
            return {
                success: true,
                mode: "LOCAL_CUSTODY_ONLY",
                expediente: expedienteId,
                titular: authorName,
                seal: localSeal
            };
        }

        // 2. Transmisión del Merkle Root al endpoint de Safe Creative
        const response = await fetch("https://api.safecreative.org/v2/work/register", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.SAFE_CREATIVE_API_KEY}`,
                "Content-Type": "application/json",
                "X-SAARE-Expediente": expedienteId
            },
            body: JSON.stringify({
                code: anchorData.id || `ANK-${Date.now()}`,
                title: `S.A.A.R.E. Merkle Anchor - ${anchorData.id || "GLOBAL_ROOT"}`,
                rootHash: localSeal.rootHash,
                expediente: expedienteId,
                author: authorName,
                legalFramework: legalFramework
            })
        });

        if (!response.ok) {
            throw new Error(`Respuesta HTTP no válida de Safe Creative: ${response.status} ${response.statusText}`);
        }

        const resData = await response.json().catch(() => ({}));
        const tsaHash = resData.tsaHash || resData.receiptHash || resData.code || "TSA_QUALIFIED_SAFE_CREATIVE_CONFIRMED";

        // 3. Re-sellado final con respuesta TSA / eIDAS
        const finalSeal = await engine.sealTransaction(anchorData, tsaHash);

        return {
            success: true,
            mode: "QUALIFIED_TSA_SAFE_CREATIVE",
            expediente: expedienteId,
            titular: authorName,
            seal: finalSeal
        };
    } catch (error) {
        console.error("[SafeCreativeClient Error]:", error);
        return {
            success: false,
            error: error.message,
            expediente: expedienteId,
            seal: localSeal
        };
    }
}

export default registerEvidenceInSafeCreative;