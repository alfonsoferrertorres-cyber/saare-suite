// saare-console/src/features/evidence/EvidenceView.jsx
import React, { useState, useMemo } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { CONSOLE_ACTIONS } from '../../domain/contracts';

const EVIDENCE_PALETTE = {
  cardBg: '#F6F6F5',
  insetBg: '#FFFFFF',
  mutedBg: '#E4E2DC',
  primaryBtnBg: '#1A1D20',
  primaryBtnText: '#F6F6F5',
  secondaryBtnBg: '#FFFFFF',
  secondaryBtnText: '#1A1D20',
  textPrimary: '#1A1D20',
  textSecondary: '#4A5258',
  textMuted: '#5C646B',
  border: '#B5B7B9',
  charcoal: '#1A1D20',
  allowBg: '#E3ECE7',
  allowText: '#1B4332',
  allowBorder: '#749C88',
  denyBg: '#F3E4E2',
  denyText: '#6B211B',
  denyBorder: '#B87A74',
  neutralBadgeBg: '#ECEAE4'
};

function extractEvidenceHash(ev) {
  if (!ev) return '';
  return (
    ev.hash ||
    ev.merkleRoot ||
    ev.leafHash ||
    ev.rawJson?.ms3v_hash ||
    ev.rawJson?.hash ||
    ev.rawJson?.merkleRoot ||
    ''
  );
}

function extractEvidenceReason(ev) {
  if (!ev) return 'Sin detalle adicional';
  return (
    ev.reason ||
    ev.policy ||
    ev.ruleName ||
    ev.rawJson?.reason ||
    ev.rawJson?.policy ||
    ev.rawJson?.verdictReason ||
    (String(ev.decision || '').toUpperCase() === 'DENY'
      ? 'Bloqueo preventivo por regla o umbral de seguridad'
      : 'Evaluación conforme sin incidencia crítica')
  );
}

