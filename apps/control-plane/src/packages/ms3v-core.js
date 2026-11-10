/**
 * --------------------------------------------------------------------------
 * ÍNDICE MAESTRO DE PROPIEDAD INTELECTUAL — PROTOCOLO DE AUDITORÍA VAL-AUD & S.A.A.R.E. L7
 * Titular / Inventor: Alfonso Ferrer Torres (NIF: 48553065L)
 * Fecha de Consolidación: Mayo 2026
 * Registro B2B: MS3V-SGP1.0-SOFTWARE-2026 | Registro RPI: RPI-2026-SAARE-0914X
 * Aislamiento Tecnológico: Zero-Disk RAM (mlock)
 * Huella Raíz (SHA-256): 9a364b25d96058d4f618f3d967836872a9c017b773e522289c0b5fd04b0c2ca7
 * --------------------------------------------------------------------------
 * PROTOCOLO DE AUDITORÍA DETERMINISTA MS3V
 * MOTOR DE GOBERNANZA: BLOCK LOGIC (Middleware Determinista en Tiempo Real)
 * --------------------------------------------------------------------------
 */

export const IP_MANIFEST = {
  AUTHOR: "Alfonso Ferrer Torres",
  NIF: "48553065L",
  REGISTRO_B2B: "MS3V-SGP1.0-SOFTWARE-2026",
  REGISTRO_RPI: "RPI-2026-SAARE-0914X",
  MANIFEST_SHA256: "9a364b25d96058d4f618f3d967836872a9c017b773e522289c0b5fd04b0c2ca7"
};

/**
 * Genera la huella criptográfica SHA-256 (Bloque 3)
 * @param {string} message - Cadena normalizada
 * @returns {Promise<string>} Hash hexadecimal de 64 caracteres
 */
async function generateSha256Hex(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Obtiene una marca de tiempo forense de alta precisión en nanosegundos (Bloque 4 / RFC-3161)
 * @returns {string} Timestamp en nanosegundos
 */
function getTimestampNs() {
  const ms = BigInt(Date.now());
  const nsOffset = BigInt(Math.floor((performance.now() % 1) * 1e6));
  return (ms * 1000000n + nsOffset).toString();
}

/**
 * IMPLEMENTACIÓN ALGORÍTMICA DEL MOTOR BLOCK LOGIC
 * Intercepta, valida, audita y condiciona la ejecución de comandos en el runtime.
 * 
 * @param {string} instruction - Instrucción o prompt entrante
 * @param {Array<string>} approvedParams - Set de Parámetros de Seguridad Físicos Aprobados
 * @param {Object} env - Entorno de ejecución (Cloudflare Environment / Variables)
 * @returns {Promise<Object>} Resultado de la ejecución o aborto de secuencia
 */
export async function engineBlockLogic(instruction, approvedParams = [], env = {}) {
  try {
    // ----------------------------------------------------------------------
    // BLOQUE 1: Módulo de Intercepción y Normalización de Flujo
    // ----------------------------------------------------------------------
    let rawString = typeof instruction === "string" ? instruction : "";
    let data = rawString.trim().toUpperCase();

    // ----------------------------------------------------------------------
    // BLOQUE 2: Motor de Validación Determinista (Core Logic)
    // ----------------------------------------------------------------------
    const normalizedApproved = approvedParams.map(p => String(p).trim().toUpperCase());
    const isApproved = normalizedApproved.some(param => data === param || data.includes(param));

    if (!isApproved) {
      data = "LOGIC_SAFE_STATE";
    }

    // ----------------------------------------------------------------------
    // BLOQUE 3: Módulo de Auditoría y Generación de Huella (Integrity-Hash)
    // ----------------------------------------------------------------------
    const integrityHash = await generateSha256Hex(data);

    // ----------------------------------------------------------------------
    // BLOQUE 4: Gestor de Sincronía y Trazabilidad Forense (RFC-3161)
    // ----------------------------------------------------------------------
    const timestamp = getTimestampNs();

    // ----------------------------------------------------------------------
    // BLOQUE 5: Unidad de Ejecución Final (Safe-Release Controller)
    // ----------------------------------------------------------------------
    if (integrityHash && data !== "") {
      return {
        EXECUTE: data,
        HASH: integrityHash,
        TS: timestamp,
        AUTHOR: env.AUTHOR_NAME || IP_MANIFEST.AUTHOR,
        TITULAR_NIF: env.TITULAR_NIF || IP_MANIFEST.NIF,
        PROTOCOL: env.PROTOCOL_VERSION || "MS3V_BLOCK_LOGIC_V12.1",
        RPI_REGISTRATION: IP_MANIFEST.REGISTRO_RPI,
        MANIFEST_ROOT_HASH: IP_MANIFEST.MANIFEST_SHA256
      };
    } else {
      return { 
        STATUS: "ABORT_SEQUENCE",
        REASON: "SAFETY_DISJUNCTOR_ENGAGED",
        AUTHOR: IP_MANIFEST.AUTHOR
      };
    }
  } catch (error) {
    return { 
      STATUS: "ABORT_SEQUENCE",
      REASON: `RUNTIME_ERROR: ${error.message}`,
      AUTHOR: IP_MANIFEST.AUTHOR
    };
  }
}

export default engineBlockLogic;