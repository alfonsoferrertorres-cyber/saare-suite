const fs = require('fs');
const path = require('path');

const contentJs = `// S.A.A.R.E. INTERCEPTOR EXTENSION FOR GEMINI / LLM CHATS
console.log('[S.A.A.R.E.] Extensión L7 Interceptor cargada en Gemini.');

function interceptPromptInput() {
  const sendButtons = document.querySelectorAll('button[aria-label*="Enviar"], button.send-button, [role="button"]');
  
  document.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        const text = activeEl.value || activeEl.innerText;
        if (text && text.trim().length > 0) {
          await sendToSaareRuntime(text.trim());
        }
      }
    }
  }, true);
}

async function sendToSaareRuntime(promptText) {
  try {
    // ENRUTADO CORRECTO A LA API DE RUNS EN L7
    const response = await fetch('http://localhost:3001/api/v1/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ promptInput: promptText })
    });

    const data = await response.json();
    console.log('[S.A.A.R.E. RUNTIME RESPUESTA]:', data);

    if (data.verdict === 'RECHAZADO') {
      console.warn('⚠️ PROMPT RECHAZADO POR S.A.A.R.E. RUNTIME L7:', data.evidence?.scenarioApplied);
    }
  } catch (err) {
    console.error('Error enviando a SAARE Control Plane:', err);
  }
}

interceptPromptInput();
`;

fs.writeFileSync(path.join(__dirname, 'content.js'), contentJs, 'utf8');
console.log('=== EXTENSIÓN CORREGIDA Y APUNTANDO A /api/v1/runs ===');
