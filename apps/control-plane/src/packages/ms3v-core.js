/**
 * --------------------------------------------------------------------------
 * ÍNDICE MAESTRO DE PROPIEDAD INTELECTUAL — PROTOCOLO DE AUDITORÍA & S.A.A.R.E. L7
 * Aislamiento Tecnológico: Zero-Disk RAM (mlock)
 * --------------------------------------------------------------------------
 * PROTOCOLO DE AUDITORÍA DETERMINISTA MS3V
 * MOTOR DE GOBERNANZA: BLOCK LOGIC (Middleware Determinista en Tiempo Real)
 * --------------------------------------------------------------------------
 */

export const IP_MANIFEST = {
  AUTHOR: "S.A.A.R.E. Enterprise Control Plane",
  NIF: "",
  REGISTRO_B2B: "MS3V-SGP1.0-SOFTWARE",
  REGISTRO_RPI: "",
  MANIFEST_SHA256: ""
};

async function generateSha256Hex(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function getTimestampNs() {
  const ms = BigInt(Date.now());
  const perfVal = typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : 0;
  const nsOffset = BigInt(Math.max(0, Math.floor((perfVal % 1) * 1e6)));
  return (ms * 1000000n + nsOffset).toString();
}

export async function engineBlockLogic(instruction, approvedParams = [], env = {}) {
  try {
    let rawString = "";
    if (typeof instruction === "string") {
      rawString = instruction;
    } else if (instruction && typeof instruction === "object") {
      rawString = instruction.prompt || instruction.instruction || JSON.stringify(instruction);
    }

    const trimmedRaw = rawString.trim();
    if (!trimmedRaw) {
      return {
        STATUS: "ABORT_SEQUENCE",
        REASON: "SAFETY_DISJUNCTOR_ENGAGED",
        AUTHOR: env?.AUTHOR_NAME || IP_MANIFEST.AUTHOR
      };
    }

    const upperData = trimmedRaw.toUpperCase();
    const normalizedApproved = Array.isArray(approvedParams)
      ? approvedParams.map(p => String(p).trim().toUpperCase()).filter(Boolean)
      : [];

    const isApproved = normalizedApproved.some(
      param => upperData === param || upperData.includes(param)
    );

    const executedCommand = isApproved ? upperData : "LOGIC_SAFE_STATE";
    const hashTarget = isApproved ? upperData : trimmedRaw;
    const integrityHash = await generateSha256Hex(hashTarget);
    const timestamp = getTimestampNs();

    if (integrityHash) {
      return {
        STATUS: "ALLOW",
        EXECUTE: executedCommand,
        HASH: integrityHash,
        TS: timestamp,
        AUTHOR: env?.AUTHOR_NAME || IP_MANIFEST.AUTHOR,
        TITULAR_NIF: env?.TITULAR_NIF_SECRET || env?.TITULAR_NIF || IP_MANIFEST.NIF,
        PROTOCOL: env?.PROTOCOL_VERSION || "MS3V_BLOCK_LOGIC_V12.1",
        RPI_REGISTRATION: env?.SAFE_CREATIVE_ID || IP_MANIFEST.REGISTRO_RPI,
        MANIFEST_ROOT_HASH: env?.MANIFEST_ROOT_HASH || IP_MANIFEST.MANIFEST_SHA256
      };
    }

    return {
      STATUS: "ABORT_SEQUENCE",
      REASON: "SAFETY_DISJUNCTOR_ENGAGED",
      AUTHOR: env?.AUTHOR_NAME || IP_MANIFEST.AUTHOR
    };
  } catch (error) {
    return {
      STATUS: "ABORT_SEQUENCE",
      REASON: `RUNTIME_ERROR: ${error?.message || "UNKNOWN_ERROR"}`,
      AUTHOR: env?.AUTHOR_NAME || IP_MANIFEST.AUTHOR
    };
  }
}

export default engineBlockLogic;