const WORKER_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    // 1. Persistencia Local
    chrome.storage.local.get({ saare_logs: [] }, (result) => {
      const current = Array.isArray(result.saare_logs) ? result.saare_logs : [];
      chrome.storage.local.set({ saare_logs: [message.payload, ...current].slice(0, 100) });
    });

    // 2. Despacho directo a Cloudflare Worker KV
    fetch(`${WORKER_URL}/runs?user=alfonsosb1@gmail.com`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    }).then(res => sendResponse({ ok: res.ok })).catch(() => {});

    return true;
  }

  if (message?.type === "SAARE_GET_RULES") {
    fetch(`${WORKER_URL}/custom-rules`)
      .then(r => r.json())
      .then(data => sendResponse({ data }))
      .catch(() => sendResponse({ data: [] }));
    return true;
  }
});