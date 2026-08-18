import React, { useState, useEffect } from 'react';

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('registro');

  useEffect(() => {
    const saved = localStorage.getItem('saare_session');
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('saare_session');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/auth/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email.trim(), licenseKey: licenseKey.trim() })
      });

      const data = await res.json();

      if (data.valid) {
        localStorage.setItem('saare_session', JSON.stringify(data));
        setSession(data);
      } else {
        setErrorMsg(data.error || 'Credenciales no autorizadas en la Bóveda Forense.');
      }
    } catch (err) {
      setErrorMsg('Error de enlace con el Gateway perimetral.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_session');
    setSession(null);
  };

  // 1. Pantalla de Acceso Obligatorio
  if (!session) {
    return (
      
        
          
            🛡️
            S.A.A.R.E. CONSOLE
            Autenticación en Bóveda Forense L7
          

          {errorMsg && (
            
              {errorMsg}
            
          )}

          
            
              Correo Registrado
               setEmail(e.target.value)}
                placeholder="alfonsosb1@gmail.com / pmaiquess@gmail.com"
                style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            

            
              Clave de Licencia L7
               setLicenseKey(e.target.value)}
                placeholder="SAARE-MASTER-2026-ROOT-001 / SAARE-PRO-2026-1167-TEST"
                style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box' }}
              />
            

            
              {loading ? 'VALIDANDO EN BÓVEDA...' : 'ENTRAR A SAARE CONSOLE'}
            
          

          
            Nodo Canónico: 2607076315021 | Dual-Vault RFC 3161
          
        
      
    );
  }

  // 2. Cabecera y Consola Autenticada Dinámicamente
  return (
    
      
      {/* CABECERA DINÁMICA CON DATOS REALES DE SESIÓN */}
      
        
          
            
              🛡️ PANEL DE CONTROL GRC & AUDITORÍA FORENSE S.A.A.R.E.
            
            
              USUARIO: {session.user}  |  
              ROL: {session.role}  |  
              TIER: {session.tier}
            
          

          
            
              LICENCIA: {session.license}
            
            
              Cerrar Sesión
            
          
        
      

      {/* TABS Y CONTENIDO PRINCIPAL */}
      
        
           setActiveTab('registro')}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #334155', background: activeTab === 'registro' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            REGISTRO GLOBAL (EVIDENCIAS)
          
           setActiveTab('config')}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #334155', background: activeTab === 'config' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            DIRECTIVAS BASE (4 ACTIVAS)
          
        

        {activeTab === 'registro' && (
          
            EVIDENCIAS DE INTERCEPCIÓN VINCULADAS AL TENANT
            
              ✔ CUSTODIA FORENSE ACTIVA — SIN ALMACENAMIENTO EN DISCO
              ID Nodo: 2607076315021 | Huella Canónica: 128fa8c937f946a0...9a07
              Sello de Tiempo RFC 3161: {session.rfc3161_timestamp}
            
          
        )}

        {activeTab === 'config' && (
          
            
              ESPAÑA - LOPDGDD & AEPD
              Detección perimetral en RAM de DNI, NIE y datos personales.
              ● HABILITADA PERMANENTE
            
            
              RGPD BANCARIO & FINANCIERO
              Intercepción estricta de cuentas IBAN y números de tarjeta.
              ● HABILITADA PERMANENTE
            
          
        )}
      
    
  );
}
