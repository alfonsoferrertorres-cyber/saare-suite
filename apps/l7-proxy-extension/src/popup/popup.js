document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const apiKeyInput = document.getElementById("apiKey");
  const userInput = document.getElementById("user");
  const failClosedInput = document.getElementById("failClosed");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  const detoxStatusBox = document.getElementById("detoxStatusBox");
  const detoxEngineLabel = document.getElementById("detoxEngine");
  const detoxStateLabel = document.getElementById("detoxState");
  const detoxRulesList = document.getElementById("detoxRules");
  const alarmTenantLabel = document.getElementById("alarmTenant");
  const alarmControlsLabel = document.getElementById("alarmControls");
  const alarmBanner = document.getElementById("alarmBanner");

  function renderDetoxAndAlarm(statusObj, fallbackTenant) {
    if (!statusObj || !detoxStatusBox) return;

    detoxStatusBox.style.display = "block";
    if (detoxEngineLabel) {
      detoxEngineLabel.textContent = statusObj.engine || "v1.3-DETOX-RAM-ISO42001-FULL";
    }

    const state = statusObj.status || "CLEAN";
    if (detoxStateLabel) {
      detoxStateLabel.textContent = state;
      detoxStateLabel.style.color =
        state === "SANITIZED" ? "#fbbf24" :
        (state.includes("ERROR") || state.includes("BLOCK") ? "#f87171" : "#34d399");
    }

    const alarm = statusObj.alarm || {};
    const rules = Array.isArray(alarm.rulesTriggered) && alarm.rulesTriggered.length > 0
      ? alarm.rulesTriggered
      : (Array.isArray(statusObj.rulesTriggered) ? statusObj.rulesTriggered : []);

    if (detoxRulesList) {
      detoxRulesList.textContent = rules.length > 0 ? rules.join(", ") : "Ninguna (Tráfico limpio)";
    }

    const activeTenant = alarm.tenant || fallbackTenant || "DEMO_ENTERPRISE";
    if (alarmTenantLabel) {
      alarmTenantLabel.textContent = activeTenant;
    }

    const controls = Array.isArray(alarm.iso42001_controls) ? alarm.iso42001_controls : [];
    if (alarmControlsLabel) {
      alarmControlsLabel.textContent = controls.length > 0 ? controls.join(", ") : "Sin controles disparados";
    }

    if (alarmBanner) {
      if (alarm.triggered) {
        const sev = alarm.severity || "HIGH";
        const isCrit = sev === "CRITICAL" || statusObj.decision === "DENY";
        alarmBanner.style.display = "block";
        alarmBanner.style.background = isCrit ? "rgba(239, 68, 68, 0.16)" : "rgba(251, 191, 36, 0.16)";
        alarmBanner.style.border = isCrit ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid rgba(251, 191, 36, 0.45)";
        alarmBanner.style.color = isCrit ? "#fca5a5" : "#fde68a";
        alarmBanner.textContent = `⚠️ Alarma ${sev} activa en ${activeTenant} (${statusObj.verdict || statusObj.decision || "ALERTA"})`;
      } else {
        alarmBanner.style.display = "none";
        alarmBanner.textContent = "";
      }
    }
  }

  try {
    const { saareConfig, lastDetoxStatus } = await chrome.storage.local.get(["saareConfig", "lastDetoxStatus"]);

    if (saareConfig) {
      if (saareConfig.apiUrl) apiUrlInput.value = saareConfig.apiUrl;
      if (saareConfig.tenantId) tenantInput.value = saareConfig.tenantId;
      if (saareConfig.apiKey) apiKeyInput.value = saareConfig.apiKey;
      if (saareConfig.userEmail) userInput.value = saareConfig.userEmail;
      if (saareConfig.failClosed !== undefined) failClosedInput.checked = Boolean(saareConfig.failClosed);
    }

    renderDetoxAndAlarm(lastDetoxStatus, saareConfig?.tenantId);
  } catch (err) {
    console.error("[S.A.A.R.E. Popup Error]:", err);
  }

  saveBtn.addEventListener("click", async () => {
    let rawUrl = apiUrlInput.value.trim() || apiUrlInput.placeholder || "https://api.saare.es/v1/chat/completions";
    let cleanUrl = rawUrl.trim().replace(/\/+$/, "");

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    const tenantId = (tenantInput.value.trim() || tenantInput.placeholder || "DEMO_ENTERPRISE").trim();
    const apiKey = apiKeyInput.value.trim();
    const userEmail = (userInput.value.trim() || userInput.placeholder || "operador_l7@saare.local").trim().toLowerCase();
    const failClosed = Boolean(failClosedInput.checked);

    const saareConfig = {
      apiUrl: cleanUrl,
      tenantId,
      apiKey,
      userEmail,
      failClosed,
      updatedAt: new Date().toISOString()
    };

    try {
      await chrome.storage.local.set({ saareConfig });

      apiUrlInput.value = cleanUrl;
      tenantInput.value = tenantId;
      userInput.value = userEmail;

      if (alarmTenantLabel && detoxStatusBox?.style.display === "block") {
        alarmTenantLabel.textContent = tenantId;
      }

      statusDiv.style.color = "#34d399";
      statusDiv.textContent = `✅ Nodo L7 Vinculado (${tenantId})`;

      setTimeout(() => {
        statusDiv.textContent = "";
      }, 3500);
    } catch (err) {
      console.error("[S.A.A.R.E. Save Error]:", err);
      statusDiv.style.color = "#f87171";
      statusDiv.textContent = "❌ Error al guardar la configuración.";
    }
  });
});