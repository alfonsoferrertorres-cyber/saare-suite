import React, { useState, useEffect } from 'react';
import HeaderBanner from './assets/CABECERA WEB.jfif';

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados de la consola original
  const [activeTab, setActiveTab] = useState('config'); // 'registro', 'runlive', 'config'
  const [runs, setRuns] = useState([]);
  const [metrics, setMetrics] = useState({ totalRuns: 0, blockedRuns: 0, activeRules: 4 });
  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState('');
  const [showAddRule, setShowAddRule] = useState(false);

  // Estados de directivas base
  const [directives, setDirectives] = useState({
    lopd: true,
    jailbreak: true,
    trazabilidad: true,
    finops: true
  });

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

  // Polling de evidencias cuando hay sesión activa
  useEffect(() => {
    if (!session) return;
    const fetchRuns = async () => {
      try {
        const res = await fetch(`https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=${encodeURIComponent(session.user)}`);
        const data = await res.json();
        if (data.runs) {
          setRuns(data.runs);
          setMetrics(prev => ({
            ...prev,
            totalRuns: data.runs.length,
            blockedRuns: data.runs.filter(r => r.verdict === 'RECHAZADO').length
          }));
        }
      } catch (e) {}
    };

    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, [session]);

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

  const toggleDirective = (key) => {
    setDirectives(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    setCustomRules(prev => [...prev, newRule.trim()]);
    setNewRule('');
    setShowAddRule(false);
  };

  // 1. PANTALLA DE LOGIN FORENSE (Si no está autenticado)
  if (!session) {
    return (
      
        
          
            
              🛡
            
            S.A.A.R.E. CONSOLE
            Autenticación en Bóveda Forense L7
          

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
            

            
              {loading ? 'VALIDANDO EN BÓVEDA...' : 'ENTRAR A SAARE CONSOLE'}
            
          

          
            Nodo Canónico: 2607076315021 | Dual-Vault RFC 3161
          
        
      
    );
  }

  // 2. INTERFAZ COMPLETA DE LA CONSOLA (Autenticada con el diseño original)
  const activeDirectivesCount = Object.values(directives).filter(Boolean).length;
  const disabledDirectivesCount = Object.values(directives).filter(v => !v).length;

  return (
    
      
      {/* 1. BANNER GRÁFICO SUPERIOR CON EL CEREBRO */}
      
        
      

      {/* 2. SUB-BARRA DINÁMICA DE AUTENTICACIÓN FORENSE */}
      
        
          SESIÓN VINCULADA
          USUARIO: {session.user}
          |
          ROL: {session.role}
          |
          TIER: {session.tier}
        
        
          
            LICENCIA: {session.license}
          
          
            Cerrar Sesión
          
        
      

      {/* 3. PANEL PRINCIPAL GRC ORIGINAL */}
      
        
        {/* Header GRC */}
        
          
            
              PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA V2.5
            
            
              ORGANIZACIÓN: S.A.A.R.E. Verified Custodian  |  
              DIRECTIVAS BASE: {activeDirectivesCount} Activas  |  
              {disabledDirectivesCount} Deshabilitadas  |  
              REGLAS PERSONALIZADAS: {customRules.length} Filtros
            
          
          
            DUAL-VAULT FORENSE ACTIVO
          
        

        {/* Pestañas de Navegación */}
        
           setActiveTab('registro')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'registro' ? '#0284c7' : '#fff', color: activeTab === 'registro' ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            REGISTRO GLOBAL ({runs.length})
          
           setActiveTab('runlive')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'runlive' ? '#0284c7' : '#fff', color: activeTab === 'runlive' ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            S.A.A.R.E. (RUNLIVE)
          
           setActiveTab('config')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'config' ? '#0284c7' : '#fff', color: activeTab === 'config' ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            CONFIGURACIÓN ({activeDirectivesCount})
          
        

        {/* TAB 1: CONFIGURACIÓN Y DIRECTIVAS */}
        {activeTab === 'config' && (
          
            {/* Filtros personalizados */}
            
              
                
                  CONFIGURADOR DE SINTAXIS Y FILTROS PERSONALIZADOS
                  Define palabras clave, frases confidenciales o expresiones regulares (/regex/i) para bloqueo en tiempo real.
                
                 setShowAddRule(!showAddRule)}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  + AÑADIR BLOQUEO
                
              

              {showAddRule && (
                
                   setNewRule(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  Guardar Regla
                
              )}

              {customRules.length === 0 ? (
                
                  No hay filtros personalizados activos. Las 4 directivas base de cumplimiento legal se mantienen en ejecución.
                
              ) : (
                
                  {customRules.map((rule, idx) => (
                    
                      Bloqueo: {rule}
                    
                  ))}
                
              )}
            

            {/* Grid de 4 Directivas Base Originales */}
            
              
              {/* Directiva 1: LOPD */}
              
                
                  PRIVACIDAD ES
                  
                    {directives.lopd ? 'HABILITADA' : 'DESHABILITADA'}
                  
                
                ESPAÑA - LOPDGDD & AEPD
                Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII.
                 toggleDirective('lopd')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.lopd ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.lopd ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                
              

              {/* Directiva 2: Jailbreak */}
              
                
                  CIBERSEGURIDAD
                  
                    {directives.jailbreak ? 'HABILITADA' : 'DESHABILITADA'}
                  
                
                TOP L7: JAILBREAK & PROMPT INJECTION GUARD
                Mitigación de ataques adversarios, modo DAN y anulación de directivas.
                 toggleDirective('jailbreak')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.jailbreak ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.jailbreak ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                
              

              {/* Directiva 3: Trazabilidad */}
              
                
                  TRAZABILIDAD FORENSE
                  
                    {directives.trazabilidad ? 'HABILITADA' : 'DESHABILITADA'}
                  
                
                SELLO DE TIEMPO RFC 3161 & HASH CANÓNICO
                Indexación criptográfica Ed25519 en Bóveda Forense sin almacenamiento en disco.
                 toggleDirective('trazabilidad')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.trazabilidad ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.trazabilidad ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                
              

              {/* Directiva 4: FinOps */}
              
                
                  FINOPS IT
                  
                    {directives.finops ? 'HABILITADA' : 'DESHABILITADA'}
                  
                
                CONTROL DE COSTES Y CUOTA DE LLM
                Limitación de gasto en tokens e inferencias masivas descontroladas.
                 toggleDirective('finops')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.finops ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.finops ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                
              

            
          
        )}

        {/* TAB 2: REGISTRO GLOBAL DE EVIDENCIAS */}
        {activeTab === 'registro' && (
          
            
              EVIDENCIAS DE INTERCEPCIÓN VINCULADAS AL TENANT ({session.user})
            
            {runs.length === 0 ? (
              
                No hay interceptaciones registradas para este tenant en la sesión actual.
              
            ) : (
              
                
                    {runs.map((r, i) => (
                      
                    ))}
                  
                  
                    
                      ID EVIDENCIA
                      FECHA / HORA
                      VEREDICTO
                      MOTIVO / NORMATIVA
                    
                  
                  
                        {r.evidenceId}
                        {r.timestamp}
                        
                          
                            {r.verdict}
                          
                        
                        {r.violationDetails?.reason || 'Validación de directiva'}
                      
                
              
            )}
          
        )}

        {/* TAB 3: RUNLIVE */}
        {activeTab === 'runlive' && (
          
            MONITORIZACIÓN EN TIEMPO REAL (RUNLIVE)
            
              [STATUS] SAARE Edge Runtime v2.7.0 Conectado
              [NODE] ID: 2607076315021 | Memoria RAM Aislada: ACTIVA
              [HASH] Firma Canónica: 128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07
              [TENANT] {session.user} ({session.license})
              ● ESCANEANDO PETICIONES ENTRANTES EN CAPA 7...
            
          
        )}

      
    
  );
}