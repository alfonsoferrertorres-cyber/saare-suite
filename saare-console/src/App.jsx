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
        setErrorMsg(data.error || 'Credenciales no autorizadas en la Boveda Forense.');
      }
    } catch (err) {
      setErrorMsg('Error de conexion con el Gateway perimetral.');
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
      
        
          
            
              🛡
            
            S.A.A.R.E. CONSOLE
            Autenticacion en Boveda Forense L7
          

          {errorMsg && (
            
              {errorMsg}
            
          )}

          
            
              Correo Registrado
               setEmail(e.target.value)}
                placeholder="tudireccion@tudominio.es"
                style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            

            
              Clave de Licencia L7
               setLicenseKey(e.target.value)}
                placeholder="SAARE-XXXX-XXXX-XXXX"
                style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box' }}
              />
            

            
              {loading ? 'VALIDANDO EN BOVEDA...' : 'ENTRAR A SAARE CONSOLE'}
            
          

          
            Nodo Canonico: 2607076315021 | Dual-Vault RFC 3161
          
        
      
    );
  }

  // 2. Cabecera y Consola Autenticada Dinamicamente
  return (
    
      
      {/* CABECERA DINAMICA */}
      
        
          
            
              🛡 PANEL DE CONTROL GRC & AUDITORIA FORENSE S.A.A.R.E.
            
            
              USUARIO: {session.user}  |  
              ROL: {session.role}  |  
              TIER: {session.tier}
            
          

          
            
              LICENCIA: {session.license}
            
            
              Cerrar Sesion
            
          
        
      

      {/* TABS */}
      
        
           setActiveTab('registro')}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #334155', background: activeTab === 'registro' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            REGISTRO GLOBAL (EVIDENCIAS)
          
           setActiveTab('config')}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #334155', background: activeTab === 'config' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            DIRECTIVAS BASE (4 ACTIVAS)
          
        

        {activeTab === 'registro' && (
          
            EVIDENCIAS DE INTERCEPCION VINCULADAS AL TENANT
            
              ✔ CUSTODIA FORENSE ACTIVA — SIN ALMACENAMIENTO EN DISCO
              ID Nodo: 2607076315021 | Huella Canonica: 128fa8c937f946a0...9a07
              Sello de Tiempo RFC 3161: {session.rfc3161_timestamp}
            
          
        )}

        {activeTab === 'config' && (
          
            
              ESPANA - LOPDGDD & AEPD
              Deteccion perimetral en RAM de DNI, NIE y datos personales.
              ● HABILITADA PERMANENTE
            
            
              RGPD BANCARIO & FINANCIERO
              Intercepcion estricta de cuentas IBAN y numeros de tarjeta.
              ● HABILITADA PERMANENTE
            
          
        )}
      
    
  );
}
