// saare-console/src/features/runtime/RuntimeView.jsx
import React, { useState, useEffect } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService, saareFetch } from '../../services/apiService';
import { CONSOLE_ACTIONS, EXECUTION_STATUS } from '../../domain/contracts';

const PROTOCOL_DIRECTIVES = [
  {
    code: 'SAARE-MD-FOR',
    name: 'Auditoría Forense',
    scope: 'Evidencia y cadena de custodia',
    description: 'Aplica trazabilidad reforzada para inspección forense de la interacción.'
  },
  {
    code: 'SAARE-MD-CORP',
    name: 'Certificación Corporativa',
    scope: 'Gobernanza organizativa',
    description: 'Vincula la evaluación al marco documental y de cumplimiento corporativo.'
  },
  {
    code: 'SAARE-MD-SECU',
    name: 'Blindaje Activo',
    scope: 'Seguridad L7 y prevención de inyección',
    description: 'Refuerza controles preventivos ex-ante frente a instrucciones no confiables.'
  },
  {
    code: 'SAARE-MD-VERD',
    name: 'Veredicto de Integridad',
    scope: 'Comprobación de integridad',
    description: 'Exige verificación de consistencia y huella de integridad sobre el resultado.'
  },
  {
    code: 'SAARE-MD-LEGAL',
    name: 'Auditoría Jurídica',
    scope: 'Dominio jurídico y privacidad',
    description: 'Evalúa la consulta bajo criterios de minimización y cumplimiento normativo.'
  },
  {
    code: 'SAARE-MD-IPRES',
    name: 'Propiedad Intelectual (IP)',
    scope: 'Protección de activos y secreto',
    description: 'Vigila posible exposición de información confidencial o propiedad industrial.'
  },
  {
    code: 'SAARE-MD-COMPLIANCE',
    name: 'Cumplimiento Ex-Ante',
    scope: 'Admisión previa a inferencia',
    description: 'Valida políticas normativas antes de permitir la remisión al modelo.'
  }
];

