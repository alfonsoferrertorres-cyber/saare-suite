/* S.A.A.R.E. L7 Compliance Gateway - Always-On Interceptor Engine v2.6.0 */
console.log("[SAARE L7 Engine] Interceptor Permanente Activo en Memoria RAM");

// Configuración por defecto vinculada al Tenant
function getActiveSession(callback) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["saare_user", "saare_license"], (res) => {
      callback({
        userEmail: res.saare_user || "pmaiquess@gmail.com",
        licenseKey: res.saare_license || "SAARE-PRO-2026-1167-TEST"
      });
    });
  } else {
    callback({
      userEmail: "pmaiquess@gmail.com",
      licenseKey: "SAARE-PRO-2026-1167-TEST"
    });
  }
}

// 1. Detección DLP en Tiempo Real
function evaluateDLP(text) {
  if (!text || typeof text !== "string" || text.trim() === "") return { isViolation: false };
  const raw = text.trim();

  // DNI / NIE (LOPDGDD & AEPD)
  const dniRegex = /\b(\d{8}[A-HJ-NP-TV-Z]|[XYZ]\d{7}[A-HJ-NP-TV-Z])\b/i;
  if (dniRegex.test(raw)) {
    return {
      isViolation: true,
      category: "PII_DOCUMENTO",
      norma: "España - LOPDGDD & AEPD",
      reason: "Detección de DNI/NIE en texto de entrada"
    };
  }

  // IBAN (RGPD)
  const ibanRegex = /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{22}\b/i;
  if (ibanRegex.test(raw)) {
    return {
      isViolation: true,
      category: "DATOS_BANCARIOS",
      norma: "RGPD Arts. 5, 25, 32 / LOPDGDD",
      reason: "Detección de Cuenta Bancaria / IBAN"
    };
  }

  // Tarjetas de Crédito (PCI-DSS)
  const ccRegex = /\b(?:\d{4}[\s-]?){3}\d{4}\b/;
  if (ccRegex.test(raw)) {
    return {
      isViolation: true,
      category: "TARJETA_CREDITO",
      norma: "PCI-DSS / RGPD Art. 32",
      reason: "Detección de Tarjeta Financiera"
    };
  }

  return { isViolation: false };
}

// 2. Modal con Botón Interactivo de Cierre
function showBlockedNotification(evidenceId, norma, reason) {
  const existing = document.getElementById("saare-l7-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "saare-l7-toast";
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999999;
    max-width: 420px;
    background: #090d16;
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 12px;
    padding: 16px 18px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.85), 0 0 15px rgba(239,68,68,0.25);
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.4;
  `;

  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #f87171;">
        <span style="font-size: 16px;">🛡️</span> S.A.A.R.E. RUNTIME INTERCEPTOR (L7)
      </div>
      <button id="saare-close-x" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; line-height: 1;" title="Cerrar">&times;</button>
    </div>
    <div style="margin-bottom: 4px; color: #cbd5e1;">
      <strong style="color: #ef4444;">BLOQUEADO:</strong> ${reason}
    </div>
    <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">
      <strong>Normativa:</strong> ${norma} | <strong>Evidencia:</strong> <span style="color: #38bdf8;">${evidenceId}</span>
    </div>
    <div style="display: flex; justify-content: flex-end;">
      <button id="saare-dismiss-btn" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">Cerrar Aviso</button>
    </div>
  `;

  document.body.appendChild(toast);

  const closeToast = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.2s ease-out";
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 200);
  };

  const btnX = document.getElementById("saare-close-x");
  const btnDismiss = document.getElementById("saare-dismiss-btn");

  if (btnX) btnX.addEventListener("click", closeToast);
  if (btnDismiss) btnDismiss.addEventListener("click", closeToast);
  
  setTimeout(closeToast, 15000);
}

// 3. Intercepción Permanente (Always-On)
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  getActiveSession((session) => {
    const target = e.target;
    const promptText = target.value || target.innerText || target.textContent || "";
    const vResult = evaluateDLP(promptText);

    if (vResult.isViolation) {
      e.preventDefault();
      e.stopPropagation();

      const evidenceId = "EV-" + Math.floor(100000 + Math.random() * 900000);
      showBlockedNotification(evidenceId, vResult.norma, vResult.reason);

      fetch("https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidenceId: evidenceId,
          promptInput: promptText.slice(0, 100) + "...",
          user: session.userEmail,
          licenseKey: session.licenseKey,
          timestamp: new Date().toISOString(),
          verdict: "RECHAZADO",
          violationDetails: vResult
        })
      }).catch(() => {});
    }
  });
}, true);