export default function EvidenceView({
  evidences = [],
  forensicBatch = null,
  isSealingBatch = false,
  inclusionStatusByEvidence = {},
  isFetchingVault = false,
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
  const [copiedHash, setCopiedHash] = useState(false);

  const cleanTenant = String(tenantId || '').trim();
  const canVerify = can(CONSOLE_ACTIONS.VERIFY_SIGNATURE) || can(CONSOLE_ACTIONS.SYNC_VAULT);

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
        ev?.merkleRoot,
        extractEvidenceHash(ev)
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
    setCopiedHash(false);
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
          hash: extractEvidenceHash(ev),
          raw: ev
        });
      }
    }
  };

  const handleCopyHash = async (hashValue) => {
    const cleanHash = String(hashValue || '').trim();
    if (!cleanHash || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(cleanHash);
      setCopiedHash(true);
      window.setTimeout(() => setCopiedHash(false), 1800);
    } catch {
      setCopiedHash(false);
    }
  };

  const cardStyle = {
    background: EVIDENCE_PALETTE.cardBg,
    border: `1px solid ${EVIDENCE_PALETTE.border}`,
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
    color: EVIDENCE_PALETTE.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  const secondaryBtnStyle = {
    padding: '7px 12px',
    borderRadius: '6px',
    background: EVIDENCE_PALETTE.secondaryBtnBg,
    color: EVIDENCE_PALETTE.secondaryBtnText,
    border: `1px solid ${EVIDENCE_PALETTE.border}`,
    fontSize: '0.73rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  const selectedHash = extractEvidenceHash(selectedEvidence);
  const selectedReason = extractEvidenceReason(selectedEvidence);

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
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.15rem',
              color: EVIDENCE_PALETTE.textPrimary,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {scopedEvidences.length}
          </strong>
          <span
            style={{
              fontSize: '0.72rem',
              color: EVIDENCE_PALETTE.textSecondary,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            Permitidas: {allowedCount} · Denegadas: {deniedCount}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Verificaciones de integridad</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.15rem',
              color: EVIDENCE_PALETTE.textPrimary,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {verifiedCount} / {scopedEvidences.length}
          </strong>
          <span style={{ fontSize: '0.72rem', color: EVIDENCE_PALETTE.textSecondary }}>
            {verifiedCount === 0 && scopedEvidences.length > 0
              ? 'Sin verificaciones ejecutadas aún'
              : 'Pruebas verificadas en sesión'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Lote Merkle y TSA</span>
          <strong
            className="saare-mono"
            style={{ fontSize: '1.05rem', color: EVIDENCE_PALETTE.textPrimary }}
          >
            {hasBatch ? forensicBatch.batchId : 'SIN_LOTE'}
          </strong>
          <span
            className="saare-mono"
            style={{
              fontSize: '0.7rem',
              color: EVIDENCE_PALETTE.textSecondary,
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="saare-mono"
              style={{
                padding: '3px 8px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: '800',
                background: forensicBatch?.timestampSeal?.status
                  ? EVIDENCE_PALETTE.allowBg
                  : EVIDENCE_PALETTE.neutralBadgeBg,
                color: forensicBatch?.timestampSeal?.status
                  ? EVIDENCE_PALETTE.allowText
                  : EVIDENCE_PALETTE.textSecondary,
                border: `1px solid ${
                  forensicBatch?.timestampSeal?.status
                    ? EVIDENCE_PALETTE.allowBorder
                    : EVIDENCE_PALETTE.border
                }`
              }}
            >
              {forensicBatch?.timestampSeal?.status || forensicBatch?.assuranceLevel || 'PENDIENTE'}
            </span>
          </span>
          <span style={{ fontSize: '0.72rem', color: EVIDENCE_PALETTE.textSecondary }}>
            Tenant: {cleanTenant || 'Sin asignar'}
          </span>
        </div>
      </section>

      {/* Nota compacta cuando hay trazas pero aún no hay lote sellado ni verificaciones */}
      {scopedEvidences.length > 0 && (!hasBatch || verifiedCount === 0) && (
        <div
          role="note"
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background: EVIDENCE_PALETTE.cardBg,
            border: `1px solid ${EVIDENCE_PALETTE.border}`,
            borderLeft: `3px solid ${EVIDENCE_PALETTE.primaryBtnBg}`,
            fontSize: '0.73rem',
            color: EVIDENCE_PALETTE.textSecondary,
            lineHeight: 1.4
          }}
        >
          <strong style={{ color: EVIDENCE_PALETTE.textPrimary }}>Estado inicial normal:</strong>{' '}
          {scopedEvidences.length} evidencia(s) en bóveda sin lote Merkle sellado ni pruebas de
          inclusión verificadas todavía.
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
                  background: !cleanTenant
                    ? EVIDENCE_PALETTE.mutedBg
                    : EVIDENCE_PALETTE.secondaryBtnBg,
                  color: !cleanTenant ? EVIDENCE_PALETTE.textMuted : EVIDENCE_PALETTE.textPrimary,
                  cursor: isFetchingVault ? 'wait' : !cleanTenant ? 'not-allowed' : 'pointer'
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
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: !cleanTenant
                    ? EVIDENCE_PALETTE.mutedBg
                    : EVIDENCE_PALETTE.primaryBtnBg,
                  color: !cleanTenant
                    ? EVIDENCE_PALETTE.textMuted
                    : EVIDENCE_PALETTE.primaryBtnText,
                  border: `1px solid ${
                    !cleanTenant ? EVIDENCE_PALETTE.border : EVIDENCE_PALETTE.charcoal
                  }`,
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
                  background: active
                    ? EVIDENCE_PALETTE.primaryBtnBg
                    : EVIDENCE_PALETTE.secondaryBtnBg,
                  color: active
                    ? EVIDENCE_PALETTE.primaryBtnText
                    : EVIDENCE_PALETTE.textSecondary,
                  border: `1px solid ${
                    active ? EVIDENCE_PALETTE.charcoal : EVIDENCE_PALETTE.border
                  }`,
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
              background: EVIDENCE_PALETTE.insetBg,
              color: EVIDENCE_PALETTE.textPrimary,
              border: `1px solid ${EVIDENCE_PALETTE.border}`,
              fontSize: '0.74rem',
              minWidth: '220px',
              flex: 1
            }}
          />
        </div>

        {/* Tabla de evidencias */}
        {filteredEvidences.length === 0 ? (
          <div style={{ fontSize: '0.76rem', color: EVIDENCE_PALETTE.textSecondary, padding: '8px 0' }}>
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
                <tr
                  style={{
                    borderBottom: `1px solid ${EVIDENCE_PALETTE.border}`,
                    color: EVIDENCE_PALETTE.textMuted
                  }}
                >
                  <th style={{ padding: '8px 8px' }}>ID / Hora</th>
                  <th style={{ padding: '8px 8px' }}>Decisión</th>
                  <th style={{ padding: '8px 8px' }}>Categoría</th>
                  <th style={{ padding: '8px 8px' }}>Carga / Resumen</th>
                  <th style={{ padding: '8px 8px' }}>Inclusión</th>
                  <th style={{ padding: '8px 8px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidences.map((ev) => {
                  const isDeny = String(ev?.decision || '').toUpperCase() === 'DENY';
                  const isSelected = selectedId === ev.id;
                  const inclusionState = inclusionStatusByEvidence?.[ev.id];
                  const isVerified = inclusionState === 'VERIFIED';

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
                        borderBottom: `1px solid ${EVIDENCE_PALETTE.mutedBg}`,
                        borderLeft: isSelected
                          ? `3px solid ${EVIDENCE_PALETTE.charcoal}`
                          : '3px solid transparent',
                        background: isSelected ? EVIDENCE_PALETTE.insetBg : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <div
                          className="saare-mono"
                          style={{
                            color: EVIDENCE_PALETTE.textPrimary,
                            fontWeight: '700',
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {ev.id}
                        </div>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            color: EVIDENCE_PALETTE.textMuted,
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {ev.time || '—'}
                        </div>
                      </td>

                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <span
                          className="saare-mono"
                          style={{
                            padding: '2px 7px',
                            borderRadius: '999px',
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            background: isDeny
                              ? EVIDENCE_PALETTE.denyBg
                              : EVIDENCE_PALETTE.allowBg,
                            color: isDeny ? EVIDENCE_PALETTE.denyText : EVIDENCE_PALETTE.allowText,
                            border: `1px solid ${
                              isDeny ? EVIDENCE_PALETTE.denyBorder : EVIDENCE_PALETTE.allowBorder
                            }`
                          }}
                        >
                          {ev.decision || 'ALLOW'}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: '8px 8px',
                          color: EVIDENCE_PALETTE.textSecondary,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ev.cat || '—'}
                      </td>

                      <td
                        style={{
                          padding: '8px 8px',
                          color: EVIDENCE_PALETTE.textPrimary,
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ev.prompt || '—'}
                      </td>

                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <span
                          className="saare-mono"
                          style={{
                            padding: '2px 7px',
                            borderRadius: '999px',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            background: isVerified
                              ? EVIDENCE_PALETTE.allowBg
                              : EVIDENCE_PALETTE.neutralBadgeBg,
                            color: isVerified
                              ? EVIDENCE_PALETTE.allowText
                              : EVIDENCE_PALETTE.textSecondary,
                            border: `1px solid ${
                              isVerified ? EVIDENCE_PALETTE.allowBorder : EVIDENCE_PALETTE.border
                            }`
                          }}
                        >
                          {inclusionState || 'NO_VERIFICADA'}
                        </span>
                      </td>

                      <td
                        style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}
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
                                background: 'transparent',
                                color:
                                  canVerify && hasBatch
                                    ? EVIDENCE_PALETTE.textPrimary
                                    : EVIDENCE_PALETTE.textMuted,
                                border: `1px solid ${
                                  canVerify && hasBatch
                                    ? EVIDENCE_PALETTE.border
                                    : EVIDENCE_PALETTE.mutedBg
                                }`,
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
                                background: 'transparent',
                                color: EVIDENCE_PALETTE.textPrimary,
                                border: `1px solid ${EVIDENCE_PALETTE.border}`,
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

      {/* Detalle legible de la evidencia seleccionada para inspección forense */}
      {selectedEvidence && (
        <section
          aria-label="Detalle de evidencia seleccionada"
          style={{
            ...cardStyle,
            background: EVIDENCE_PALETTE.insetBg
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <span style={labelStyle}>
              Evidencia seleccionada · <span className="saare-mono">{selectedEvidence.id}</span>
            </span>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedHash && (
                <button
                  type="button"
                  onClick={() => handleCopyHash(selectedHash)}
                  style={secondaryBtnStyle}
                >
                  {copiedHash ? 'Hash copiado' : 'Copiar hash'}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowRawJson((prev) => !prev)}
                style={secondaryBtnStyle}
              >
                {showRawJson ? 'Ocultar JSON raw' : 'Ver JSON raw'}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              fontSize: '0.73rem',
              color: EVIDENCE_PALETTE.textSecondary
            }}
          >
            <div>
              <strong style={{ color: EVIDENCE_PALETTE.textPrimary }}>Veredicto:</strong>{' '}
              <span className="saare-mono">
                {selectedEvidence.verdict || selectedEvidence.decision || 'N/A'}
              </span>
            </div>
            <div>
              <strong style={{ color: EVIDENCE_PALETTE.textPrimary }}>Motivo / Regla:</strong>{' '}
              {selectedReason}
            </div>
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <strong style={{ color: EVIDENCE_PALETTE.textPrimary }}>Hash / Hoja:</strong>{' '}
              <span className="saare-mono">{selectedHash || 'No registrado en fila'}</span>
            </div>
          </div>

          {showRawJson && (
            <pre
              className="saare-mono"
              style={{
                margin: 0,
                padding: '10px 12px',
                borderRadius: '6px',
                background: EVIDENCE_PALETTE.cardBg,
                border: `1px solid ${EVIDENCE_PALETTE.border}`,
                color: EVIDENCE_PALETTE.textPrimary,
                fontSize: '0.69rem',
                overflowX: 'auto'
              }}
            >
              {JSON.stringify(selectedEvidence.rawJson || selectedEvidence, null, 2)}
            </pre>
          )}
        </section>
      )}

      {/* Prioridad 3: Exportaciones y certificaciones de soporte */}
      <section style={cardStyle} aria-label="Exportaciones y certificaciones de soporte">
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
          </div>
        </div>
      </section>
    </div>
  );
}