/* S.A.A.R.E. L7 Compliance Gateway - Always-On Interceptor Engine v2.7.0 */
console.log("[SAARE L7 Engine] Interceptor Permanente Activo y Vinculado al Tenant");

function getActiveSession(callback) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["saare_user", "saare_license", "saare_role"], (res) => {
      // Prioridad 1: Configurado por usuario en extensión
      // Prioridad 2: Credenciales de sesión local
      const activeUser = res.saare_user || (window.location.host.includes("google") ? "alfonsosb1@gmail.com" : "pmaiquess@gmail.com");
      const activeLicense = res.saare_license || (activeUser === "alfonsosb1@gmail.com" ? "SAARE-MASTER-2026-ROOT-001" : "SAARE-PRO-2026-1167-TEST");
      callback({
        userEmail: activeUser,
        licenseKey: activeLicense
      });
    });
  } else {
    callback({
      userEmail: "alfonsosb1@gmail.com",
      licenseKey: "SAARE-MASTER-2026-ROOT-001"
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

function showBlockedNotification(evidenceId, norma, reason) {
  const existing = document.getElementById("saare-l7-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "saare-l7-toast";
  toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;max-width:440px;background:#090d16;border:1px solid rgba(239,68,68,0.6);border-radius:12px;padding:16px 18px;box-shadow:0 10px 35px rgba(0,0,0,0.9), 0 0 15px rgba(239,68,68,0.3);color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:1.4;";

  const headerDiv = document.createElement("div");
  headerDiv.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;";
  headerDiv.innerHTML = "🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR (L7)";

  const closeX = document.createElement("button");
  closeX.innerHTML = "×";
  closeX.style.cssText = "background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;line-height:1;";
  closeX.title = "Cerrar";
  headerDiv.appendChild(closeX);

  const bodyDiv = document.createElement("div");
  bodyDiv.style.cssText = "margin-bottom:6px;color:#f1f5f9;";
  bodyDiv.innerHTML = "BLOQUEADO: " + reason;

  const metaDiv = document.createElement("div");
  metaDiv.style.cssText = "font-size:11px;color:#64748b;margin-bottom:12px;";
  metaDiv.innerHTML = "Normativa: " + norma + " | Evidencia: " + evidenceId + "";

  const footerDiv = document.createElement("div");
  footerDiv.style.cssText = "display:flex;justify-content:flex-end;";

  const dismissBtn = document.createElement("button");
  dismissBtn.innerText = "Cerrar Aviso";
  dismissBtn.style.cssText = "background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#fca5a5;padding:6px 16px;border-radius:6px;font-size:12px;font-weight:bold;cursor:pointer;";
  footerDiv.appendChild(dismissBtn);

  toast.appendChild(headerDiv);
  toast.appendChild(bodyDiv);
  toast.appendChild(metaDiv);
  toast.appendChild(footerDiv);
  document.body.appendChild(toast);

  const removeToast = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
  };

  closeX.addEventListener("click", removeToast);
  dismissBtn.addEventListener("click", removeToast);
  setTimeout(removeToast, 12000);
}

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
