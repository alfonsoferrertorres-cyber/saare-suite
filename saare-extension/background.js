// SAARE L7 Engine - Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("[SAARE L7] Service Worker inicializado con éxito.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "SAARE_LOG_EVENT") {
    chrome.storage.local.get({ saare_logs: [] }, (result) => {
      const currentLogs = Array.isArray(result.saare_logs) ? result.saare_logs : [];
      const updatedLogs = [message.payload, ...currentLogs].slice(0, 100);
      chrome.storage.local.set({ saare_logs: updatedLogs });
    });
    sendResponse({ status: "SAVED_TO_VAULT" });
  }
  return false;
});
