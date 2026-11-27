// saare-console/src/features/evidence/EvidenceView.jsx
import React, { useState, useMemo } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { CONSOLE_ACTIONS } from '../../domain/contracts';

export default function EvidenceView({
  evidences = [],
  forensicBatch = null,
  isSealingBatch = false,
  inclusionStatusByEvidence = {},
  isFetchingVault = false,
  tenantRulesEnabled = true,
  onToggleTenantRules,
  onSyncVault,
  onSealForensicBatch,
  onDownloadForensicBatchBundle,
  onDownloadTsaToken,
  onVerifyEvidenceInclusion,
  onOpenPdfReport,
  onExportTracesJson,
  onExportSovereigntyCert,
  onSelectEvidence
}) {
  const { tenantId, can } = useConsole();

  const [decisionFilter, setDecisionFilter] = useState('ALL'); // 'ALL' | 'DENY' | 'ALLOW'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [confirmDisableRules, setConfirmDisableRules] = useState(false);

  const cleanTenant = String(tenantId || '').trim();
  const canVerify = can(CONSOLE_ACTIONS.VERIFY_SIGNATURE) || can(CONSOLE_ACTIONS.SYNC_VAULT);
  const canToggleRules = can(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES);

  const scopedEvidences = useMemo(() => {
    const list = Array.isArray(evidences) ? evidences : [];
    if (!cleanTenant) return list;
    return list.filter((item) => !item?.tenant || item.tenant === cleanTenant);
  }, [evidences, cleanTenant]);

  const filteredEvidences = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    return scopedEvidences.filter((ev) => {
      const decision = String(ev?.decision || '').toUpperCase();
      if (decisionFilter !== 'ALL' && decision !== decisionFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        ev?.id,
        ev?.cat,
        ev?.prompt,
        ev?.verdict,
        ev?.merkleRoot
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [scopedEvidences, decisionFilter, searchQuery]);

  const deniedCount = useMemo(
    () => scopedEvidences.filter((ev) => String(ev?.decision || '').toUpperCase() === 'DENY').length,
    [scopedEvidences]
  );
  const allowedCount = Math.max(0, scopedEvidences.length - deniedCount);

  const verifiedCount = useMemo(
    () =>
      Object.values(inclusionStatusByEvidence || {}).filter((status) => status === 'VERIFIED')
        .length,
    [inclusionStatusByEvidence]
  );

  const hasBatch = Boolean(forensicBatch?.batchId || forensicBatch?.merkleRoot);

  const selectedEvidence = useMemo(
    () => filteredEvidences.find((ev) => ev.id === selectedId) || null,
    [filteredEvidences, selectedId]
  );

  const handleSelectRow = (ev) => {
    const nextId = selectedId === ev.id ? '' : ev.id;
    setSelectedId(nextId);
    if (!nextId) {
      setShowRawJson(false);
    }
    if (typeof onSelectEvidence === 'function') {
      if (!nextId) {
        onSelectEvidence(null);
      } else {
        onSelectEvidence({
          id: ev.id,
          evidenceId: ev.id,
          verdict: ev.verdict || ev.decision || 'N/A',
          lifecycle: ev.decision === 'DENY' ? 'SANITIZED_EX_ANTE' : 'RECORDED',
          hash: ev.merkleRoot || ev.rawJson?.ms3v_hash || '',
          raw: ev
        });
      }
    }
  };

  const handleToggleRulesClick = async () => {
    if (typeof onToggleTenantRules !== 'function' || !canToggleRules) return;

    if (tenantRulesEnabled) {
      if (!confirmDisableRules) {
        setConfirmDisableRules(true);
        return;
      }
      setConfirmDisableRules(false);
      await onToggleTenantRules(false);
      return;
    }

    setConfirmDisableRules(false);
    await onToggleTenantRules(true);
  };

  const cardStyle = {
    background: '#0b0f19',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  const secondaryBtnStyle = {
    padding: '7px 12px',
    borderRadius: '6px',
    background: '#111827',
    color: '#e2e8f0',
    border: '1px solid #334155',
    fontSize: '0.73rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {/* Prioridad 1: Resumen forense y sellado de lote Merkle / RFC 3161 */}
      <section
        aria-label="Resumen de evidencias e integridad criptográfica"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px'
        }}
      >
        <div style={cardStyle}>
          <span style={labelStyle}>Evidencias registradas</span>
          <strong className="saare-mono" style={{ fontSize: '1.15rem', color: '#f8fafc' }}>
            {scopedEvidences.length}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Permitidas: {allowedCount} · Denegadas: {deniedCount}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Verificaciones de integridad</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.15rem',
              color: verifiedCount > 0 ? '#34d399' : '#cbd5e1'
            }}
          >
            {verifiedCount} / {scopedEvidences.length}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {verifiedCount === 0 && scopedEvidences.length > 0
              ? 'Sin verificaciones ejecutadas aún'
              : 'Pruebas verificadas en sesión'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Lote Merkle y TSA</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.05rem',
              color: hasBatch ? '#38bdf8' : '#cbd5e1'
            }}
          >
            {hasBatch ? forensicBatch.batchId : 'SIN_LOTE'}
          </strong>
          <span
            style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {forensicBatch?.merkleRoot
              ? `Raíz: ${forensicBatch.merkleRoot}`
              : 'Sin lote consolidado aún (pendiente de sellado)'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Sellado temporal TSA</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.05rem',
              color: forensicBatch?.timestampSeal?.status ? '#34d399' : '#94a3b8'
            }}
          >
            {forensicBatch?.timestampSeal?.status || forensicBatch?.assuranceLevel || 'PENDIENTE'}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Tenant: {cleanTenant || 'Sin asignar'}
          </span>
        </div>
      </section>

      {/* Nota aclaratoria cuando hay trazas pero aún no hay lote sellado ni verificaciones */}
      {scopedEvidences.length > 0 && (!hasBatch || verifiedCount === 0) && (
        <div
          role="note"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#070b14',
            border: '1px solid #1e293b',
            borderLeft: '3px solid #38bdf8',
            fontSize: '0.75rem',
            color: '#cbd5e1',
            lineHeight: 1.45
          }}
        >
          <strong>Estado esperado antes de consolidar:</strong> existen {scopedEvidences.length}{' '}
          evidencia(s) en bóveda, pero todavía no se ha sellado un lote Merkle ni verificado
          pruebas de inclusión. Esto indica que la consolidación o verificación aún no se ha
          ejecutado, no un fallo del sistema.
        </div>
      )}

      {/* Prioridad 2: Controles principales de bóveda, sellado forense y verificación */}
      <section style={cardStyle} aria-label="Controles forenses y de bóveda">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>Bóveda de evidencias y pruebas de inclusión</span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {typeof onSyncVault === 'function' && (
              <button
                type="button"
                disabled={isFetchingVault || !cleanTenant}
                onClick={() => onSyncVault(cleanTenant)}
                style={{
                  ...secondaryBtnStyle,
                  opacity: !cleanTenant ? 0.6 : 1,
                  cursor: isFetchingVault ? 'wait' : 'pointer'
                }}
              >
                {isFetchingVault ? 'Sincronizando...' : 'Sincronizar bóveda'}
              </button>
            )}

            {typeof onSealForensicBatch === 'function' && (
              <button
                type="button"
                disabled={isSealingBatch || !cleanTenant}
                onClick={onSealForensicBatch}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: !cleanTenant ? '#1e293b' : '#0284c7',
                  color: !cleanTenant ? '#64748b' : '#ffffff',
                  border: 'none',
                  fontSize: '0.73rem',
                  fontWeight: '800',
                  cursor: isSealingBatch ? 'wait' : !cleanTenant ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isSealingBatch ? 'Sellando lote...' : 'Sellar lote Merkle'}
              </button>
            )}

            {forensicBatch && typeof onDownloadForensicBatchBundle === 'function' && (
              <button type="button" onClick={onDownloadForensicBatchBundle} style={secondaryBtnStyle}>
                Descargar lote JSON
              </button>
            )}

            {forensicBatch?.timestampSeal?.tsrBase64 && typeof onDownloadTsaToken === 'function' && (
              <button type="button" onClick={onDownloadTsaToken} style={secondaryBtnStyle}>
                Descargar sello (.tsr)
              </button>
            )}

            {typeof onToggleTenantRules === 'function' && (
              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={!canToggleRules}
                  onClick={handleToggleRulesClick}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    background: !canToggleRules
                      ? '#1e293b'
                      : confirmDisableRules
                      ? '#7f1d1d'
                      : tenantRulesEnabled
                      ? '#064e3b'
                      : '#111827',
                    color: !canToggleRules
                      ? '#64748b'
                      : confirmDisableRules
                      ? '#fecaca'
                      : tenantRulesEnabled
                      ? '#6ee7b7'
                      : '#fbbf24',
                    border: `1px solid ${
                      !canToggleRules
                        ? '#334155'
                        : confirmDisableRules
                        ? '#ef4444'
                        : tenantRulesEnabled
                        ? '#10b981'
                        : '#d97706'
                    }`,
                    fontSize: '0.73rem',
                    fontWeight: '800',
                    cursor: canToggleRules ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {confirmDisableRules
                    ? 'Confirmar desactivar reglas'
                    : tenantRulesEnabled
                    ? 'Reglas tenant: ACTIVAS'
                    : 'Activar reglas tenant'}
                </button>

                {confirmDisableRules && (
                  <button
                    type="button"
                    onClick={() => setConfirmDisableRules(false)}
                    style={secondaryBtnStyle}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filtros de decisión y búsqueda */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['ALL', 'DENY', 'ALLOW'].map((mode) => {
            const active = decisionFilter === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setDecisionFilter(mode)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: active ? '#0f172a' : '#111827',
                  color: active ? '#38bdf8' : '#94a3b8',
                  border: `1px solid ${active ? '#0284c7' : '#334155'}`,
                  fontSize: '0.71rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {mode === 'ALL' ? 'Todas' : mode}
              </button>
            );
          })}

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, categoría, veredicto o hash..."
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#020617',
              color: '#f8fafc',
              border: '1px solid #334155',
              fontSize: '0.74rem',
              minWidth: '220px',
              flex: 1
            }}
          />
        </div>

        {/* Tabla de evidencias */}
        {filteredEvidences.length === 0 ? (
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', padding: '8px 0' }}>
            No hay evidencias que coincidan con el filtro actual.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.74rem',
                textAlign: 'left'
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '8px 6px' }}>ID / Hora</th>
                  <th style={{ padding: '8px 6px' }}>Decisión</th>
                  <th style={{ padding: '8px 6px' }}>Categoría</th>
                  <th style={{ padding: '8px 6px' }}>Carga / Resumen</th>
                  <th style={{ padding: '8px 6px' }}>Inclusión</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidences.map((ev) => {
                  const isDeny = String(ev?.decision || '').toUpperCase() === 'DENY';
                  const isSelected = selectedId === ev.id;
                  const inclusionState = inclusionStatusByEvidence?.[ev.id];

                  return (
                    <tr
                      key={ev.id}
                      tabIndex={0}
                      onClick={() => handleSelectRow(ev)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectRow(ev);
                        }
                      }}
                      style={{
                        borderBottom: '1px solid #111827',
                        background: isSelected ? '#0f172a' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
                        <div className="saare-mono" style={{ color: '#f8fafc', fontWeight: '700' }}>
                          {ev.id}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{ev.time || '—'}</div>
                      </td>

                      <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
                        <span
                          className="saare-mono"
                          style={{
                            padding: '2px 7px',
                            borderRadius: '999px',
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            background: isDeny
                              ? 'rgba(127, 29, 29, 0.5)'
                              : 'rgba(6, 78, 59, 0.5)',
                            color: isDeny ? '#fca5a5' : '#6ee7b7',
                            border: `1px solid ${isDeny ? '#ef4444' : '#10b981'}`
                          }}
                        >
                          {ev.decision || 'ALLOW'}
                        </span>
                      </td>

                      <td style={{ padding: '8px 6px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                        {ev.cat || '—'}
                      </td>

                      <td
                        style={{
                          padding: '8px 6px',
                          color: '#cbd5e1',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ev.prompt || '—'}
                      </td>

                      <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
                        <span className="saare-mono" style={{ fontSize: '0.69rem', color: '#94a3b8' }}>
                          {inclusionState || 'NO_VERIFICADA'}
                        </span>
                      </td>

                      <td
                        style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {typeof onVerifyEvidenceInclusion === 'function' && (
                            <button
                              type="button"
                              disabled={!canVerify || !hasBatch}
                              onClick={() => onVerifyEvidenceInclusion(ev)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '5px',
                                background: '#111827',
                                color: canVerify && hasBatch ? '#7dd3fc' : '#64748b',
                                border: '1px solid #334155',
                                fontSize: '0.69rem',
                                fontWeight: '700',
                                cursor: canVerify && hasBatch ? 'pointer' : 'not-allowed'
                              }}
                            >
                              Verificar
                            </button>
                          )}

                          {typeof onOpenPdfReport === 'function' && (
                            <button
                              type="button"
                              onClick={() => onOpenPdfReport(ev)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '5px',
                                background: '#111827',
                                color: '#e2e8f0',
                                border: '1px solid #334155',
                                fontSize: '0.69rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Informe
                            </button>
                          )}
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

      {/* Prioridad 3: Exportaciones secundarias y detalle JSON */}
      <section style={cardStyle} aria-label="Exportaciones y detalle de registro">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>Exportaciones y certificaciones de soporte</span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeof onExportTracesJson === 'function' && (
              <button type="button" onClick={onExportTracesJson} style={secondaryBtnStyle}>
                Exportar trazas (JSON)
              </button>
            )}

            {typeof onExportSovereigntyCert === 'function' && (
              <button type="button" onClick={onExportSovereigntyCert} style={secondaryBtnStyle}>
                Certificado soberanía D1
              </button>
            )}

            {selectedEvidence && (
              <button
                type="button"
                onClick={() => setShowRawJson((prev) => !prev)}
                style={secondaryBtnStyle}
              >
                {showRawJson ? 'Ocultar JSON raw' : 'Ver JSON raw'}
              </button>
            )}
          </div>
        </div>

        {showRawJson && selectedEvidence && (
          <pre
            className="saare-mono"
            style={{
              margin: 0,
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#020617',
              color: '#cbd5e1',
              fontSize: '0.69rem',
              overflowX: 'auto'
            }}
          >
            {JSON.stringify(selectedEvidence.rawJson || selectedEvidence, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}