import React, { useState, useEffect } from 'react';
import cabeceraImg from './public/CABECERA WEB.jfif';

const DEFAULT_BASE_SCENARIOS = [
  { id: 'saare-espana-lopd', title: 'España - LOPDGDD & AEPD', desc: 'Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII.', licensed: true, badge: 'PRIVACIDAD ES' },
  { id: 'saare-l7-jailbreak', title: 'TOP L7: Jailbreak & Prompt Injection Guard', desc: 'Mitigación de ataques adversarios, modo DAN y anulación de directivas.', licensed: true, badge: 'CIBERSEGURIDAD' },
  { id: 'saare-forensic-factcheck', title: 'Fact-Checking Forense & Fake Disprover', desc: 'Trazabilidad y sellado criptográfico SHA-256 de consistencia documental e ISO 42001.', licensed: true, badge: 'TRAZABILIDAD' },
  { id: 'saare-token-costguard', title: 'Optimizador de Tokens & CostGuard', desc: 'Reducción de consumo de tokens (20-40%) y modo bypass para auditoría.', licensed: true, badge: 'FINOPS IT' }
];

export default function App() {
  // Función para exportar dictamen pericial forense
  const generateForensicPDF = async () =              
                Iniciar Sesión y Desbloquear
              

              
                ¿No tienes credenciales?
                
                  Registrarse / Comprar Licencia
                
              
        </div              
                Iniciar Sesión y Desbloquear
              

              
                ¿No tienes credenciales?
                
                  Registrarse / Comprar Licencia
                
              
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADVERTENCIA DESACTIVAR BASE */}
      {scenarioToDisable && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', maxWidth: '480px', width: '90%', border: '2px solid #dc2626' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 900, color: '#991b1b', textTransform: 'uppercase' }}>
              ADVERTENCIA DE SEGURIDAD CISO
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 14px 0', fontWeight: 600 }}>
              Está a punto de desactivar la directiva de cumplimiento para:
              <br />
              <strong style={{ color: '#0f172a', display: 'block', marginTop: '6px' }}>
                "{scenarioToDisable.title}"
              </strong>
            </p>
            <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '8px 12px', fontSize: '0.78rem', color: '#991b1b', marginBottom: '18px', fontWeight: 600 }}>
              Al suspender esta regla, los prompts dejarán de ser bloqueados preventivamente en el origen.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setScenarioToDisable(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDisable}
                style={{ padding: '8px 16px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                Confirmar y Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JSON */}
      {selectedEv && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '90%', border: '1px solid #475569' }}>
            <h4 style={{ margin: '0 0 12px 0', textTransform: 'uppercase' }}>Recibo Pericial: {selectedEv.evidenceId}</h4>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: monoFont, maxHeight: '350px', overflow: 'auto' }}>
              {JSON.stringify(selectedEv, null, 2)}
            </pre>
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <button onClick={() => setSelectedEv(null)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


