import React, { useState } from 'react';

export default function EnterpriseDeployment() {
  const [tenantDomain, setTenantDomain] = useState('empresa.com');
  const [adminEmail, setAdminEmail] = useState('ciso@empresa.com');
  const [copied, setCopied] = useState(false);

  const intuneCommand = `install_silent.bat ${tenantDomain} ${adminEmail}`;
  const psOneLiner = `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://saare.es/dist/install_silent.bat' -OutFile 'install.bat'; .\\install.bat ${tenantDomain} ${adminEmail}"`;

  const downloadCustomInstaller = () => {
    const batContent = `@echo off\r\nchcp 65001 >nul\r\ntitle S.A.A.R.E. Silent Enterprise Installer L7\r\n\r\nset "EXTENSION_ID=saaregovernanceid"\r\nset "TENANT_DOMAIN=${tenantDomain}"\r\nset "USER_EMAIL=${adminEmail}"\r\n\r\nset "TARGET_DIR=%LOCALAPPDATA%\\SAARE\\extension"\r\nif not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"\r\nxcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\\" >nul 2>&1\r\n\r\n:: Registro Chrome & Edge\r\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1\r\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "version" /t REG_SZ /d "4.2.0" /f >nul 2>&1\r\nreg add "HKCU\\Software\\Microsoft\\Edge\\Extensions\\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1\r\nreg add "HKCU\\Software\\Microsoft\\Edge\\Extensions\\%EXTENSION_ID%" /v "version" /t REG_SZ /d "4.2.0" /f >nul 2>&1\r\n\r\n:: GPO Directives (storage.managed)\r\nreg add "HKLM\\Software\\Policies\\Google\\Chrome\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1\r\nreg add "HKLM\\Software\\Policies\\Google\\Chrome\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1\r\nreg add "HKLM\\Software\\Policies\\Microsoft\\Edge\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1\r\nreg add "HKLM\\Software\\Policies\\Microsoft\\Edge\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1\r\n\r\necho [OK] Agente desplegado para ${tenantDomain}.\r\ntimeout /t 2 >nul\r\nexit /b 0`;

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `install_saare_${tenantDomain.replace(/[^a-zA-Z0-9]/g, '_')}.bat`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section style={{ padding: '80px 20px', background: '#090d16', color: '#fff', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Cabecera de la sección */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ background: '#1e3a8a', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
            DESPLIEGUE CORPORATIVO ZERO-TOUCH
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '14px 0 8px 0' }}>
            Generador de Instaladores y Directivas GPO
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            Configura y descarga el paquete desatendido para Microsoft Intune, Active Directory o despliegue silencioso por terminal.
          </p>
        </div>

        {/* Formulario de Configuración */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', background: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid #1f2937' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#38bdf8' }}>1. Parámetros del Tenant Corporativo</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Dominio Corporativo (@empresa.es)</label>
              <input
                type="text"
                value={tenantDomain}
                onChange={(e) => setTenantDomain(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Correo Administrador / CISO</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={downloadCustomInstaller}
              style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              📥 Descargar Instalador Configurado (.BAT)
            </button>
          </div>

          {/* Comandos para TI / Intune */}
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#34d399' }}>2. Comandos para Despliegue Masivo</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Línea de comandos Intune / SCCM:</span>
                <button onClick={() => copyToClipboard(intuneCommand)} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <pre style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', color: '#a78bfa', fontSize: '0.8rem', overflowX: 'auto' }}>
                {intuneCommand}
              </pre>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>One-Liner Remoto (PowerShell Admin):</span>
                <button onClick={() => copyToClipboard(psOneLiner)} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <pre style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', color: '#34d399', fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {psOneLiner}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
