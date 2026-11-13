window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.type !== 'SAARE_L7_INTERCEPT') return;

  chrome.runtime.sendMessage(
    {
      action: 'EVALUATE_EX_ANTE',
      prompt: event.data.prompt,
      origin: event.data.origin
    },
    (response) => {
      window.postMessage({
        type: 'SAARE_L7_VERDICT',
        requestId: event.data.requestId,
        payload: response || { decision: 'ALLOW' }
      }, '*');
    }
  );
});