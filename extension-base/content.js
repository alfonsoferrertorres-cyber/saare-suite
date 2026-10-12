// SAARE L7 TELEMETRY & DOM BRIDGE v8.1.0
console.log("[SAARE L7 Engine] Interceptor Activo en Memoria");

const injectScript = document.createElement("script");
injectScript.src = chrome.runtime.getURL("inject.js");
injectScript.onload = function() { this.remove(); };
(document.head || document.documentElement).appendChild(injectScript);

function getActiveAccountFromDom() {
  const profileEl = document.querySelector('a[aria-label*="@"], button[aria-label*="@"], img[alt*="@"], div[aria-label*="@"]');
  const label = profileEl ? (profileEl.getAttribute('aria-label') || profileEl.getAttribute('alt') || '') : '';
  const match = label.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase().trim() : null;
}

function showModal(text, violationInfo) {
  let old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style = "position:fixed; bottom:20px; right:20px; width:460px; background:#0f172a; color:#ffffff; padding:16px; border-radius:8px; border:2px solid #ef4444; box-shadow:0 12px 28px rgba(0,0,0,0.6); z-index:999999; font-family:system-ui,-apple-system,sans-serif;";
  
  const normTitle = violationInfo?.norma || "RGPD / EU AI Act";
  const reasonText = violationInfo?.reason || "Carga regulada detectada";

  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:900; font-size:0.85rem; color:#ef4444;">🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR (L7)</span>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px;">BLOQUEADO</span>
    </div>
    <p style="font-size:0.82rem; margin:0 0 8px 0; color:#cbd5e1; line-height:1.4;">
      <strong>Normativa:</strong> <span style="color:#f87171;">${normTitle}</span><br>
      <strong>Causa:</strong> ${reasonText}
    </p>
    <div style="background:#1e293b; border-left:3px solid #ef4444; padding:8px 10px; border-radius:4px; font-size:0.8rem; color:#93c5fd; margin-bottom:10px; word-break:break-all;">
      Carga Neutralizada: "${text.substring(0, 150)}"
    </div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => { if (banner) banner.remove(); }, 6000);
}

function sendEvidenceToBackground(auditData) {
  const text = auditData.cleanPrompt || auditData.sanitizedPrompt || "";
  if (!text || text.trim() === "") return;

  const detectedUser = getActiveAccountFromDom();

  const payload = {
    promptInput: text.trim().substring(0, 500),
    user: detectedUser || undefined,
    timestamp: new Date().toISOString(),
    verdict: auditData.verdict,
    category: auditData.category,
    norma: auditData.norma,
    cryptoSeal: auditData.cryptoSeal,
    violationDetails: {
      category: auditData.category,
      norma: auditData.norma,
      reason: auditData.reason,
      cryptoSeal: auditData.cryptoSeal
    }
  };

  if (auditData.verdict === "RECHAZADO") {
    showModal(text, auditData);
  }

  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    try {
      chrome.runtime.sendMessage({
        type: "SAARE_LOG_EVENT",
        payload: payload
      }, () => {
        if (chrome.runtime.lastError) {}
      });
    } catch {}
  }
}

window.addEventListener("message", (event) => {
  if (event.data?.type === "SAARE_EVENT" && event.data.data) {
    sendEvidenceToBackground(event.data.data);
  }
});