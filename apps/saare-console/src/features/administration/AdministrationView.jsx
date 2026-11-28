// saare-console/src/features/administration/AdministrationView.jsx
import React, { useState, useEffect } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService, saareFetch } from '../../services/apiService';
import { CONSOLE_ACTIONS, EXECUTION_STATUS } from '../../domain/contracts';

const ADMIN_PALETTE = {
  cardBg: '#F6F6F5',
  insetBg: '#FFFFFF',
  mutedBg: '#E4E2DC',
  primaryBtnBg: '#4A5258',
  primaryBtnText: '#F6F6F5',
  secondaryBtnBg: '#FFFFFF',
  secondaryBtnText: '#1A1D20',
  textPrimary: '#1A1D20',
  textSecondary: '#4A5258',
  textMuted: '#5C646B',
  border: '#B5B7B9',
  charcoal: '#1A1D20'
};

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
  const [manifestBusy, setManifestBusy] = useState(false);
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
        const defaultMsg =
          res.status === 401
            ? 'Sesión no autorizada o token inválido (HTTP 401).'
            : `Error HTTP ${res.status}`;
        throw new Error(data?.message || data?.error || defaultMsg);
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
    if (manifestBusy) return;
    if (!can(CONSOLE_ACTIONS.EXPORT_CUSTODY) && !can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)) {
      setFeedback('Permiso denegado para descargar manifiestos.', 'error');
      return;
    }

    setManifestBusy(true);
    setFeedback(`Solicitando manifiesto técnico ISO/IEC 27037 para ${tenantLabel}...`, 'info');

    try {
      if (typeof onDownloadIso27037Manifest === 'function') {
        const result = await onDownloadIso27037Manifest();
        if (result && result.ok === false) {
          throw new Error(result.error || 'No se pudo descargar el manifiesto ISO/IEC 27037');
        }
        const msg = `Manifiesto ISO/IEC 27037 descargado para ${tenantLabel}.`;
        setFeedback(msg, 'success');
        pushActivity({
          module: 'ADMINISTRATION',
          action: 'DOWNLOAD_MANIFEST',
          status: EXECUTION_STATUS.VERIFIED,
          summary: msg
        });
        return;
      }

      const res = await saareFetch('/forensics/manifest', {
        method: 'GET',
        overrideTenant: activeTenant || undefined
      });
      const rawText = await res.text().catch(() => '');
      let parsedData = null;
      try {
        parsedData = rawText ? JSON.parse(rawText) : {};
      } catch {
        parsedData = null;
      }

      if (!res.ok) {
        const defaultMsg =
          res.status === 401
            ? 'Sesión no autorizada o token inválido (HTTP 401).'
            : `Error HTTP ${res.status}`;
        throw new Error(parsedData?.message || parsedData?.error || defaultMsg);
      }

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const fileSlug = activeTenant || 'CONTEXTO';
        const contentToSave = parsedData
          ? JSON.stringify(parsedData, null, 2)
          : rawText;
        const blob = new Blob([contentToSave], {
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
    } finally {
      setManifestBusy(false);
    }
  };

  const sectionStyle = {
    background: ADMIN_PALETTE.cardBg,
    border: `1px solid ${ADMIN_PALETTE.border}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '800',
    color: ADMIN_PALETTE.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  const buttonSecondaryStyle = {
    padding: '8px 14px',
    borderRadius: '6px',
    background: ADMIN_PALETTE.secondaryBtnBg,
    color: ADMIN_PALETTE.secondaryBtnText,
    border: `1px solid ${ADMIN_PALETTE.border}`,
    fontSize: '0.75rem',
    fontWeight: '800',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  const bannerColor =
    statusTone === 'error'
      ? '#5C231E'
      : statusTone === 'success'
        ? '#1F3A2D'
        : ADMIN_PALETTE.textPrimary;
  const bannerBg =
    statusTone === 'error'
      ? '#E7D8D6'
      : statusTone === 'success'
        ? '#DCE3DF'
        : ADMIN_PALETTE.cardBg;
  const bannerBorder =
    statusTone === 'error'
      ? '#9E3B33'
      : statusTone === 'success'
        ? '#6D8779'
        : ADMIN_PALETTE.primaryBtnBg;

  const canManageTenants = can(CONSOLE_ACTIONS.MANAGE_TENANTS);
  const canManageCredentials = can(CONSOLE_ACTIONS.MANAGE_CREDENTIALS);
  const canDownloadAssets = can(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS);
  const canExportCustody = can(CONSOLE_ACTIONS.EXPORT_CUSTODY);
  const canExportGrc = can(CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {statusMessage && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: bannerBg,
            border: `1px solid ${ADMIN_PALETTE.border}`,
            borderLeft: `3px solid ${bannerBorder}`,
            fontSize: '0.76rem',
            color: bannerColor,
            fontWeight: '700'
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
                  background: ADMIN_PALETTE.primaryBtnBg,
                  color: ADMIN_PALETTE.primaryBtnText,
                  border: `1px solid ${ADMIN_PALETTE.charcoal}`,
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

        <div style={{ fontSize: '0.78rem', color: ADMIN_PALETTE.textSecondary, lineHeight: 1.5 }}>
          Tenant activo: <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{tenantLabel}</strong> ·
          Usuario:{' '}
          <strong style={{ color: ADMIN_PALETTE.textPrimary }}>
            {userEmail || 'No autenticado'}
          </strong>{' '}
          · Rol: <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{role}</strong>
          {billingInfo?.planId ? (
            <>
              {' '}· Plan:{' '}
              <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{billingInfo.planId}</strong>
            </>
          ) : null}
        </div>

        <form
          onSubmit={handleApplyTenantContext}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            aria-label="Identificador de tenant"
            value={tenantDraft}
            onChange={(e) => setTenantDraft(e.target.value)}
            placeholder="Identificador de tenant / organismo"
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: ADMIN_PALETTE.insetBg,
              color: ADMIN_PALETTE.textPrimary,
              border: `1px solid ${ADMIN_PALETTE.border}`,
              fontSize: '0.78rem',
              minWidth: '220px'
            }}
          />
          <button
            type="submit"
            disabled={!canManageTenants}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: canManageTenants ? ADMIN_PALETTE.primaryBtnBg : ADMIN_PALETTE.mutedBg,
              color: canManageTenants ? ADMIN_PALETTE.primaryBtnText : ADMIN_PALETTE.textMuted,
              border: `1px solid ${canManageTenants ? ADMIN_PALETTE.charcoal : ADMIN_PALETTE.border}`,
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: canManageTenants ? 'pointer' : 'not-allowed',
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
              disabled={licenseBusy || !canManageCredentials}
              onClick={handleVerifyCredential}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: canManageCredentials ? ADMIN_PALETTE.primaryBtnBg : ADMIN_PALETTE.mutedBg,
                color: canManageCredentials ? ADMIN_PALETTE.primaryBtnText : ADMIN_PALETTE.textMuted,
                border: `1px solid ${
                  canManageCredentials ? ADMIN_PALETTE.charcoal : ADMIN_PALETTE.border
                }`,
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: licenseBusy ? 'wait' : canManageCredentials ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap'
              }}
            >
              {licenseBusy ? 'Verificando...' : 'Verificar credencial'}
            </button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.74rem', color: ADMIN_PALETTE.textSecondary }}>
          Por seguridad, las credenciales completas nunca se muestran ni se copian en texto plano en
          la interfaz. Para conexión directa por red al Gateway API (`/v1/chat/completions`), utiliza
          la credencial vinculada al tenant y la cabecera `x-saare-tenant`.
        </p>

        {licenseSummary && (
          <div
            className="saare-mono"
            style={{
              padding: '12px',
              borderRadius: '6px',
              background: ADMIN_PALETTE.insetBg,
              border: `1px solid ${ADMIN_PALETTE.border}`,
              fontSize: '0.74rem',
              color: ADMIN_PALETTE.textSecondary,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div>
              Tenant: <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{licenseSummary.tenant}</strong>{' '}
              · Rol: <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{licenseSummary.role}</strong>{' '}
              · Plan: <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{licenseSummary.plan}</strong>
            </div>
            <div>
              Referencia parcial:{' '}
              <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{licenseSummary.keyRef}</strong> ·
              Expiración:{' '}
              <strong style={{ color: ADMIN_PALETTE.textPrimary }}>{licenseSummary.expiresAt}</strong>
            </div>
          </div>
        )}
      </section>

      {/* 3. Despliegue de agentes y paquetes estándar */}
      <section style={sectionStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>3. Paquetes y configuraciones de despliegue</span>
          <span style={{ fontSize: '0.72rem', color: ADMIN_PALETTE.textSecondary }}>
            4 modos instalables/configurables (Gateway API opera directo por red)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {typeof onDownloadL7Extension === 'function' && (
            <button
              type="button"
              disabled={!canDownloadAssets}
              onClick={onDownloadL7Extension}
              style={{
                ...buttonSecondaryStyle,
                background: canDownloadAssets ? ADMIN_PALETTE.secondaryBtnBg : ADMIN_PALETTE.mutedBg,
                color: canDownloadAssets ? ADMIN_PALETTE.textPrimary : ADMIN_PALETTE.textMuted,
                cursor: canDownloadAssets ? 'pointer' : 'not-allowed'
              }}
            >
              Extensión L7 (.ZIP)
            </button>
          )}

          <button
            type="button"
            disabled={!canDownloadAssets}
            onClick={handleDownloadSidecar}
            style={{
              ...buttonSecondaryStyle,
              background: canDownloadAssets ? ADMIN_PALETTE.secondaryBtnBg : ADMIN_PALETTE.mutedBg,
              color: canDownloadAssets ? ADMIN_PALETTE.textPrimary : ADMIN_PALETTE.textMuted,
              cursor: canDownloadAssets ? 'pointer' : 'not-allowed'
            }}
          >
            Sidecar L7 (.ZIP / Bootstrap)
          </button>

          {typeof onDownloadGpoReg === 'function' && (
            <button
              type="button"
              disabled={!canDownloadAssets}
              onClick={onDownloadGpoReg}
              style={{
                ...buttonSecondaryStyle,
                background: canDownloadAssets ? ADMIN_PALETTE.secondaryBtnBg : ADMIN_PALETTE.mutedBg,
                color: canDownloadAssets ? ADMIN_PALETTE.textPrimary : ADMIN_PALETTE.textMuted,
                cursor: canDownloadAssets ? 'pointer' : 'not-allowed'
              }}
            >
              Directiva GPO (.REG)
            </button>
          )}

          {typeof onDownloadK8sManifest === 'function' && (
            <button
              type="button"
              disabled={!canDownloadAssets}
              onClick={onDownloadK8sManifest}
              style={{
                ...buttonSecondaryStyle,
                background: canDownloadAssets ? ADMIN_PALETTE.secondaryBtnBg : ADMIN_PALETTE.mutedBg,
                color: canDownloadAssets ? ADMIN_PALETTE.textPrimary : ADMIN_PALETTE.textMuted,
                cursor: canDownloadAssets ? 'pointer' : 'not-allowed'
              }}
            >
              Manifiesto K8s (.YAML)
            </button>
          )}
        </div>
      </section>

      {/* 4. Certificados, manifiestos forenses y exportación */}
      <section style={sectionStyle}>
        <span style={labelStyle}>4. Certificados, manifiestos forenses y exportación</span>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {typeof onExportSovereigntyCert === 'function' && (
            <button
              type="button"
              disabled={!canExportCustody}
              onClick={onExportSovereigntyCert}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: canExportCustody ? ADMIN_PALETTE.primaryBtnBg : ADMIN_PALETTE.mutedBg,
                color: canExportCustody ? ADMIN_PALETTE.primaryBtnText : ADMIN_PALETTE.textMuted,
                border: `1px solid ${canExportCustody ? ADMIN_PALETTE.charcoal : ADMIN_PALETTE.border}`,
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: canExportCustody ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap'
              }}
            >
              Certificado de Soberanía D1
            </button>
          )}

          {typeof onDownloadIso42001Dossier === 'function' && (
            <button
              type="button"
              disabled={!canExportGrc}
              onClick={onDownloadIso42001Dossier}
              style={{
                ...buttonSecondaryStyle,
                background: canExportGrc ? ADMIN_PALETTE.secondaryBtnBg : ADMIN_PALETTE.mutedBg,
                color: canExportGrc ? ADMIN_PALETTE.textPrimary : ADMIN_PALETTE.textMuted,
                cursor: canExportGrc ? 'pointer' : 'not-allowed'
              }}
            >
              Dossier ISO 42001 (.JSON)
            </button>
          )}

          <button
            type="button"
            disabled={manifestBusy || (!canExportCustody && !canDownloadAssets)}
            onClick={handleDownloadManifest}
            style={{
              ...buttonSecondaryStyle,
              background:
                canExportCustody || canDownloadAssets
                  ? ADMIN_PALETTE.secondaryBtnBg
                  : ADMIN_PALETTE.mutedBg,
              color:
                canExportCustody || canDownloadAssets
                  ? ADMIN_PALETTE.textPrimary
                  : ADMIN_PALETTE.textMuted,
              cursor: manifestBusy
                ? 'wait'
                : canExportCustody || canDownloadAssets
                  ? 'pointer'
                  : 'not-allowed'
            }}
          >
            {manifestBusy ? 'Descargando...' : 'Manifiesto ISO 27037 (.JSON)'}
          </button>

          {typeof onExportTracesJson === 'function' && (
            <button
              type="button"
              disabled={!canExportCustody}
              onClick={onExportTracesJson}
              style={{
                ...buttonSecondaryStyle,
                background: canExportCustody ? ADMIN_PALETTE.secondaryBtnBg : ADMIN_PALETTE.mutedBg,
                color: canExportCustody ? ADMIN_PALETTE.textPrimary : ADMIN_PALETTE.textMuted,
                cursor: canExportCustody ? 'pointer' : 'not-allowed'
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