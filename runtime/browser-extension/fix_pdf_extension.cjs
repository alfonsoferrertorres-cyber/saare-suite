const fs = require('fs');
const path = require('path');

const contentJs = `// S.A.A.R.E. INTERCEPTOR UNIVERSAL (TEXTO + ARCHIVOS ADJUNTOS / PDF)
console.log('[S.A.A.R.E.] Extensión L7 Interceptor activa para texto y adjuntos en Gemini.');

let lastCapturedText = '';

// Capturar cualquier texto en los inputs editable de Gemini
document.addEventListener('input', (e) => {
  const target = e.target;
  if (target && (target.isContentEditable || target.tagName === 'TEXTAREA')) {
    lastCapturedText = target.innerText || target.value || '';
  }
}, true);

function getPromptContent() {
  const activeEl = document.activeElement;
  let text = '';
  
  if (activeEl && (activeEl.isContentEditable || activeEl.tagName === 'TEXTAREA')) {
    text = activeEl.innerText || activeEl.value || '';
  }
  
  if (!text || text.trim() === '') {
    text = lastCapturedText;
  }

  // Detectar si hay un archivo o PDF adjunto en la caja de Gemini
  const pdfChip = document.querySelector('[aria-label*="PDF"], [aria-label*="Sentencia"], .attachment-chip, [data-test-id*="attachment"]');
  let pdfName = '';
  if (pdfChip) {
    pdfName = pdfChip.innerText || pdfChip.getAttribute('aria-label') || 'Documento PDF Adjunto';
  }

  if (pdfName) {
    return \`[ADJUNTO: \${pdfName.trim()}] \${text.trim() || 'Análisis de documento judicial'}\`;
  }

  return text.trim();
}

async function captureAndSend() {
  const fullContent = getPromptContent();

  if (fullContent && fullContent.length > 0) {
    console.log('[S.A.A.R.E.] Capturando prompt/adjunto para L7:', fullContent);

    try {
      const response = await fetch('http://localhost:3001/api/v1/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptInput: fullContent,
          prompt: fullContent
        })
      });

      const data = await response.json();
      console.log('[S.A.A.R.E. RUNTIME RESPUESTA]:', data);

      if (data.verdict === 'RECHAZADO') {
        const scenarioName = data.evidence?.scenarioApplied || 'Control Plane L7';
        const cryptoSeal = data.evidence?.cryptoSeal || '';
        showSaareOverlay(scenarioName, data.verdict, cryptoSeal);
      }
    } catch (err) {
      console.error('Error enviando a SAARE Control Plane:', err);
    }

    lastCapturedText = '';
  }
}

function showSaareOverlay(scenarioName, verdict, seal) {
  const existing = document.getElementById('saare-overlay-banner');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'saare-overlay-banner';
  overlay.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;background:#0f172a;color:#fff;border:2px solid #ef4444;padding:20px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:system-ui,sans-serif;max-width:400px;';
  
  overlay.innerHTML = \`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="font-size:20px;">⛔</span>
      <h3 style="margin:0;font-size:15px;color:#f87171;">BLOQUEADO POR CONTROL PLANE S.A.A.R.E.</h3>
    </div>
    <p style="margin:0 0 8px 0;font-size:13px;color:#cbd5e1;">Prompt/Adjunto interceptado por el escenario activo:</p>
    <div style="background:#1e293b;border:1px solid #334155;padding:8px 12px;border-radius:6px;font-weight:bold;font-size:12px;color:#38bdf8;margin-bottom:12px;">
      \${scenarioName}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94a3b8;font-family:monospace;">
      <span>DICTAMEN: \${verdict}</span>
      <span>SELLO: \${seal ? seal.substring(0, 14) : 'SHA256'}...</span>
    </div>
  \`;

  document.body.appendChild(overlay);
  setTimeout(() => { if (overlay) overlay.remove(); }, 5000);
}

// 1. Tecla Enter
document.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    await captureAndSend();
  }
}, true);

// 2. Clic en cualquier botón de envío o icono circular
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button, [role="button"], .send-button, [aria-label*="Enviar"], [aria-label*="Send"]');
  if (btn) {
    await captureAndSend();
  }
}, true);
`;

fs.writeFileSync(path.join(__dirname, 'content.js'), contentJs, 'utf8');
console.log('=== INTERCEPTOR DE ADJUNTOS Y PDFS ACTUALIZADO ===');
