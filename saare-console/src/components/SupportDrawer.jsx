import React, { useState } from 'react';

export default function SupportDrawer({ session, daysRemaining }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setTicketSubject('');
      setTicketMsg('');
      setIsOpen(false);
    }, 2500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '12px 8px 12px 14px',
          borderTopLeftRadius: '10px',
          borderBottomLeftRadius: '10px',
          border: '1px solid #38bdf8',
          borderRight: 'none',
          boxShadow: '-4px 0 20px rgba(2, 132, 199, 0.4)',
          cursor: 'pointer',
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontWeight: 'bold',
          fontSize: '11px',
          letterSpacing: '1px'
        }}
      >
        <span>🛠️ POSVENTA & AYUDA GRC</span>
      </button>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', zIndex: 9998 }} />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-420px',
        width: '380px',
        height: '100vh',
        background: '#0f172a',
        borderLeft: '1px solid #1e293b',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
        zIndex: 9999,
        transition: 'right 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#38bdf8', fontWeight: '800' }}>CENTRO DE ATENCIÓN POSVENTA</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Gabinete Jurídico & Técnico MS3V</p>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>SOPORTE DE LICENCIA:</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#34d399' }}>🟢 ACCESO COMPLETO HABILITADO</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>Nodo: 2607076315021 (MS3V Core)</div>
          </div>

          <h4 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>GUÍA RÁPIDA DE PESTAÑAS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '11.5px' }}>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>1. Sandbox L7:</strong>
              <p style={{ margin: '3px 0 0 0', color: '#cbd5e1' }}>Pruebas deterministas en RAM volátil sin tocar disco (latencia 1.16 ms).</p>
            </div>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>2. Servicios MOD 01-03:</strong>
              <p style={{ margin: '3px 0 0 0', color: '#cbd5e1' }}>Filtrado PII, bóveda RFC 3161 y reportes automáticos ISO 42001.</p>
            </div>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>3. Bonos Públicos:</strong>
              <p style={{ margin: '3px 0 0 0', color: '#cbd5e1' }}>Financiación 100% de la implantación con Kit Consulting y NextGen.</p>
            </div>
          </div>

          <h4 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>CONTACTO CON EL GABINETE</h4>
          {ticketSent ? (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '12px', textAlign: 'center' }}>
              ✔ Petición registrada bajo SLA Nivel 1. Responderemos en menos de 2 horas.
            </div>
          ) : (
            <form onSubmit={handleSend}>
              <input type="text" required placeholder="Asunto de la consulta..." value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
              <textarea required rows={3} placeholder="Describa su duda técnica o jurídica..." value={ticketMsg} onChange={(e) => setTicketMsg(e.target.value)} style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                ✉️ ENVIAR TICKET AL GABINETE MS3V
              </button>
            </form>
          )}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #1e293b', background: '#020617', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Gabinete MS3V Legal</span>
          <button onClick={() => window.open('https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY', '_blank')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
            Activar Plan PRO ⭐
          </button>
        </div>
      </div>
    </>
  );
}
