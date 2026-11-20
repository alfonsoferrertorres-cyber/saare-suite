document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const browserProfileInput = document.getElementById("browserProfile");
  const clientProfileInput = document.getElementById("clientProfile");
  const apiKeyInput = document.getElementById("apiKey");
  const userInput = document.getElementById("user");
  const failClosedInput = document.getElementById("failClosed");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  const detoxStatusBox = document.getElementById("detoxStatusBox");
  const detoxEngineLabel = document.getElementById("detoxEngine");
  const detoxStateLabel = document.getElementById("detoxState");
  const alarmTenantLabel = document.getElementById("alarmTenant");
  const detoxBrowserProfileLabel = document.getElementById("detoxBrowserProfile");
  const detoxClientProfileLabel = document.getElementById("detoxClientProfile");
  const alarmControlsLabel = document.getElementById("alarmControls");
  const detoxRulesList = document.getElementById("detoxRules");
  const alarmBanner = document.getElementById("alarmBanner");

  function renderDetoxAndAlarm(statusObj, fallbackTenant, fallbackBrowserProfile, fallbackClientProfile) {
    if (!statusObj || !detoxStatusBox) return;

    detoxStatusBox.style.display = "block";
    if (detoxEngineLabel) {
      detoxEngineLabel.textContent = statusObj.engine || "v1.4-DETOX-RAM-ISO42001-FULL";
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

    if (detoxBrowserProfileLabel) {
      detoxBrowserProfileLabel.textContent =
        statusObj.browserProfile ||
        statusObj.profile_context?.browserProfile ||
        fallbackBrowserProfile ||
        "Chrome_Perfil_Cliente_01";
    }

    if (detoxClientProfileLabel) {
      detoxClientProfileLabel.textContent =
        statusObj.clientProfile ||
        statusObj.profile_context?.clientProfile ||
        fallbackClientProfile ||
        "Perfil_Auditoria_L7";
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
      if (saareConfig.browserProfile) browserProfileInput.value = saareConfig.browserProfile;
      if (saareConfig.clientProfile) clientProfileInput.value = saareConfig.clientProfile;
      if (saareConfig.apiKey) apiKeyInput.value = saareConfig.apiKey;
      if (saareConfig.userEmail) userInput.value = saareConfig.userEmail;
      if (saareConfig.failClosed !== undefined) failClosedInput.checked = Boolean(saareConfig.failClosed);
    }

    if (!browserProfileInput.value) {
      browserProfileInput.value = browserProfileInput.placeholder || "Chrome_Perfil_Cliente_01";
    }
    if (!clientProfileInput.value) {
      clientProfileInput.value = clientProfileInput.placeholder || "Perfil_Auditoria_L7";
    }

    renderDetoxAndAlarm(
      lastDetoxStatus,
      saareConfig?.tenantId,
      browserProfileInput.value,
      clientProfileInput.value
    );
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
    const browserProfile = (browserProfileInput.value.trim() || browserProfileInput.placeholder || "Chrome_Perfil_Cliente_01").trim();
    const clientProfile = (clientProfileInput.value.trim() || clientProfileInput.placeholder || "Perfil_Auditoria_L7").trim();
    const apiKey = apiKeyInput.value.trim();
    const userEmail = (userInput.value.trim() || userInput.placeholder || "operador_l7@saare.local").trim().toLowerCase();
    const failClosed = Boolean(failClosedInput.checked);

    const saareConfig = {
      apiUrl: cleanUrl,
      tenantId,
      browserProfile,
      clientProfile,
      apiKey,
      userEmail,
      failClosed,
      updatedAt: new Date().toISOString()
    };

    try {
      await chrome.storage.local.set({ saareConfig });

      apiUrlInput.value = cleanUrl;
      tenantInput.value = tenantId;
      browserProfileInput.value = browserProfile;
      clientProfileInput.value = clientProfile;
      userInput.value = userEmail;

      if (alarmTenantLabel && detoxStatusBox?.style.display === "block") {
        alarmTenantLabel.textContent = tenantId;
      }
      if (detoxBrowserProfileLabel && detoxStatusBox?.style.display === "block") {
        detoxBrowserProfileLabel.textContent = browserProfile;
      }
      if (detoxClientProfileLabel && detoxStatusBox?.style.display === "block") {
        detoxClientProfileLabel.textContent = clientProfile;
      }

      statusDiv.style.color = "#34d399";
      statusDiv.textContent = `✅ Nodo L7 Vinculado (${tenantId} · ${browserProfile})`;

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