// saare-console/src/features/administration/AdministrationView.jsx
import React, { useState, useEffect } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService, saareFetch } from '../../services/apiService';
import { CONSOLE_ACTIONS, EXECUTION_STATUS } from '../../domain/contracts';

function maskCredentialRef(rawRef = '') {
  const clean = String(rawRef || '').trim();
  if (!clean) return 'No disponible';
  if (clean.length <= 8) return `${clean.slice(0, 2)}***`;
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
}

export default function AdministrationView({
  authToken = '',
  billingInfo = null,
  onTenantChange,
  onOpenAuthModal,
  onOpenSeatsModal,
  onExportSovereigntyCert,
  onDownloadL7Extension,
  onDownloadSidecarPackage,
  onDownloadGpoReg,
  onDownloadK8sManifest,
  onDownloadIso42001Dossier,
  onDownloadIso27037Manifest,
  onExportTracesJson,
  onGenerateAuditToken
}) {
  const {
    tenantId,
    selectTenant,
    userEmail,
    role,
    can,
    pushActivity
  } = useConsole();

  const [tenantDraft, setTenantDraft] = useState(tenantId || '');
  const [licenseBusy, setLicenseBusy] = useState(false);
  const [licenseSummary, setLicenseSummary] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info'); // 'info' | 'success' | 'error'

  useEffect(() => {
    setTenantDraft(tenantId || '');
  }, [tenantId]);

  const activeTenant = String(tenantId || '').trim();
  const tenantLabel = activeTenant || 'Sin asignar';

  const setFeedback = (msg, tone = 'info') => {
    setStatusMessage(msg);
    setStatusTone(tone);
  };

  const handleApplyTenantContext = (e) => {
    e.preventDefault();
    if (!can(CONSOLE_ACTIONS.MANAGE_TENANTS)) {
      const denied = 'Permiso denegado para cambiar el contexto de tenant en administración.';
      setFeedback(denied, 'error');
      pushActivity({
        module: 'ADMINISTRATION',
        action: 'SWITCH_TENANT',
        status: EXECUTION_STATUS.FAILED,
        summary: denied
      });
      return;
    }

    const next = String(tenantDraft || '').trim();
    if (typeof onTenantChange === 'function') {
      onTenantChange(next);
    } else {
      selectTenant(next);
    }

    setFeedback(
      next ? `Tenant activo actualizado a [${next}].` : 'Contexto de tenant restablecido.',
      'success'
    );
  };

  const handleVerifyCredential = async () => {
    if (licenseBusy) return;
    if (!can(CONSOLE_ACTIONS.MANAGE_CREDENTIALS)) {
      const denied = 'Permiso denegado para verificar credenciales o licencias.';
      setFeedback(denied, 'error');
      pushActivity({
        module: 'ADMINISTRATION',
        action: 'VERIFY_LICENSE',
        status: EXECUTION_STATUS.FAILED,
        summary: denied
      });
      return;
    }

    setLicenseBusy(true);
    setFeedback(`Verificando credencial y licencia para ${tenantLabel}...`, 'info');

    try {
      const res = await saareFetch('/auth/verifylicense', {
        method: 'POST',
        overrideTenant: activeTenant || undefined,
        body: JSON.stringify({ purpose: 'AUDIT_TOKEN' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Error HTTP ${res.status}`);
      }

      const summary = {
        tenant: data.tenant || tenantLabel,
        role: data.role || role,
        plan: data.plan || data.tier || billingInfo?.planId || 'NO_ESPECIFICADO',
        keyRef: maskCredentialRef(data.keyId || data.key_id || data.tokenId || data.id),
        expiresAt: data.expiresAt || data.expires_at || 'No indicada',
        verifiedAt: new Date().toISOString()
      };

      setLicenseSummary(summary);
      const okMsg = `Credencial verificada para ${summary.tenant} (rol: ${summary.role}).`;
      setFeedback(okMsg, 'success');
      pushActivity({
        module: 'ADMINISTRATION',
        action: 'VERIFY_LICENSE',
        status: EXECUTION_STATUS.VERIFIED,
        summary: okMsg
      });
    } catch (err) {
      const errMsg = `Error verificando credencial: ${err?.message || 'fallo de red'}.`;
      setFeedback(errMsg, 'error');
      pushActivity({
        module: 'ADMINISTRATION',
        action: 'VERIFY_LICENSE',
        status: EXECUTION_STATUS.FAILED,
        summary: errMsg
      });
    } finally {
      setLicenseBusy(false);
    }
  };

  const handleDownloadSidecar = () => {
    if (!can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)) {
      setFeedback('Permiso denegado para descargar activos de despliegue.', 'error');
      return;
    }

    if (typeof onDownloadSidecarPackage === 'function') {
      onDownloadSidecarPackage();
    } else if (typeof apiService.downloadNativeSidecar === 'function') {
      apiService.downloadNativeSidecar(activeTenant || undefined);
    }

    const msg = `Descarga de Sidecar L7 iniciada para ${tenantLabel}.`;
    setFeedback(msg, 'success');
    pushActivity({
      module: 'ADMINISTRATION',
      action: 'DOWNLOAD_SIDECAR',
      status: EXECUTION_STATUS.VERIFIED,
      summary: msg
    });
  };

  const handleDownloadManifest = async () => {
    if (!can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)) {
      setFeedback('Permiso denegado para descargar manifiestos.', 'error');
      return;
    }

    if (typeof onDownloadIso27037Manifest === 'function') {
      await onDownloadIso27037Manifest();
      const msg = `Manifiesto ISO/IEC 27037 solicitado para ${tenantLabel}.`;
      setFeedback(msg, 'success');
      pushActivity({
        module: 'ADMINISTRATION',
        action: 'DOWNLOAD_MANIFEST',
        status: EXECUTION_STATUS.VERIFIED,
        summary: msg
      });
      return;
    }

    setFeedback(`Solicitando manifiesto técnico para ${tenantLabel}...`, 'info');
    try {
      const res = await saareFetch('/forensics/manifest', {
        method: 'GET',
        overrideTenant: activeTenant || undefined
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Error HTTP ${res.status}`);
      }

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const fileSlug = activeTenant || 'CONTEXTO';
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `manifiesto_despliegue_${fileSlug}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      const msg = `Manifiesto técnico descargado para ${tenantLabel}.`;
      setFeedback(msg, 'success');
      pushActivity({
        module: 'ADMINISTRATION',
        action: 'DOWNLOAD_MANIFEST',
        status: EXECUTION_STATUS.VERIFIED,
        summary: msg
      });
    } catch (err) {
      const errMsg = `Error descargando manifiesto: ${err?.message || 'fallo de red'}.`;
      setFeedback(errMsg, 'error');
      pushActivity({
        module: 'ADMINISTRATION',
        action: 'DOWNLOAD_MANIFEST',
        status: EXECUTION_STATUS.FAILED,
        summary: errMsg
      });
    }
  };

  const sectionStyle = {
    background: '#0b0f19',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  const buttonSecondaryStyle = {
    padding: '8px 14px',
    borderRadius: '6px',
    background: '#111827',
    color: '#e2e8f0',
    border: '1px solid #334155',
    fontSize: '0.75rem',
    fontWeight: '800',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  const bannerColor =
    statusTone === 'error' ? '#fca5a5' : statusTone === 'success' ? '#6ee7b7' : '#7dd3fc';
  const bannerBorder =
    statusTone === 'error' ? '#ef4444' : statusTone === 'success' ? '#10b981' : '#0284c7';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {statusMessage && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#020617',
            borderLeft: `3px solid ${bannerBorder}`,
            fontSize: '0.76rem',
            color: bannerColor,
            fontWeight: '600'
          }}
        >
          {statusMessage}
        </div>
      )}

      {/* 1. Multi-tenant y sesión */}
      <section style={sectionStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>1. Multi-tenant, organismo y sesión</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeof onOpenAuthModal === 'function' && (
              <button
                type="button"
                onClick={() => onOpenAuthModal('TOKEN')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {authToken ? 'Actualizar token / acceso' : 'Cargar token / acceso'}
              </button>
            )}
            {typeof onOpenSeatsModal === 'function' && (
              <button
                type="button"
                onClick={onOpenSeatsModal}
                style={buttonSecondaryStyle}
              >
                Gestionar asientos
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          Tenant activo: <strong>{tenantLabel}</strong> · Usuario:{' '}
          <strong>{userEmail || 'No autenticado'}</strong> · Rol: <strong>{role}</strong>
          {billingInfo?.planId ? (
            <>
              {' '}· Plan: <strong>{billingInfo.planId}</strong>
            </>
          ) : null}
        </div>

        <form onSubmit={handleApplyTenantContext} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            aria-label="Identificador de tenant"
            value={tenantDraft}
            onChange={(e) => setTenantDraft(e.target.value)}
            placeholder="Identificador de tenant / organismo"
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: '#020617',
              color: '#f8fafc',
              border: '1px solid #334155',
              fontSize: '0.78rem',
              minWidth: '220px'
            }}
          />
          <button
            type="submit"
            disabled={!can(CONSOLE_ACTIONS.MANAGE_TENANTS)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: can(CONSOLE_ACTIONS.MANAGE_TENANTS) ? '#0284c7' : '#1e293b',
              color: can(CONSOLE_ACTIONS.MANAGE_TENANTS) ? '#ffffff' : '#64748b',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: can(CONSOLE_ACTIONS.MANAGE_TENANTS) ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap'
            }}
          >
            Establecer tenant
          </button>
        </form>
      </section>

      {/* 2. Credenciales, licencia y auditoría */}
      <section style={sectionStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>2. Credenciales, licencia y auditoría</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeof onGenerateAuditToken === 'function' && (
              <button
                type="button"
                onClick={onGenerateAuditToken}
                style={buttonSecondaryStyle}
              >
                Generar token de auditoría
              </button>
            )}
            <button
              type="button"
              disabled={licenseBusy || !can(CONSOLE_ACTIONS.MANAGE_CREDENTIALS)}
              onClick={handleVerifyCredential}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: licenseBusy ? 'wait' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {licenseBusy ? 'Verificando...' : 'Verificar credencial'}
            </button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
          Por seguridad, las credenciales completas nunca se muestran ni se copian en texto plano en
          la interfaz.
        </p>

        {licenseSummary && (
          <div
            className="saare-mono"
            style={{
              padding: '12px',
              borderRadius: '6px',
              background: '#020617',
              border: '1px solid #1e293b',
              fontSize: '0.74rem',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div>
              Tenant: <strong>{licenseSummary.tenant}</strong> · Rol:{' '}
              <strong>{licenseSummary.role}</strong> · Plan: <strong>{licenseSummary.plan}</strong>
            </div>
            <div>
              Referencia parcial: <strong>{licenseSummary.keyRef}</strong> · Expiración:{' '}
              <strong>{licenseSummary.expiresAt}</strong>
            </div>
          </div>
        )}
      </section>

      {/* 3. Despliegue de agentes y manifiestos */}
      <section style={sectionStyle}>
        <span style={labelStyle}>3. Despliegue de agentes y manifiestos</span>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {typeof onDownloadL7Extension === 'function' && (
            <button
              type="button"
              disabled={!can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)}
              onClick={onDownloadL7Extension}
              style={{
                ...buttonSecondaryStyle,
                cursor: can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS) ? 'pointer' : 'not-allowed'
              }}
            >
              Extensión L7 (.ZIP)
            </button>
          )}

          <button
            type="button"
            disabled={!can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)}
            onClick={handleDownloadSidecar}
            style={{
              ...buttonSecondaryStyle,
              cursor: can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS) ? 'pointer' : 'not-allowed'
            }}
          >
            Sidecar L7 (.ZIP / Bootstrap)
          </button>

          {typeof onDownloadGpoReg === 'function' && (
            <button
              type="button"
              disabled={!can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)}
              onClick={onDownloadGpoReg}
              style={{
                ...buttonSecondaryStyle,
                cursor: can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS) ? 'pointer' : 'not-allowed'
              }}
            >
              Directiva GPO (.REG)
            </button>
          )}

          {typeof onDownloadK8sManifest === 'function' && (
            <button
              type="button"
              disabled={!can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)}
              onClick={onDownloadK8sManifest}
              style={{
                ...buttonSecondaryStyle,
                cursor: can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS) ? 'pointer' : 'not-allowed'
              }}
            >
              Manifiesto K8s (.YAML)
            </button>
          )}

          <button
            type="button"
            disabled={!can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)}
            onClick={handleDownloadManifest}
            style={{
              ...buttonSecondaryStyle,
              cursor: can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS) ? 'pointer' : 'not-allowed'
            }}
          >
            Manifiesto ISO 27037 (.JSON)
          </button>
        </div>
      </section>

      {/* 4. Certificados, dossiers y exportación */}
      <section style={sectionStyle}>
        <span style={labelStyle}>4. Certificados, dossiers y exportación</span>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {typeof onExportSovereigntyCert === 'function' && (
            <button
              type="button"
              disabled={!can(CONSOLE_ACTIONS.EXPORT_CUSTODY)}
              onClick={onExportSovereigntyCert}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: can(CONSOLE_ACTIONS.EXPORT_CUSTODY) ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap'
              }}
            >
              Certificado de Soberanía D1
            </button>
          )}

          {typeof onDownloadIso42001Dossier === 'function' && (
            <button
              type="button"
              disabled={!can(CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE)}
              onClick={onDownloadIso42001Dossier}
              style={{
                ...buttonSecondaryStyle,
                cursor: can(CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE) ? 'pointer' : 'not-allowed'
              }}
            >
              Dossier ISO 42001 (.JSON)
            </button>
          )}

          {typeof onExportTracesJson === 'function' && (
            <button
              type="button"
              disabled={!can(CONSOLE_ACTIONS.EXPORT_CUSTODY)}
              onClick={onExportTracesJson}
              style={{
                ...buttonSecondaryStyle,
                cursor: can(CONSOLE_ACTIONS.EXPORT_CUSTODY) ? 'pointer' : 'not-allowed'
              }}
            >
              Exportar trazas (.JSON)
            </button>
          )}
        </div>
      </section>
    </div>
  );
}