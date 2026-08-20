console.log("%c[SAARE L7 Engine] Interceptor Permanente Activo y Vinculado al Tenant", "color: #06b6d4; font-weight: bold; font-size: 11px;");

const ENDPOINT_API = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs";
const USER_EMAIL = "alfonsosb1@gmail.com";
const LICENSE_KEY = "SAARE-MASTER-2026-ROOT-001";

// BANDERA ANTI-COLAPSO (Evita el Event Loop Recursivo)
let isSanitizing = false;

const PII_RULES = [
  { name: 'DNI/NIE', regex: /\b(\d{8}[a-z]|[xyz]\d{7}[a-z])\b/gi, replacement: '[REDACTED_DNI]' },
  { name: 'IBAN', regex: /\b[a-z]{2}\d{2}[a-z0-9\s]{12,30}\b/gi, replacement: '[REDACTED_IBAN]' },
  { name: 'API_KEY', regex: /\b(sk-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})\b/g, replacement: '[REDACTED_KEY]' }
];

function sanitizePayload(text) {
  let modified = text;
  let detected = [];
  for (const rule of PII_RULES) {
    if (rule.regex.test(modified)) {
      detected.push(rule.name);
      modified = modified.replace(rule.regex, rule.replacement);
    }
  }
  return { isBlocked: detected.length > 0, sanitized: modified, types: detected };
}

async function emitVaultEvent(types, method, isBlocked) {
  const hashArray = Array.from(crypto.getRandomValues(new Uint8Array(32)));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const eventName = isBlocked ? `Exfiltración PII: ${types.join(', ')}` : `Prompt (${method})`;
  const actionName = isBlocked ? 'REDACTED (RAM)' : 'LOGGED';

  const logPayload = {
    evidenceId: `EV-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    event: eventName,
    verdict: isBlocked ? "RECHAZADO" : "CONFORME",
    user: USER_EMAIL,
    licenseKey: LICENSE_KEY,
    origin: window.location.hostname,
    action: actionName,
    latency: '1.16 ms',
    hash: hashHex,
    status: isBlocked ? 'RECHAZADO' : 'CONFORME'
  };

  try {
    if (chrome?.storage?.local) {
      chrome.storage.local.get({ saare_logs: [] }, (res) => {
        const current = Array.isArray(res.saare_logs) ? res.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [logPayload, ...current].slice(0, 100) });
      });
    }
  } catch (e) {}

  try {
    fetch(ENDPOINT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logPayload),
      mode: "cors"
    }).catch(() => {});
  } catch (e) {}
}

function processInput(target, rawText, method) {
  // BLOQUEO DE REENTRADA
  if (!rawText || !rawText.trim() || isSanitizing) return;
  
  const audit = sanitizePayload(rawText);

  if (audit.isBlocked) {
    console.warn(`%c[SAARE L7] Amenaza Mitigada: ${audit.types.join(', ')}`, "color: #ef4444; font-weight: bold;");
    
    // Activar bandera antes de inyectar el texto redactado
    isSanitizing = true;

    if (target.isContentEditable) {
      target.innerText = audit.sanitized;
    } else {
      target.value = audit.sanitized;
    }
    
    // Notificar a React sin desencadenar un bucle infinito
    target.dispatchEvent(new Event('input', { bubbles: true }));

    // Liberar el hilo de ejecución rápidamente
    setTimeout(() => {
      isSanitizing = false;
    }, 50);
  }

  emitVaultEvent(audit.types, method, audit.isBlocked);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const target = e.target;
    let rawText = target.value || target.innerText || target.textContent || "";
    processInput(target, rawText, "Teclado");
  }
}, true);

document.addEventListener('click', (e) => {
  const botonClicado = e.target.closest('button');
  if (botonClicado) {
    const target = document.querySelector('div[contenteditable="true"], textarea, input[type="text"]');
    if (target) {
      let rawText = target.value || target.innerText || target.textContent || "";
      processInput(target, rawText, "Ratón");
    }
  }
}, true);
