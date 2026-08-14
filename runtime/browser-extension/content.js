// S.A.A.R.E. AI Runtime Interceptor - L7 Pre-Flight Hook
const SAARE_TOKEN = "VK4WH7ZA7rnYNC9";
const SAARE_USER = "Alfonso Ferrer (Auditor SOC)";
const LOCAL_ENDPOINT = "http://localhost:3001/api/v1/runs";

function dispatchPreFlight(promptText) {
  if (!promptText || promptText.trim().length === 0) return;

  const payload = {
    promptInput: promptText.trim(),
    token: SAARE_TOKEN,
    user: SAARE_USER,
    source: "gemini_web_l7",
    timestamp: new Date().toISOString()
  };

  try {
    fetch(LOCAL_ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + SAARE_TOKEN
      },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      console.log("[S.A.A.R.E. L7 Interceptor] Dictamen:", data.verdict || "PROCESADO", data);
    })
    .catch(e => {
      console.log("[S.A.A.R.E. L7 Interceptor] Backend local offline, guardado en cache efímera");
    });
  } catch (err) {}
}

// Hook global en captura de eventos
window.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    const el = document.querySelector('rich-textarea, div[contenteditable="true"], textarea');
    if (el) {
      const text = el.innerText || el.value || "";
      dispatchPreFlight(text);
    }
  }
}, true);

// Hook en botón de envío
window.addEventListener("click", function(e) {
  const btn = e.target.closest('button[aria-label*="enviar"], button[aria-label*="Send"], .send-button');
  if (btn) {
    const el = document.querySelector('rich-textarea, div[contenteditable="true"], textarea');
    if (el) {
      const text = el.innerText || el.value || "";
      dispatchPreFlight(text);
    }
  }
}, true);
