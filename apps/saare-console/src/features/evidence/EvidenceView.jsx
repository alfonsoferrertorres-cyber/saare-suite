// saare-console/src/features/evidence/EvidenceView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService, saareFetch } from '../../services/apiService';
import {
  CONSOLE_ACTIONS,
  EXECUTION_STATUS,
  EVIDENCE_LIFECYCLE
} from '../../domain/contracts';
import GovernanceToolbar from '../../components/GovernanceToolbar';

function toDetailPanelPayload(trace, verificationInfo = null, inclusionStatus = '') {
  if (!trace) return null;
  const baseLifecycle = trace.lifecycle || EVIDENCE_LIFECYCLE.CREATED;
  const computedLifecycle =
    inclusionStatus === 'VERIFIED' && baseLifecycle === EVIDENCE_LIFECYCLE.CREATED
      ? EVIDENCE_LIFECYCLE.BATCHED
      : baseLifecycle;

  return {
    id: trace.id,
    evidenceId: trace.evidenceId || trace.traceId || trace.id,
    verdict: trace.verdict || trace.rawVerdict || 'ALLOW',
    lifecycle: inclusionStatus ? `${computedLifecycle} · Merkle: ${inclusionStatus}` : computedLifecycle,
    hash: trace.hash || trace.merkleRoot || verificationInfo?.payloadDigest || '',
    raw: trace
  };
}

