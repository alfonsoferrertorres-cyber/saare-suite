document.addEventListener('DOMContentLoaded', () => {

  // 1. Manejo global de clics para capturar botones, enlaces y tarjetas de arquitectura
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a, .btn, .card');
    if (!btn) return;

    const text = (btn.innerText || btn.textContent || '').trim().toUpperCase();
    const href = (btn.getAttribute('href') || '').toLowerCase();

    // Detección de intención para abrir el modal de Discovery o Architecture
    const isDiscovery = 
      text.includes('REQUEST DISCOVERY') || 
      text.includes('START DISCOVERY') || 
      btn.id === 'btn-open-discovery' ||
      href.includes('discovery');

    const isArchitecture = 
      text.includes('REQUEST ARCHITECTURE') || 
      text.includes('ARCHITECTURE SPECIFICATION') || 
      href.includes('architecture');

    if (isDiscovery || isArchitecture) {
      e.preventDefault();
      e.stopPropagation();

      // Verificar si existe un modal en el DOM
      const htmlModal = document.querySelector('.modal-overlay') || document.querySelector('#arch-modal') || document.querySelector('#discovery-modal');

      if (htmlModal) {
        htmlModal.style.display = 'flex';
        htmlModal.style.visibility = 'visible';
        htmlModal.style.opacity = '1';
      } else {
        openInjectedDiscoveryModal();
      }
      return;
    }

    // Cierre de modales al pulsar en 'X' o backdrop
    if (
      e.target.classList.contains('modal-close') || 
      e.target.classList.contains('modal-overlay') || 
      e.target.innerText === '×' || 
      e.target.innerText === '✕'
    ) {
      const activeModal = e.target.closest('.modal-overlay') || document.getElementById('discovery-modal') || document.getElementById('arch-modal');
      if (activeModal) {
        activeModal.style.display = 'none';
        activeModal.style.opacity = '0';
        activeModal.style.visibility = 'hidden';
      }
    }
  }, true);

  // 2. Inyector dinámico de Modal para Discovery en caso de no existir en el DOM
  function openInjectedDiscoveryModal() {
    let modal = document.getElementById('discovery-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'discovery-modal';
      modal.className = 'modal-overlay';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(2,6,23,0.92); backdrop-filter:blur(12px); z-index:99999; display:flex; justify-content:center; align-items:center; opacity:1; visibility:visible;';
      
      modal.innerHTML = `
        <div class="modal-card" style="background:#090d16; border:1px solid rgba(6,182,212,0.3); border-radius:12px; width:90%; max-width:560px; padding:2rem; position:relative; color:#fff; font-family:sans-serif; box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
          <span class="modal-close" style="position:absolute; top:1rem; right:1.2rem; color:#94a3b8; cursor:pointer; font-size:1.5rem; font-weight:bold;">&times;</span>
          <span style="font-size:0.68rem; color:#06b6d4; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase; display:block; margin-bottom:0.2rem;">
            EVALUATION METHODOLOGY • DISCOVERY ACCESS
          </span>
          <h2 style="font-size:1.5rem; color:#fff; margin:0 0 1.2rem; font-weight:700;">Request Discovery Assessment</h2>
          
          <form id="discovery-access-form">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label style="display:block; font-size:0.72rem; color:#94a3b8; text-transform:uppercase; margin-bottom:0.3rem;">Full Name *</label>
                <input type="text" name="name" required placeholder="Carlos Mendoza" style="width:100%; padding:0.75rem; background:#030712; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff; font-size:0.85rem;">
              </div>
              <div>
                <label style="display:block; font-size:0.72rem; color:#94a3b8; text-transform:uppercase; margin-bottom:0.3rem;">Organization *</label>
                <input type="text" name="company" required placeholder="SAARE Tech Inc" style="width:100%; padding:0.75rem; background:#030712; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff; font-size:0.85rem;">
              </div>
            </div>
            <div style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.72rem; color:#94a3b8; text-transform:uppercase; margin-bottom:0.3rem;">Corporate Email *</label>
              <input type="email" name="email" required placeholder="carlos@company.com" style="width:100%; padding:0.75rem; background:#030712; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff; font-size:0.85rem;">
            </div>
            <div style="margin-bottom:1.2rem;">
              <label style="display:block; font-size:0.72rem; color:#94a3b8; text-transform:uppercase; margin-bottom:0.3rem;">Deployment Target</label>
              <select name="deploymentModel" style="width:100%; padding:0.75rem; background:#030712; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff; font-size:0.85rem;">
                <option value="AWS Cloud">AWS Cloud</option>
                <option value="Azure / GCP">Azure / GCP</option>
                <option value="Air-Gapped On-Premise">Air-Gapped On-Premise</option>
              </select>
            </div>
            <button type="submit" style="width:100%; padding:0.85rem; background:#06b6d4; color:#020617; font-weight:bold; font-size:0.85rem; border:none; border-radius:6px; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">
              SUBMIT DISCOVERY REQUEST
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      attachFormSubmitHandler(modal.querySelector('form'));
    }
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
  }

  // 3. Procesar envíos hacia http://localhost:8080 y desplegar la vista del Perfil
  function attachFormSubmitHandler(form) {
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'PROCESSING DISCOVERY REQUEST...';
      }

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.company = payload.company || payload.organization || 'Enterprise Lead';
      payload.deploymentModel = payload.deploymentModel || payload.environment || payload.deploymentTarget || 'AWS Cloud';

      try {
        const response = await fetch('http://localhost:8080', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Servidor no disponible');
        const result = await response.json();

        const modalCard = form.closest('.modal-card') || form.parentElement;

        if (modalCard && result.profile) {
          modalCard.innerHTML = `
            <div style="padding: 0.5rem; color: #f8fafc; font-family: inherit; text-align: left;">
              <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; margin-bottom: 1.2rem;">
                <span style="font-size: 0.7rem; letter-spacing: 1.5px; color: #06b6d4; font-weight: bold; text-transform: uppercase;">
                  SAARE Platform • Assessment Complete
                </span>
                <h2 style="font-size: 1.5rem; color: #ffffff; margin-top: 0.3rem; font-weight: 700;">
                  YOUR AI GOVERNANCE PROFILE
                </h2>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem; background: rgba(3, 7, 18, 0.6); padding: 0.8rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                <div>
                  <span style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; display: block;">Environment</span>
                  <strong style="color: #38bdf8; font-size: 0.88rem;">${result.profile.environmentType}</strong>
                </div>
                <div>
                  <span style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; display: block;">Governance Maturity</span>
                  <strong style="color: #fbbf24; font-size: 0.88rem;">${result.profile.governanceMaturity}</strong>
                </div>
              </div>

              <div style="margin-bottom: 1.2rem;">
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 0.4rem;">
                  Primary Exposure Areas
                </span>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${result.profile.exposureAreas.map(area => `
                    <li style="padding: 5px 8px; background: rgba(15, 23, 42, 0.8); border-left: 3px solid #06b6d4; margin-bottom: 4px; font-size: 0.8rem; color: #cbd5e1;">
                      ${area}
                    </li>
                  `).join('')}
                </ul>
              </div>

              <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.8rem; border-radius: 6px; margin-bottom: 1.2rem;">
                <span style="font-size: 0.75rem; color: #34d399; font-weight: bold; display: block; margin-bottom: 0.2rem;">
                  RECOMMENDED NEXT STEP
                </span>
                <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">
                  Start a 30-day SAARE Discovery Program to validate your AI governance posture in your own environment.
                </p>
              </div>

              <button id="btn-activate-discovery" style="width: 100%; padding: 0.85rem; background: #06b6d4; color: #020617; font-weight: bold; font-size: 0.85rem; border: none; border-radius: 4px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
                START DISCOVERY PROGRAM (30 DAYS)
              </button>
            </div>
          `;

          // Descarga de saare.lic y paquete SDK
          document.getElementById('btn-activate-discovery').addEventListener('click', () => {
            const licBlob = new Blob([JSON.stringify({ token: result.discoveryToken }, null, 2)], { type: 'application/json' });
            const linkLic = document.createElement('a');
            linkLic.href = window.URL.createObjectURL(licBlob);
            linkLic.download = 'saare.lic';
            linkLic.click();

            setTimeout(() => {
              const linkZip = document.createElement('a');
              linkZip.href = '/downloads/saare-sdk-v4.2.zip';
              linkZip.download = 'saare-sdk-v4.2.zip';
              linkZip.click();
            }, 400);
          });
        }
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'SUBMIT DISCOVERY REQUEST';
        }
        alert('Error: Asegúrate de que el backend en el puerto 8080 está encendido.');
      }
    });
  }

  // Vincular formularios estáticos presentes en el HTML
  document.querySelectorAll('form').forEach(attachFormSubmitHandler);
});