export default function RuntimeView({
  testPrompt = '',
  setTestPrompt,
  testResult = null,
  isEvaluating = false,
  runningProtocolCode = '',
  protocolOutput = null,
  dossierRef: externalDossierRef,
  setDossierRef: externalSetDossierRef,
  protocolCommands = [],
  protocolCommandsEnabled = {},
  onToggleProtocolCommand,
  onSetAllProtocolCommands,
  onExecuteProtocolCommand,
  onExecuteTestExAnte,
  tenantRulesEnabled: externalRulesEnabled,
  onToggleTenantRules: externalOnToggleTenantRules
}) {
  const {
    tenantId,
    routeMode,
    changeRouteMode,
    nodeStatus,
    loadingNode,
    refreshNodeStatus,
    can,
    pushActivity
  } = useConsole();

  const [promptInput, setPromptInput] = useState(testPrompt || '');
  const [scenarioId, setScenarioId] = useState('razonamiento_activo_l7');
  const [selectedDirective, setSelectedDirective] = useState('SAARE-MD-SECU');
  const [evaluatingMode, setEvaluatingMode] = useState(''); // '' | 'SIMULATION' | 'LIVE'
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [localDossierRef, setLocalDossierRef] = useState('030926-1SAA');

  const activeDossierRef = externalDossierRef !== undefined ? externalDossierRef : localDossierRef;
  const updateDossierRef = externalSetDossierRef || setLocalDossierRef;

  const [directiveStates, setDirectiveStates] = useState(() =>
    PROTOCOL_DIRECTIVES.reduce((acc, item) => {
      acc[item.code] = true;
      return acc;
    }, {})
  );
  const [localRulesEnabled, setLocalRulesEnabled] = useState(true);
  const [policyBusy, setPolicyBusy] = useState(false);

  const [killReason, setKillReason] = useState('');
  const [killConfirmed, setKillConfirmed] = useState(false);
  const [killBusy, setKillBusy] = useState(false);
  const [killStatusMsg, setKillStatusMsg] = useState('');

  useEffect(() => {
    if (testPrompt && !promptInput) {
      setPromptInput(testPrompt);
    }
  }, [testPrompt, promptInput]);

  useEffect(() => {
    if (protocolCommandsEnabled && typeof protocolCommandsEnabled === 'object') {
      setDirectiveStates((prev) => ({
        ...prev,
        ...protocolCommandsEnabled
      }));
    }
  }, [protocolCommandsEnabled]);

  const rulesEnabled =
    typeof externalRulesEnabled === 'boolean' ? externalRulesEnabled : localRulesEnabled;
  const isRuntimeOk = Boolean(nodeStatus?.healthy);
  const busyEval = Boolean(evaluatingMode) || Boolean(isEvaluating);

  const handlePromptChange = (val) => {
    setPromptInput(val);
    if (typeof setTestPrompt === 'function') {
      setTestPrompt(val);
    }
  };

  const handleEvaluate = async (isSimulation) => {
    const cleanPrompt = String(promptInput || '').trim();
    if (!cleanPrompt) {
      setEvaluationResult({
        executionStatus: EXECUTION_STATUS.FAILED,
        verdict: 'DENY',
        error: 'Introduce una consulta o instrucción antes de evaluar.'
      });
      return;
    }

    const requiredPerm = isSimulation
      ? CONSOLE_ACTIONS.EVALUATE_SIMULATION
      : CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE;

    if (!can(requiredPerm)) {
      const msg = `Permiso denegado para ${
        isSimulation ? 'simular evaluación' : 'remitir consulta al modelo'
      }.`;
      setEvaluationResult({
        executionStatus: EXECUTION_STATUS.FAILED,
        verdict: 'DENY',
        error: msg
      });
      pushActivity({
        module: 'RUNTIME',
        action: isSimulation ? 'EVALUATE_SIMULATION' : 'EXECUTE_L7_INFERENCE',
        status: EXECUTION_STATUS.FAILED,
        summary: msg
      });
      return;
    }

    setEvaluatingMode(isSimulation ? 'SIMULATION' : 'LIVE');
    try {
      const normalized = await apiService.interceptPrompt(cleanPrompt, {
        tenant: tenantId || undefined,
        scenarioId,
        commandCode: selectedDirective,
        simulation: isSimulation,
        mode: isSimulation ? 'SIMULATION' : 'LIVE'
      });

      setEvaluationResult(normalized);

      if (typeof onExecuteTestExAnte === 'function') {
        await onExecuteTestExAnte(cleanPrompt);
      }

      pushActivity({
        module: 'RUNTIME',
        action: isSimulation ? 'EVALUATE_SIMULATION' : 'EXECUTE_L7_INFERENCE',
        status: normalized?.executionStatus || EXECUTION_STATUS.VERIFIED,
        traceId: normalized?.traceId || '',
        summary: `${isSimulation ? '[Simulación]' : '[Remisión]'} Veredicto ${
          normalized?.verdict || 'EVALUADO'
        } (${selectedDirective}).`
      });
    } catch (err) {
      const errMsg = err?.message || 'Error durante la evaluación L7.';
      setEvaluationResult({
        executionStatus: EXECUTION_STATUS.FAILED,
        verdict: 'DENY',
        error: errMsg
      });
      pushActivity({
        module: 'RUNTIME',
        action: isSimulation ? 'EVALUATE_SIMULATION' : 'EXECUTE_L7_INFERENCE',
        status: EXECUTION_STATUS.FAILED,
        summary: errMsg
      });
    } finally {
      setEvaluatingMode('');
    }
  };

  const handleToggleDirective = async (code) => {
    if (policyBusy || !can(CONSOLE_ACTIONS.TOGGLE_DIRECTIVE)) return;
    const prev = Boolean(directiveStates[code]);
    const next = !prev;
    setPolicyBusy(true);
    setDirectiveStates((st) => ({ ...st, [code]: next }));

    try {
      if (typeof onToggleProtocolCommand === 'function') {
        await onToggleProtocolCommand(code);
        return;
      }

      const res = await saareFetch('/custom-rules', {
        method: 'POST',
        overrideTenant: tenantId || undefined,
        body: JSON.stringify({
          protocolCommands: { [code]: next }
        })
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message || `HTTP ${res.status}`);
      }
      pushActivity({
        module: 'RUNTIME',
        action: 'TOGGLE_DIRECTIVE',
        status: EXECUTION_STATUS.VERIFIED,
        summary: `Directiva ${code} marcada como ${next ? 'ACTIVA' : 'INACTIVA'}.`
      });
    } catch (err) {
      setDirectiveStates((st) => ({ ...st, [code]: prev }));
      pushActivity({
        module: 'RUNTIME',
        action: 'TOGGLE_DIRECTIVE',
        status: EXECUTION_STATUS.FAILED,
        summary: `Error al actualizar ${code}: ${err?.message || 'fallo de red'}.`
      });
    } finally {
      setPolicyBusy(false);
    }
  };

  const handleToggleTenantRules = async () => {
    if (policyBusy || !can(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES)) return;
    const prev = rulesEnabled;
    const next = !prev;
    setPolicyBusy(true);
    setLocalRulesEnabled(next);

    try {
      if (typeof externalOnToggleTenantRules === 'function') {
        await externalOnToggleTenantRules(next);
        return;
      }

      const res = await saareFetch('/custom-rules', {
        method: 'POST',
        overrideTenant: tenantId || undefined,
        body: JSON.stringify({ enabled: next })
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message || `HTTP ${res.status}`);
      }
      pushActivity({
        module: 'RUNTIME',
        action: 'TOGGLE_TENANT_RULES',
        status: EXECUTION_STATUS.VERIFIED,
        summary: `Reglas DLP del tenant ${next ? 'ACTIVADAS' : 'DESACTIVADAS'}.`
      });
    } catch (err) {
      setLocalRulesEnabled(prev);
      pushActivity({
        module: 'RUNTIME',
        action: 'TOGGLE_TENANT_RULES',
        status: EXECUTION_STATUS.FAILED,
        summary: `Error al cambiar reglas del tenant: ${err?.message || 'fallo de red'}.`
      });
    } finally {
      setPolicyBusy(false);
    }
  };

  const handleTriggerKillSwitch = async (e) => {
    e.preventDefault();
    if (killBusy) return;

    if (!can(CONSOLE_ACTIONS.TRIGGER_KILL_SWITCH)) {
      setKillStatusMsg('Permiso denegado: tu rol no está autorizado para activar el Kill-Switch.');
      return;
    }

    if (!killConfirmed || killReason.trim().length < 5) {
      setKillStatusMsg(
        'Debes confirmar la operación e indicar un motivo de auditoría (mínimo 5 caracteres).'
      );
      return;
    }

    setKillBusy(true);
    setKillStatusMsg('Registrando solicitud de apagado de emergencia en el control plane...');

    try {
      const res = await saareFetch('/chat/completions', {
        method: 'POST',
        overrideTenant: tenantId || undefined,
        body: JSON.stringify({
          prompt: `SAARE_CONTROL.PY --KILL | MOTIVO: ${killReason.trim()}`,
          commandCode: 'KILL-SWITCH',
          reason: killReason.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      const traceRef = data?.trace_id || data?.traceId || '';
      setKillStatusMsg(
        `Orden Kill-Switch procesada (HTTP ${res.status})${
          traceRef ? ` · trace: ${traceRef}` : ''
        }.`
      );
      pushActivity({
        module: 'INCIDENTS',
        action: 'TRIGGER_KILL_SWITCH',
        status: EXECUTION_STATUS.VERIFIED,
        traceId: traceRef,
        summary: `Kill-Switch ejecutado. Motivo: ${killReason.trim()}`
      });
      setKillConfirmed(false);
    } catch (err) {
      const errMsg = `Fallo al ejecutar Kill-Switch: ${err?.message || 'error de red'}.`;
      setKillStatusMsg(errMsg);
      pushActivity({
        module: 'INCIDENTS',
        action: 'TRIGGER_KILL_SWITCH',
        status: EXECUTION_STATUS.FAILED,
        summary: errMsg
      });
    } finally {
      setKillBusy(false);
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

  const quickCommands =
    Array.isArray(protocolCommands) && protocolCommands.length > 0
      ? protocolCommands.filter((c) => !c.danger)
      : PROTOCOL_DIRECTIVES.map((d) => ({
          label: d.name,
          code: d.code,
          prompt: `${d.code} — Ejecuta directiva ${d.name}.`
        }));

  const activeDirectivesCount = Object.values(directiveStates).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {/* 1. Runtime y conectividad */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={labelStyle}>1. Runtime y conectividad</span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                background: isRuntimeOk ? 'rgba(6, 78, 59, 0.7)' : 'rgba(69, 10, 10, 0.7)',
                color: isRuntimeOk ? '#6ee7b7' : '#fca5a5',
                border: `1px solid ${isRuntimeOk ? '#10b981' : '#ef4444'}`
              }}
            >
              {nodeStatus?.status || 'NO_DISPONIBLE'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => changeRouteMode('CLOUD_EDGE')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: routeMode === 'CLOUD_EDGE' ? '#0284c7' : '#020617',
                color: routeMode === 'CLOUD_EDGE' ? '#ffffff' : '#94a3b8',
                border: '1px solid #334155'
              }}
            >
              Cloud Edge
            </button>
            <button
              type="button"
              onClick={() => changeRouteMode('LOCAL_SIDECAR')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: routeMode === 'LOCAL_SIDECAR' ? '#0284c7' : '#020617',
                color: routeMode === 'LOCAL_SIDECAR' ? '#ffffff' : '#94a3b8',
                border: '1px solid #334155'
              }}
            >
              Local Sidecar
            </button>
            <button
              type="button"
              disabled={loadingNode}
              onClick={() => refreshNodeStatus()}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: loadingNode ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #334155'
              }}
            >
              {loadingNode ? 'Comprobando...' : 'Comprobar PEP'}
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          Nodo: <strong className="saare-mono">{nodeStatus?.nodeId || '—'}</strong> · Tenant:{' '}
          <strong className="saare-mono">{tenantId || 'Sin asignar'}</strong> · Ruta:{' '}
          <strong className="saare-mono">{routeMode}</strong> · Modo:{' '}
          <strong className="saare-mono">{nodeStatus?.mode || 'FAIL-CLOSED'}</strong>
        </div>
      </section>

      {/* 2. Evaluador ex-ante */}
      <section style={sectionStyle}>
        <span style={labelStyle}>2. Evaluador ex-ante</span>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 180px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Directiva de referencia</span>
            <select
              value={selectedDirective}
              onChange={(e) => setSelectedDirective(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontSize: '0.78rem'
              }}
            >
              {PROTOCOL_DIRECTIVES.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 180px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Escenario de evaluación</span>
            <input
              type="text"
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontSize: '0.78rem'
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 160px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Referencia expediente / activo</span>
            <input
              type="text"
              value={activeDossierRef}
              onChange={(e) => updateDossierRef(e.target.value)}
              placeholder="Ej. 030926-1SAA"
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontSize: '0.78rem'
              }}
            />
          </label>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Consulta o instrucción a evaluar en el runtime
          </span>
          <textarea
            rows={3}
            value={promptInput}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Escribe aquí el prompt o instrucción para evaluar su cumplimiento ex-ante..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#020617',
              color: '#f8fafc',
              border: '1px solid #334155',
              fontSize: '0.8rem',
              resize: 'vertical'
            }}
          />
        </label>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={busyEval || !can(CONSOLE_ACTIONS.EVALUATE_SIMULATION)}
            onClick={() => handleEvaluate(true)}
            style={{
              padding: '9px 14px',
              borderRadius: '6px',
              background: '#111827',
              color: '#e2e8f0',
              border: '1px solid #38bdf8',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: busyEval ? 'wait' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {evaluatingMode === 'SIMULATION' ? 'Simulando...' : 'Evaluar en simulación'}
          </button>

          <button
            type="button"
            disabled={busyEval || !can(CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE)}
            onClick={() => handleEvaluate(false)}
            style={{
              padding: '9px 14px',
              borderRadius: '6px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: busyEval ? 'wait' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {evaluatingMode === 'LIVE' || isEvaluating ? 'Remitiendo...' : 'Evaluar y remitir'}
          </button>
        </div>

        {evaluationResult && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#020617',
              border: `1px solid ${
                evaluationResult.executionStatus === EXECUTION_STATUS.FAILED
                  ? '#ef4444'
                  : '#334155'
              }`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.76rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                Modo: <strong>{evaluationResult.simulation ? 'SIMULACIÓN' : 'REMISIÓN'}</strong> ·
                Veredicto: <strong className="saare-mono">{evaluationResult.verdict || '—'}</strong>
              </span>
              <span className="saare-mono" style={{ color: '#94a3b8' }}>
                [{evaluationResult.executionStatus}]
                {evaluationResult.traceId ? ` · trace: ${evaluationResult.traceId}` : ''}
              </span>
            </div>

            {evaluationResult.error && (
              <div style={{ color: '#fca5a5' }}>Detalle: {evaluationResult.error}</div>
            )}

            {evaluationResult.responseContent && (
              <div style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                {evaluationResult.responseContent}
              </div>
            )}
          </div>
        )}

        {testResult && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#020617',
              border: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.74rem',
              color: '#cbd5e1'
            }}
          >
            <div>
              Resultado L7: <strong className="saare-mono">{testResult.verdict}</strong> ({testResult.decision}) ·
              Latencia: <strong className="saare-mono">{testResult.latency}</strong>
            </div>
            <div>Salida sanitizada: {testResult.sanitizedPrompt}</div>
          </div>
        )}

        {typeof onExecuteProtocolCommand === 'function' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>
              Ejecución directa de comandos de protocolo
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {quickCommands.map((cmd) => {
                const enabled = protocolCommandsEnabled[cmd.code] !== false;
                const isRunning = runningProtocolCode === cmd.code;
                return (
                  <button
                    key={cmd.code}
                    type="button"
                    disabled={!enabled || Boolean(runningProtocolCode)}
                    onClick={() => onExecuteProtocolCommand(cmd)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: enabled ? '#0f172a' : '#111827',
                      color: enabled ? '#7dd3fc' : '#64748b',
                      border: `1px solid ${enabled ? '#0284c7' : '#334155'}`,
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: !enabled || runningProtocolCode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isRunning ? `Ejecutando ${cmd.code}...` : `${cmd.label} (${cmd.code})`}
                  </button>
                );
              })}
            </div>

            {protocolOutput && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
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
                  Comando: <strong className="saare-mono">{protocolOutput.code}</strong> · Decisión:{' '}
                  <strong className="saare-mono">{protocolOutput.decision}</strong> · Latencia:{' '}
                  <strong className="saare-mono">{protocolOutput.latency}</strong>
                </div>
                {protocolOutput.content && (
                  <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                    {protocolOutput.content}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Directivas y políticas */}
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
          <span style={labelStyle}>
            3. Directivas y políticas ({activeDirectivesCount}/{PROTOCOL_DIRECTIVES.length} activas)
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeof onSetAllProtocolCommands === 'function' && (
              <>
                <button
                  type="button"
                  disabled={policyBusy || !can(CONSOLE_ACTIONS.TOGGLE_DIRECTIVE)}
                  onClick={() => onSetAllProtocolCommands(true)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: '#0f172a',
                    color: '#7dd3fc',
                    border: '1px solid #334155'
                  }}
                >
                  Activar todas
                </button>
                <button
                  type="button"
                  disabled={policyBusy || !can(CONSOLE_ACTIONS.TOGGLE_DIRECTIVE)}
                  onClick={() => onSetAllProtocolCommands(false)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: '#0f172a',
                    color: '#94a3b8',
                    border: '1px solid #334155'
                  }}
                >
                  Desactivar todas
                </button>
              </>
            )}
            <button
              type="button"
              disabled={policyBusy || !can(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES)}
              onClick={handleToggleTenantRules}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '800',
                cursor: policyBusy ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                background: rulesEnabled ? 'rgba(6, 78, 59, 0.7)' : '#111827',
                color: rulesEnabled ? '#6ee7b7' : '#cbd5e1',
                border: `1px solid ${rulesEnabled ? '#10b981' : '#334155'}`
              }}
            >
              {rulesEnabled ? 'Reglas del tenant: ACTIVAS' : 'Reglas del tenant: INACTIVAS'}
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '10px'
          }}
        >
          {PROTOCOL_DIRECTIVES.map((dir) => {
            const active = Boolean(directiveStates[dir.code]);
            return (
              <div
                key={dir.code}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#020617',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{dir.name}</strong>
                    <span className="saare-mono" style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {dir.code}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Ámbito: {dir.scope}</div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {dir.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={policyBusy || !can(CONSOLE_ACTIONS.TOGGLE_DIRECTIVE)}
                  onClick={() => handleToggleDirective(dir.code)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    cursor: policyBusy ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap',
                    background: active ? 'rgba(6, 78, 59, 0.7)' : '#111827',
                    color: active ? '#6ee7b7' : '#94a3b8',
                    border: `1px solid ${active ? '#10b981' : '#334155'}`
                  }}
                >
                  {active ? 'ACTIVA' : 'INACTIVA'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Protección e incidentes (aislado del resto) */}
      <section
        aria-label="Protección e incidentes"
        style={{
          background: '#14070a',
          border: '1px solid #7f1d1d',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
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
          <span style={{ ...labelStyle, color: '#fca5a5' }}>
            4. Protección e incidentes · Kill-Switch L7
          </span>
          <span style={{ fontSize: '0.7rem', color: '#fecaca' }}>
            Operación de emergencia con registro de auditoría
          </span>
        </div>

        <form onSubmit={handleTriggerKillSwitch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.74rem', color: '#fecaca' }}>
              Motivo de auditoría para activar el Kill-Switch
            </span>
            <input
              type="text"
              value={killReason}
              onChange={(e) => setKillReason(e.target.value)}
              placeholder="Ej. Incidente de seguridad detectado en flujo L7..."
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #991b1b',
                fontSize: '0.78rem'
              }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#fecaca' }}>
            <input
              type="checkbox"
              checked={killConfirmed}
              onChange={(e) => setKillConfirmed(e.target.checked)}
            />
            Confirmo la ejecución de la orden de apagado de emergencia y su registro trazable.
          </label>

          <div>
            <button
              type="submit"
              disabled={killBusy || !can(CONSOLE_ACTIONS.TRIGGER_KILL_SWITCH)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#991b1b',
                color: '#ffffff',
                border: '1px solid #ef4444',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: killBusy ? 'wait' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {killBusy ? 'Ejecutando...' : 'Ejecutar Kill-Switch L7'}
            </button>
          </div>
        </form>

        {killStatusMsg && (
          <div
            className="saare-mono"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: '#020617',
              borderLeft: '3px solid #f87171',
              fontSize: '0.74rem',
              color: '#fecaca'
            }}
          >
            {killStatusMsg}
          </div>
        )}
      </section>
    </div>
  );
}