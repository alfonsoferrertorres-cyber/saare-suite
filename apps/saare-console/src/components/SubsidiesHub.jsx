// saare-console/src/components/SubsidiesHub.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as CryptoModule from '../services/cryptoService';
import { apiService, saareFetch } from '../services/apiService';
import { api } from '../utils/api';

export const SubsidiesHub = ({ tenantId, currentEvidences = [] }) => {
  const currentUser = api?.getCurrentUser?.() || {};
  const activeTenant = tenantId || currentUser.tenantId || '';

  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState('KIT_CONSULTING');
  const [notification, setNotification] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showNotification = useCallback((message, type = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ message, type });
    timerRef.current = setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleVerifyForense = useCallback(async () => {
    setVerifying(true);
    setVerificationResult(null);

    const safeEvidences = Array.isArray(currentEvidences) ? currentEvidences : [];
    const latestEvidence = safeEvidences[0];

    if (!latestEvidence) {
      setVerificationResult({
        isValid: false,
        reason: 'No hay evidencias disponibles para el tenant activo.'
      });
      setVerifying(false);
      return;
    }

    try {
      const cryptoService = CryptoModule?.CryptoService || CryptoModule?.default || CryptoModule;

      if (cryptoService && typeof cryptoService.verifyMerkleIntegrity === 'function') {
        const res = await cryptoService.verifyMerkleIntegrity(latestEvidence);
        setVerificationResult(res);
      } else {
        setVerificationResult({
          isValid: false,
          reason: 'Servicio de verificación criptográfica no disponible.'
        });
      }
    } catch (err) {
      setVerificationResult({
        isValid: false,
        reason: `Error en verificación: ${err.message || 'Error desconocido'}`
      });
    } finally {
      setVerifying(false);
    }
  }, [currentEvidences]);

  const handleExportPackage = useCallback(async (docType = 'ALL') => {
    if (!activeTenant) {
      showNotification('Selecciona o autentica un tenant válido antes de exportar.', 'info');
      return;
    }

    setLoadingExport(true);
    const complianceCode = `${activeTenant}-${selectedGrant}-${docType}-${Date.now()}`;

    try {
      const res = typeof saareFetch === 'function'
        ? await saareFetch('/subsidies/export-package', {
            method: 'POST',
            body: JSON.stringify({
              tenantId: activeTenant,
              grantType: selectedGrant,
              documentType: docType,
              complianceCode
            })
          })
        : null;

      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        showNotification(
          `Expediente [${selectedGrant} - ${docType}] generado para ${activeTenant}. Código: ${data.complianceCode || complianceCode}`,
          'success'
        );
      } else {
        showNotification('No se pudo completar la exportación en el servidor.', 'info');
      }
    } catch (err) {
      showNotification(`Error al exportar expediente: ${err.message || 'Error de red'}`, 'info');
    } finally {
      setLoadingExport(false);
    }
  }, [activeTenant, selectedGrant, showNotification]);

  return (
    <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '24px', borderRadius: '12px', color: '#fff', marginTop: '20px' }}>
      <h3 style={{ color: '#34d399', margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '900' }}>
        Subsidies Hub — Justificación Forense &amp; Subvenciones Públicas ({activeTenant || 'Sin Tenant'})
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
        Gestión y justificación de ayudas y documentación técnica asociada al tenant activo.
      </p>

      {notification && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '0.8rem',
          fontWeight: '700',
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
          color: notification.type === 'success' ? '#34d399' : '#38bdf8',
          border: `1px solid ${notification.type === 'success' ? '#059669' : '#0284c7'}`
        }}>
          {notification.message}
        </div>
      )}

      <div style={{ background: '#020617', border: '1px solid #334155', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: '#38bdf8', fontWeight: '800', marginBottom: '8px' }}>
          SELECCIONAR PROGRAMA DE SUBVENCIÓN:
        </label>
        <select
          value={selectedGrant}
          onChange={(e) => setSelectedGrant(e.target.value)}
          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
        >
          <option value="KIT_CONSULTING">Kit Consulting</option>
          <option value="KIT_DIGITAL">Kit Digital</option>
          <option value="INCIBE_CDTI">INCIBE / CDTI</option>
          <option value="IMPULSO_IA">Impulso Ecosistemas IA</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#020617', border: '1px solid #334155', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: '800' }}>Verificador Forense</h4>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '12px' }}>Valida la integridad criptográfica de la evidencia activa del tenant.</p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleVerifyForense}
              disabled={verifying || !activeTenant}
              style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: verifying || !activeTenant ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.8rem', opacity: verifying || !activeTenant ? 0.6 : 1 }}
            >
              {verifying ? 'Verificando...' : 'Verificar Validez'}
            </button>
            {verificationResult && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: verificationResult.isValid ? '#4ade80' : '#f87171', padding: '8px', background: '#0b0f19', borderRadius: '4px', border: '1px solid #1e293b' }}>
                {verificationResult.reason}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#020617', border: '1px solid #334155', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: '800' }}>Exportación de Documentación</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '12px' }}>Genera documentos individuales o el paquete completo del tenant.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => handleExportPackage('MEMORIA_TECNICA')}
              disabled={loadingExport || !activeTenant}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold', cursor: loadingExport || !activeTenant ? 'not-allowed' : 'pointer', opacity: loadingExport || !activeTenant ? 0.6 : 1 }}
            >
              Memoria Técnica
            </button>
            <button
              type="button"
              onClick={() => handleExportPackage('DNSH')}
              disabled={loadingExport || !activeTenant}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold', cursor: loadingExport || !activeTenant ? 'not-allowed' : 'pointer', opacity: loadingExport || !activeTenant ? 0.6 : 1 }}
            >
              Certificado DNSH
            </button>
            <button
              type="button"
              onClick={() => handleExportPackage('LEY_18_2022')}
              disabled={loadingExport || !activeTenant}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold', cursor: loadingExport || !activeTenant ? 'not-allowed' : 'pointer', opacity: loadingExport || !activeTenant ? 0.6 : 1 }}
            >
              Ley 18/2022
            </button>
            <button
              type="button"
              onClick={() => handleExportPackage('FRIA_ART_27')}
              disabled={loadingExport || !activeTenant}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800', cursor: loadingExport || !activeTenant ? 'not-allowed' : 'pointer', opacity: loadingExport || !activeTenant ? 0.6 : 1 }}
            >
              Esquema FRIA
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleExportPackage('ALL_ZIP')}
            disabled={loadingExport || !activeTenant}
            style={{ width: '100%', background: '#059669', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: loadingExport || !activeTenant ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.8rem', opacity: loadingExport || !activeTenant ? 0.6 : 1 }}
          >
            {loadingExport ? 'Generando Archivo...' : 'Descargar Expediente Completo (.ZIP)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubsidiesHub;