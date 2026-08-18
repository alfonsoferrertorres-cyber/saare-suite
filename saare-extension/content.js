/* S.A.A.R.E. L7 Compliance Gateway - Always-On Interceptor Engine v2.6.5 */
console.log("[SAARE L7 Engine] Interceptor Permanente Activo en Memoria RAM");

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

// Modal interactivo con botón activo
function showBlockedNotification(evidenceId, norma, reason) {
  const existing = document.getElementById("saare-l7-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "saare-l7-toast";
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.right = "24px";
  toast.style.zIndex = "2147483647";
  toast.style.maxWidth = "440px";
  toast.style.background = "#090d16";
  toast.style.border = "1px solid rgba(239, 68, 68, 0.6)";
  toast.style.borderRadius = "12px";
  toast.style.padding = "16px 18px";
  toast.style.boxShadow = "0 10px 35px rgba(0,0,0,0.9), 0 0 15px rgba(239,68,68,0.3)";
  toast.style.color = "#e2e8f0";
  toast.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  toast.style.fontSize = "13px";
  toast.style.lineHeight = "1.4";
  toast.style.transition = "all 0.2s ease-out";

  // Cabecera del aviso
  const headerDiv = document.createElement("div");
  headerDiv.style.display = "flex";
  headerDiv.style.alignItems = "center";
  headerDiv.style.justifyContent = "space-between";
  headerDiv.style.marginBottom = "10px";

  const titleDiv = document.createElement("div");
  titleDiv.style.fontWeight = "bold";
  titleDiv.style.color = "#f87171";
  titleDiv.style.display = "flex";
  titleDiv.style.alignItems = "center";
  titleDiv.style.gap = "8px";
  titleDiv.innerHTML = "<span>🛡️</span> S.A.A.R.E. RUNTIME INTERCEPTOR (L7)";

  const closeX = document.createElement("button");
  closeX.innerHTML = "&times;";
  closeX.style.background = "transparent";
  closeX.style.border = "none";
  closeX.style.color = "#94a3b8";
  closeX.style.fontSize = "20px";
  closeX.style.cursor = "pointer";
  closeX.style.lineHeight = "1";
  closeX.title = "Cerrar";

  headerDiv.appendChild(titleDiv);
  headerDiv.appendChild(closeX);

  // Cuerpo del aviso
  const bodyDiv = document.createElement("div");
  bodyDiv.style.marginBottom = "6px";
  bodyDiv.style.color = "#f1f5f9";
  bodyDiv.innerHTML = "<strong style='color:#ef4444;'>BLOQUEADO:</strong> " + reason;

  const metaDiv = document.createElement("div");
  metaDiv.style.fontSize = "11px";
  metaDiv.style.color = "#64748b";
  metaDiv.style.marginBottom = "12px";
  metaDiv.innerHTML = "<strong>Normativa:</strong> " + norma + " | <strong>Evidencia:</strong> <span style='color:#38bdf8; font-family:monospace;'>" + evidenceId + "</span>";

  // Botón de acción de cierre
  const footerDiv = document.createElement("div");
  footerDiv.style.display = "flex";
  footerDiv.style.justifyContent = "flex-end";

  const dismissBtn = document.createElement("button");
  dismissBtn.innerText = "Cerrar Aviso";
  dismissBtn.style.background = "rgba(239, 68, 68, 0.2)";
  dismissBtn.style.border = "1px solid rgba(239, 68, 68, 0.5)";
  dismissBtn.style.color = "#fca5a5";
  dismissBtn.style.padding = "6px 16px";
  dismissBtn.style.borderRadius = "6px";
  dismissBtn.style.fontSize = "12px";
  dismissBtn.style.fontWeight = "bold";
  dismissBtn.style.cursor = "pointer";

  footerDiv.appendChild(dismissBtn);

  // Ensamblado
  toast.appendChild(headerDiv);
  toast.appendChild(bodyDiv);
  toast.appendChild(metaDiv);
  toast.appendChild(footerDiv);
  document.body.appendChild(toast);

  // Manejadores de cierre
  const removeToast = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  };

  closeX.addEventListener("click", removeToast);
  dismissBtn.addEventListener("click", removeToast);
  setTimeout(removeToast, 12000);
}

// Intercepción L7 permanente
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