export default function EvidenceView({
  evidences = [],
  forensicBatch = null,
  isSealingBatch = false,
  inclusionStatusByEvidence = {},
  onSelectEvidence,
  onSealForensicBatch,
  onDownloadForensicBatchBundle,
  onDownloadTsaToken,
  onVerifyEvidenceInclusion,
  onOpenPdfReport,
  onOpenExportModal,
  onExportLecActa
}) {
  const {
    tenantId,
    can,
    setLastVerification,
    pushActivity
  } = useConsole();

  const [traces, setTraces] = useState([]);
  const [loadingTraces, setLoadingTraces] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedTrace, setSelectedTrace] = useState(null);
  const [verifyingId, setVerifyingId] = useState('');
  const [verificationMap, setVerificationMap] = useState({});

  const [sealPreviewOpen, setSealPreviewOpen] = useState(false);
  const [sealBusy, setSealBusy] = useState(false);
  const [lastBatch, setLastBatch] = useState(null);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerTone, setBannerTone] = useState('info'); // 'info' | 'success' | 'error'

  const showBanner = useCallback((msg, tone = 'info') => {
    setBannerMessage(msg);
    setBannerTone(tone);
  }, []);

  const loadTraces = useCallback(async () => {
    setLoadingTraces(true);
    try {
      const list = await apiService.getTelemetryTraces({
        tenant: tenantId || undefined,
        limit: 100
      });
      const safeList = Array.isArray(list) ? list : [];
      setTraces(safeList);
      setSelectedTrace((prev) => {
        if (!prev) return safeList[0] || null;
        return safeList.find((item) => item.id === prev.id) || safeList[0] || null;
      });
    } catch (err) {
      if (Array.isArray(evidences) && evidences.length > 0) {
        const fallbackList = evidences.map((ev) => ({
          id: ev.id,
          evidenceId: ev.id,
          traceId: ev.id,
          tenantId: ev.tenant || tenantId || '',
          user: ev.user || '',
          timestamp: ev.rawTimestamp || ev.time || '',
          promptPreview: ev.prompt || '—',
          verdict: ev.decision || 'ALLOW',
          rawVerdict: ev.verdict || ev.decision || 'ALLOW',
          policyVersion: 'SGP-1.0',
          hash: ev.merkleRoot || '',
          signatureStatus: EXECUTION_STATUS.NOT_RUN,
          batchId: forensicBatch?.batchId || '',
          tsaStatus: forensicBatch?.timestampSeal?.status || 'NOT_RUN',
          lifecycle: ev.merkleRoot ? EVIDENCE_LIFECYCLE.BATCHED : EVIDENCE_LIFECYCLE.CREATED,
          latencyMs: Number(ev.latency || 0) || 0,
          raw: ev
        }));
        setTraces(fallbackList);
        setSelectedTrace((prev) => prev || fallbackList[0] || null);
      } else {
        setTraces([]);
        showBanner(err?.message || 'No se pudieron recuperar las trazas de la bóveda.', 'error');
      }
    } finally {
      setLoadingTraces(false);
    }
  }, [tenantId, evidences, forensicBatch, showBanner]);

  useEffect(() => {
    loadTraces();
  }, [loadTraces]);

  const activeBatchSummary = useMemo(() => {
    if (forensicBatch?.batchId) {
      const tsaStatus = forensicBatch.timestampSeal?.status || 'TSA_PENDING';
      const isVerified = tsaStatus === 'TSA_VERIFIED' || forensicBatch.isQualifiedEidas;
      return {
        batchId: forensicBatch.batchId,
        merkleRoot: forensicBatch.merkleRoot || '',
        lifecycle: isVerified ? EVIDENCE_LIFECYCLE.TSA_VERIFIED : EVIDENCE_LIFECYCLE.SEALED_FALLBACK_LOCAL,
        tsaStatus,
        hasTsr: Boolean(forensicBatch.timestampSeal?.tsrBase64),
        ok: true
      };
    }
    if (lastBatch?.ok) {
      return {
        batchId: lastBatch.batchId,
        merkleRoot: lastBatch.merkleRoot || '',
        lifecycle: lastBatch.lifecycle,
        tsaStatus: lastBatch.tsaStatus,
        hasTsr: false,
        ok: true
      };
    }
    return null;
  }, [forensicBatch, lastBatch]);

  useEffect(() => {
    if (typeof onSelectEvidence === 'function') {
      const incKey = selectedTrace?.evidenceId || selectedTrace?.id || '';
      const incStatus = inclusionStatusByEvidence[selectedTrace?.id] || inclusionStatusByEvidence[incKey] || '';
      onSelectEvidence(
        toDetailPanelPayload(selectedTrace, verificationMap[selectedTrace?.id] || null, incStatus)
      );
    }
  }, [selectedTrace, verificationMap, inclusionStatusByEvidence, onSelectEvidence]);

  const handleSyncVault = async () => {
    if (syncBusy) return;
    if (!can(CONSOLE_ACTIONS.SYNC_VAULT)) {
      showBanner('Permiso denegado para sincronizar la bóveda.', 'error');
      return;
    }

    setSyncBusy(true);
    showBanner(`Sincronizando bóveda D1 para ${tenantId || 'contexto actual'}...`, 'info');

    try {
      const syncRes = await apiService.syncVault();
      await loadTraces();
      const ok = Boolean(syncRes?.ok !== false && syncRes?.status !== EXECUTION_STATUS.FAILED);
      showBanner(
        ok
          ? `Bóveda sincronizada para ${tenantId || 'tenant actual'}.`
          : `Sincronización con incidencias (${syncRes?.error || 'revisar estado'}).`,
        ok ? 'success' : 'error'
      );
      pushActivity({
        module: 'EVIDENCE',
        action: 'SYNC_VAULT',
        status: ok ? EXECUTION_STATUS.VERIFIED : EXECUTION_STATUS.FAILED,
        summary: `Sincronización de bóveda (${tenantId || 'sin tenant'}).`
      });
    } catch (err) {
      showBanner(err?.message || 'Error al sincronizar la bóveda.', 'error');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleVerifyRow = async (trace) => {
    if (!trace || verifyingId) return;
    if (!can(CONSOLE_ACTIONS.VERIFY_SIGNATURE) && !can(CONSOLE_ACTIONS.VERIFY_MERKLE_INCLUSION)) {
      showBanner('Permiso denegado para verificar evidencias.', 'error');
      return;
    }

    const hashToCheck = trace.hash || trace.evidenceId || trace.traceId;
    if (!hashToCheck) {
      showBanner('La evidencia seleccionada no dispone de hash ni identificador verificable.', 'error');
      return;
    }

    setVerifyingId(trace.id);
    showBanner(`Verificando integridad y firma de ${trace.evidenceId || trace.id}...`, 'info');

    try {
      const result = await apiService.verifyEvidenceSignature(hashToCheck, {
        evidenceId: trace.evidenceId,
        traceId: trace.traceId,
        merkleRoot: trace.batchId ? undefined : hashToCheck
      });

      setVerificationMap((prev) => ({
        ...prev,
        [trace.id]: result
      }));
      setLastVerification(result);

      if (typeof onVerifyEvidenceInclusion === 'function' && forensicBatch?.merkleRoot) {
        await onVerifyEvidenceInclusion({
          id: trace.evidenceId || trace.id,
          rawJson: { evidence_id: trace.evidenceId || trace.traceId || trace.id }
        });
      }

      const ok = Boolean(result?.verified && result?.status === EXECUTION_STATUS.VERIFIED);
      showBanner(
        ok
          ? `Verificación ${result.status} para ${trace.evidenceId || trace.id}.`
          : `Verificación ${result?.status || EXECUTION_STATUS.FAILED}: ${
              result?.error || 'no confirmada por el servidor.'
            }`,
        ok ? 'success' : 'error'
      );

      pushActivity({
        module: 'EVIDENCE',
        action: 'VERIFY_EVIDENCE',
        status: ok ? EXECUTION_STATUS.VERIFIED : EXECUTION_STATUS.FAILED,
        traceId: result?.traceId || trace.traceId || '',
        summary: `Verificación ${result?.status || 'FAILED'} en evidencia ${
          trace.evidenceId || trace.id
        }.`
      });
    } catch (err) {
      const failedObj = {
        status: EXECUTION_STATUS.FAILED,
        verified: false,
        error: err?.message || 'Error durante la verificación.'
      };
      setVerificationMap((prev) => ({ ...prev, [trace.id]: failedObj }));
      setLastVerification(failedObj);
      showBanner(failedObj.error, 'error');
    } finally {
      setVerifyingId('');
    }
  };

  const handleConfirmSealBatch = async () => {
    if (sealBusy || isSealingBatch) return;
    if (!can(CONSOLE_ACTIONS.SEAL_MERKLE_BATCH)) {
      showBanner('Permiso denegado para sellar lotes Merkle.', 'error');
      return;
    }

    setSealBusy(true);
    showBanner('Solicitando sellado de lote Merkle + RFC 3161...', 'info');

    try {
      if (typeof onSealForensicBatch === 'function') {
        await onSealForensicBatch();
        setSealPreviewOpen(false);
        await loadTraces();
        return;
      }

      const batchResult = await apiService.sealMerkleBatch({
        tenantId: tenantId || undefined,
        enable2of3Custody: true
      });

      setLastBatch(batchResult);
      setSealPreviewOpen(false);

      const ok = Boolean(batchResult?.ok);
      showBanner(
        ok
          ? `Lote ${batchResult.batchId} procesado · Estado: ${batchResult.lifecycle} (TSA: ${batchResult.tsaStatus}).`
          : `Sellado no completado [${batchResult?.status || EXECUTION_STATUS.FAILED}].`,
        ok ? 'success' : 'error'
      );

      pushActivity({
        module: 'EVIDENCE',
        action: 'SEAL_MERKLE_BATCH',
        status: batchResult?.status || EXECUTION_STATUS.FAILED,
        summary: ok
          ? `Lote ${batchResult.batchId} en estado ${batchResult.lifecycle}.`
          : 'Fallo al sellar lote Merkle.'
      });

      if (ok) {
        await loadTraces();
      }
    } catch (err) {
      showBanner(err?.message || 'Error al sellar el lote Merkle.', 'error');
    } finally {
      setSealBusy(false);
    }
  };

  const handleDownloadLastBatch = () => {
    if (typeof onDownloadForensicBatchBundle === 'function' && forensicBatch) {
      onDownloadForensicBatchBundle();
      return;
    }
    if (!lastBatch || typeof window === 'undefined' || typeof document === 'undefined') return;
    const blob = new Blob([JSON.stringify(lastBatch, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lote_merkle_${lastBatch.batchId || tenantId || 'evidencia'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSingleEvidence = async (trace) => {
    if (!trace) return;
    try {
      const res = await saareFetch(
        `/traces/${encodeURIComponent(trace.id)}`,
        {
          method: 'GET',
          overrideTenant: trace.tenantId || tenantId || undefined
        }
      );
      const detail = res.ok ? await res.json().catch(() => ({})) : {};
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob(
          [
            JSON.stringify(
              {
                exportedAt: new Date().toISOString(),
                evidence: trace,
                verification: verificationMap[trace.id] || null,
                serverDetail: detail
              },
              null,
              2
            )
          ],
          { type: 'application/json;charset=utf-8' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evidencia_${trace.evidenceId || trace.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      showBanner(`Evidencia ${trace.evidenceId || trace.id} exportada en JSON.`, 'success');
    } catch (err) {
      showBanner(err?.message || 'No se pudo exportar la evidencia.', 'error');
    }
  };

  const filteredTraces = useMemo(() => {
    return traces.filter((t) => {
      const matchesVerdict = verdictFilter === 'ALL' || t.verdict === verdictFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesQuery =
        !q ||
        String(t.evidenceId || '').toLowerCase().includes(q) ||
        String(t.traceId || '').toLowerCase().includes(q) ||
        String(t.hash || '').toLowerCase().includes(q) ||
        String(t.promptPreview || '').toLowerCase().includes(q);
      return matchesVerdict && matchesQuery;
    });
  }, [traces, verdictFilter, searchTerm]);

  const verifiedCount = useMemo(() => {
    return traces.filter(
      (t) =>
        verificationMap[t.id]?.status === EXECUTION_STATUS.VERIFIED ||
        t.signatureStatus === EXECUTION_STATUS.VERIFIED
    ).length;
  }, [traces, verificationMap]);

  const activeHash = selectedTrace?.hash || activeBatchSummary?.merkleRoot || '';
  const isSealingNow = sealBusy || isSealingBatch;

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

  const bannerColor =
    bannerTone === 'error' ? '#fca5a5' : bannerTone === 'success' ? '#6ee7b7' : '#7dd3fc';
  const bannerBorder =
    bannerTone === 'error' ? '#ef4444' : bannerTone === 'success' ? '#10b981' : '#0284c7';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {bannerMessage && (
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
          {bannerMessage}
        </div>
      )}

      {/* Métricas forenses rápidas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px'
        }}
      >
        <div style={sectionStyle}>
          <span style={labelStyle}>Trazas en bóveda</span>
          <strong className="saare-mono" style={{ fontSize: '1.2rem', color: '#f8fafc' }}>
            {traces.length}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Filtradas: {filteredTraces.length}
          </span>
        </div>

        <div style={sectionStyle}>
          <span style={labelStyle}>Firmas verificadas</span>
          <strong className="saare-mono" style={{ fontSize: '1.2rem', color: '#34d399' }}>
            {verifiedCount}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Ed25519 / inclusión</span>
        </div>

        <div style={sectionStyle}>
          <span style={labelStyle}>Estado TSA / Lote</span>
          <strong className="saare-mono" style={{ fontSize: '0.95rem', color: '#38bdf8' }}>
            {activeBatchSummary?.tsaStatus || 'SIN_LOTE'}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {activeBatchSummary?.batchId || 'Sin lote activo'}
          </span>
        </div>
      </div>

      {/* Acciones de custodia, firma y exportación */}
      <GovernanceToolbar targetHash={activeHash} tenantId={tenantId} />

      {(typeof onOpenExportModal === 'function' || typeof onExportLecActa === 'function') && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {typeof onOpenExportModal === 'function' && (
            <button
              type="button"
              onClick={onOpenExportModal}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontSize: '0.73rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Exportar informe / acta
            </button>
          )}
          {typeof onExportLecActa === 'function' && (
            <button
              type="button"
              onClick={onExportLecActa}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontSize: '0.73rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Acta Art. 326 LEC / ISO 27037
            </button>
          )}
        </div>
      )}

      {/* Lote forense Merkle + RFC 3161 */}
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
          <div>
            <span style={labelStyle}>Lote forense · Árbol de Merkle + Sellado RFC 3161</span>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
              {activeBatchSummary
                ? `Último lote: ${activeBatchSummary.batchId} · Estado: ${activeBatchSummary.lifecycle} · TSA: ${activeBatchSummary.tsaStatus}`
                : 'No se ha generado ningún lote en la sesión actual.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={isSealingNow || !can(CONSOLE_ACTIONS.SEAL_MERKLE_BATCH)}
              onClick={() => setSealPreviewOpen((prev) => !prev)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: isSealingNow ? 'wait' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {sealPreviewOpen ? 'Cerrar previsualización' : 'Preparar sellado de lote'}
            </button>

            {activeBatchSummary?.ok && (
              <button
                type="button"
                onClick={handleDownloadLastBatch}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#111827',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Descargar lote (.JSON)
              </button>
            )}

            {activeBatchSummary?.hasTsr && typeof onDownloadTsaToken === 'function' && (
              <button
                type="button"
                onClick={onDownloadTsaToken}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#065f46',
                  color: '#ecfdf5',
                  border: '1px solid #10b981',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Descargar sello (.TSR)
              </button>
            )}
          </div>
        </div>

        {sealPreviewOpen && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#020617',
              border: '1px solid #0284c7',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.76rem'
            }}
          >
            <strong>Previsualización previa al sellado</strong>
            <div style={{ color: '#cbd5e1' }}>
              Tenant objetivo: <strong>{tenantId || 'Contexto por defecto'}</strong> · Trazas
              cargadas: <strong>{traces.length}</strong> · Custodia: <strong>2-DE-3</strong>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              El estado final ({EVIDENCE_LIFECYCLE.TSA_VERIFIED},{' '}
              {EVIDENCE_LIFECYCLE.SEALED_FALLBACK_LOCAL} o {EVIDENCE_LIFECYCLE.TSA_PENDING})
              dependerá exclusivamente de la respuesta del servidor y de la TSA.
            </div>
            <div>
              <button
                type="button"
                disabled={isSealingNow}
                onClick={handleConfirmSealBatch}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: isSealingNow ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isSealingNow ? 'Sellando lote...' : 'Confirmar y sellar lote'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bóveda D1 y trazas */}
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
          <span style={labelStyle}>
            Bóveda D1 · Trazas y evidencias ({filteredTraces.length} de {traces.length})
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, hash o consulta..."
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontSize: '0.75rem',
                minWidth: '190px'
              }}
            />

            <select
              aria-label="Filtrar por veredicto"
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontSize: '0.75rem'
              }}
            >
              <option value="ALL">Todos los veredictos</option>
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
              <option value="SANITIZED">SANITIZED</option>
              <option value="REVIEW">REVIEW</option>
            </select>

            <button
              type="button"
              disabled={syncBusy || loadingTraces}
              onClick={handleSyncVault}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: syncBusy || loadingTraces ? 'wait' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {syncBusy || loadingTraces ? 'Sincronizando...' : 'Sincronizar bóveda'}
            </button>
          </div>
        </div>

        {filteredTraces.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '12px 0' }}>
            {loadingTraces
              ? 'Cargando trazas de evidencia...'
              : 'No hay trazas disponibles para los filtros actuales.'}
          </div>
        ) : (
          <div className="saare-table-wrap">
            <table className="saare-table" aria-label="Registro forense de trazas y evidencias">
              <thead>
                <tr>
                  <th>Evidencia / Traza</th>
                  <th>Veredicto</th>
                  <th>Ciclo / Firma</th>
                  <th>Consulta / Hash</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTraces.map((tr) => {
                  const isSelected = selectedTrace?.id === tr.id;
                  const checkInfo = verificationMap[tr.id];
                  const verStatus = checkInfo?.status || tr.signatureStatus || EXECUTION_STATUS.NOT_RUN;
                  const incStatus =
                    inclusionStatusByEvidence[tr.id] ||
                    inclusionStatusByEvidence[tr.evidenceId] ||
                    inclusionStatusByEvidence[tr.traceId] ||
                    '';

                  return (
                    <tr
                      key={tr.id}
                      onClick={() => setSelectedTrace(tr)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(2, 132, 199, 0.14)' : undefined
                      }}
                    >
                      <td className="saare-mono" style={{ fontWeight: '700', color: '#f8fafc' }}>
                        {tr.evidenceId || tr.id}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            whiteSpace: 'nowrap',
                            background: '#1e293b',
                            color: '#e2e8f0'
                          }}
                        >
                          {tr.verdict}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.72rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                        {tr.lifecycle} · {verStatus}
                        {incStatus ? ` · Merkle: ${incStatus}` : ''}
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#e2e8f0'
                          }}
                        >
                          {tr.promptPreview}
                        </div>
                        <div
                          className="saare-mono"
                          style={{
                            fontSize: '0.68rem',
                            color: '#64748b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tr.hash || 'Sin hash'}
                        </div>
                      </td>
                      <td className="saare-mono" style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {tr.timestamp || '—'}
                      </td>
                      <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                          <button
                            type="button"
                            disabled={Boolean(verifyingId)}
                            onClick={() => handleVerifyRow(tr)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: '5px',
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              cursor: verifyingId ? 'wait' : 'pointer'
                            }}
                          >
                            {verifyingId === tr.id ? 'Verificando...' : 'Verificar'}
                          </button>

                          {typeof onOpenPdfReport === 'function' && (
                            <button
                              type="button"
                              onClick={() => onOpenPdfReport(tr.raw || tr)}
                              style={{
                                padding: '5px 9px',
                                borderRadius: '5px',
                                background: '#0f172a',
                                color: '#7dd3fc',
                                border: '1px solid #0284c7',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              PDF
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleExportSingleEvidence(tr)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: '5px',
                              background: '#111827',
                              color: '#e2e8f0',
                              border: '1px solid #334155',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            JSON
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}