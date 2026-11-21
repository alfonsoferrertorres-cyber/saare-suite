import React, { useState, useEffect } from "react";

const ISO_42001_ANNEX_A_BASE = [
  // A.2 Políticas relacionadas con la IA
  { id: "A.2.2", block: "A.2 Políticas IA", title: "Política de IA", requirement: "Documentar y aprobar una política formal sobre el desarrollo o uso responsable de la IA.", defaultApplicable: true, evidenceHint: "Política SGIA aprobada + reglas activas en Control Plane (/custom-rules)", aiActRef: "Gobernanza y cumplimiento" },
  { id: "A.2.3", block: "A.2 Políticas IA", title: "Alineación con otras políticas organizacionales", requirement: "Asegurar que la política de IA encaja con seguridad de la información, privacidad y calidad.", defaultApplicable: true, evidenceHint: "Matriz RGPD/NIS2/ISO 27001 + preset ISO_42001 DLP", aiActRef: "Gestión de riesgos y datos" },
  { id: "A.2.4", block: "A.2 Políticas IA", title: "Revisión de la política de IA", requirement: "Revisar y actualizar la política en intervalos planificados o ante cambios relevantes.", defaultApplicable: true, evidenceHint: "Acta de revisión periódica + control de versiones", aiActRef: "Mantenimiento continuo" },

  // A.3 Organización interna
  { id: "A.3.2", block: "A.3 Organización interna", title: "Roles y responsabilidades de IA", requirement: "Asignar claramente quién responde por cada sistema, quién supervisa riesgos y quién aprueba su uso.", defaultApplicable: true, evidenceHint: "Matriz RACI + gestión de asientos (/executive/seats)", aiActRef: "Supervisión organizativa" },
  { id: "A.3.3", block: "A.3 Organización interna", title: "Reporte de preocupaciones", requirement: "Habilitar un canal interno para reportar fallos, sesgos o riesgos detectados en la IA.", defaultApplicable: true, evidenceHint: "Canal interno + registro de alarmas/webhooks S.A.A.R.E.", aiActRef: "Reporte y escalado" },

  // A.4 Recursos para sistemas de IA
  { id: "A.4.2", block: "A.4 Recursos IA", title: "Documentación de recursos", requirement: "Mantener un inventario detallado de todos los recursos necesarios para operar cada sistema de IA.", defaultApplicable: true, evidenceHint: "Inventario técnico del tenant y activos conectados", aiActRef: "Documentación técnica" },
  { id: "A.4.3", block: "A.4 Recursos IA", title: "Recursos de datos", requirement: "Documentar qué conjuntos de datos se utilizan y cómo se gestionan.", defaultApplicable: true, evidenceHint: "Flujos RAM Zero-Disk y políticas DLP por tenant", aiActRef: "Gobernanza de datos" },
  { id: "A.4.4", block: "A.4 Recursos IA", title: "Recursos de herramientas", requirement: "Listar librerías, algoritmos, plataformas y modelos de IA empleados.", defaultApplicable: true, evidenceHint: "Catálogo de proveedores LLM agnósticos en gateway L7", aiActRef: "Transparencia técnica" },
  { id: "A.4.5", block: "A.4 Recursos IA", title: "Recursos del sistema y computación", requirement: "Documentar la infraestructura técnica (servidores, nube, capacidad de cómputo).", defaultApplicable: true, evidenceHint: "Arquitectura Edge/D1/KV y estado /resilience/check", aiActRef: "Resiliencia y seguridad" },
  { id: "A.4.6", block: "A.4 Recursos IA", title: "Recursos humanos", requirement: "Definir perfiles, competencias y formación exigida a quienes desarrollan, usan o supervisan la IA.", defaultApplicable: true, evidenceHint: "Plan de formación IA + asignación de roles RBAC", aiActRef: "Competencia en supervisión" },

  // A.5 Evaluación de impactos
  { id: "A.5.2", block: "A.5 Evaluación de impactos", title: "Proceso de evaluación de impacto", requirement: "Establecer una metodología formal para evaluar consecuencias antes de poner en marcha la IA.", defaultApplicable: true, evidenceHint: "Metodología FRIA / evaluación ex-ante L7", aiActRef: "FRIA / Evaluación de derechos" },
  { id: "A.5.3", block: "A.5 Evaluación de impactos", title: "Documentación de evaluaciones de impacto", requirement: "Guardar por escrito los resultados de cada evaluación realizada.", defaultApplicable: true, evidenceHint: "Expedientes firmados + evidencias en bóveda D1", aiActRef: "Conservación documental" },
  { id: "A.5.4", block: "A.5 Evaluación de impactos", title: "Impacto en individuos o grupos", requirement: "Analizar si la IA puede afectar a derechos, privacidad, seguridad o discriminar.", defaultApplicable: true, evidenceHint: "EIPD/RGPD + detección/saneamiento PII en tránsito", aiActRef: "Protección derechos fundamentales" },
  { id: "A.5.5", block: "A.5 Evaluación de impactos", title: "Impactos sociales", requirement: "Evaluar efectos más amplios sobre la sociedad, el entorno laboral o el medio ambiente.", defaultApplicable: true, evidenceHint: "Evaluación de impacto organizativo y social", aiActRef: "Riesgos sociales/sistémicos" },

  // A.6 Ciclo de vida del sistema de IA
  { id: "A.6.1.2", block: "A.6 Ciclo de vida IA", title: "Objetivos para el desarrollo responsable", requirement: "Fijar metas medibles de seguridad, equidad y fiabilidad antes de diseñar o integrar una IA.", defaultApplicable: true, evidenceHint: "KPIs de bloqueo, latencia y delta estructural SGP 1.0", aiActRef: "Calidad y fiabilidad" },
  { id: "A.6.1.3", block: "A.6 Ciclo de vida IA", title: "Procesos para el diseño y desarrollo responsable", requirement: "Definir reglas y fases obligatorias para construir o configurar sistemas de IA.", defaultApplicable: true, evidenceHint: "SDLC seguro y pipeline de despliegue controlado", aiActRef: "Desarrollo conforme" },
  { id: "A.6.2.2", block: "A.6 Ciclo de vida IA", title: "Requisitos y especificación del sistema", requirement: "Documentar qué debe hacer exactamente el sistema de IA y bajo qué límites técnicos.", defaultApplicable: true, evidenceHint: "Especificación funcional SGP 1.0 y límites fail-closed", aiActRef: "Documentación técnica" },
  { id: "A.6.2.3", block: "A.6 Ciclo de vida IA", title: "Documentación del diseño y desarrollo", requirement: "Registrar las decisiones técnicas tomadas durante la arquitectura o configuración.", defaultApplicable: true, evidenceHint: "ADRs y control de versiones en repositorio", aiActRef: "Trazabilidad de diseño" },
  { id: "A.6.2.4", block: "A.6 Ciclo de vida IA", title: "Verificación y validación", requirement: "Probar el sistema antes de lanzarlo para comprobar que cumple requisitos y no genera errores graves.", defaultApplicable: true, evidenceHint: "Suite de pruebas de intercepción, DLP y CORS/salud", aiActRef: "Validación previa" },
  { id: "A.6.2.5", block: "A.6 Ciclo de vida IA", title: "Implementación (despliegue)", requirement: "Seguir un plan controlado para poner el sistema de IA en producción.", defaultApplicable: true, evidenceHint: "Despliegue maestro verificado + políticas GPO/Sidecar", aiActRef: "Gestión de versiones" },
  { id: "A.6.2.6", block: "A.6 Ciclo de vida IA", title: "Operación y monitoreo", requirement: "Vigilar continuamente el rendimiento del sistema en funcionamiento.", defaultApplicable: true, evidenceHint: "Telemetría SSE (/telemetry/stream) y /metrics/tenants", aiActRef: "Monitoreo post-comercialización" },
  { id: "A.6.2.7", block: "A.6 Ciclo de vida IA", title: "Documentación técnica del sistema", requirement: "Mantener un manual técnico actualizado con funcionamiento, capacidades y limitaciones.", defaultApplicable: true, evidenceHint: "Manual técnico operativo y ficha de sistema", aiActRef: "Documentación técnica Art. 11" },
  { id: "A.6.2.8", block: "A.6 Ciclo de vida IA", title: "Registro de eventos (Logs)", requirement: "Configurar el registro automático de actividad técnica para garantizar trazabilidad.", defaultApplicable: true, evidenceHint: "Trazas WORM encadenadas SHA-256 (/traces) y proofBundle", aiActRef: "Registro de logs Art. 12" },

  // A.7 Datos para sistemas de IA
  { id: "A.7.2", block: "A.7 Datos IA", title: "Datos para el desarrollo y mejora", requirement: "Definir qué datos están permitidos y cuáles prohibidos para entrenar, ajustar o alimentar la IA.", defaultApplicable: true, evidenceHint: "Política de datos prohibidos + reglas bloqueo/sanitización", aiActRef: "Gobernanza de datos" },
  { id: "A.7.3", block: "A.7 Datos IA", title: "Adquisición de datos", requirement: "Documentar fuentes de obtención de datos, licencias y base legal.", defaultApplicable: false, evidenceHint: "Excluido si el tenant no entrena modelos propios (solo inferencia)", aiActRef: "Procedencia y licitud" },
  { id: "A.7.4", block: "A.7 Datos IA", title: "Calidad de los datos", requirement: "Establecer criterios para verificar exactitud, completitud y ausencia de sesgos graves.", defaultApplicable: false, evidenceHint: "Excluido si no hay entrenamiento propio; activar si se usan datasets propios", aiActRef: "Calidad de datasets" },
  { id: "A.7.5", block: "A.7 Datos IA", title: "Procedencia de los datos (Linaje)", requirement: "Mantener trazabilidad sobre el origen y transformaciones de los datos.", defaultApplicable: true, evidenceHint: "Trazabilidad de hashes entrada/sanitizado en gateway L7", aiActRef: "Trazabilidad de transformaciones" },
  { id: "A.7.6", block: "A.7 Datos IA", title: "Preparación de datos", requirement: "Documentar los métodos empleados para limpiar, etiquetar o estructurar datos antes de la IA.", defaultApplicable: true, evidenceHint: "SemanticDetoxEngine + enmascarado PII en RAM", aiActRef: "Preprocesamiento y saneamiento" },

  // A.8 Información para partes interesadas
  { id: "A.8.2", block: "A.8 Partes interesadas", title: "Documentación del sistema e información para usuarios", requirement: "Informar claramente a los usuarios de que interactúan con una IA, cómo usarla y sus limitaciones.", defaultApplicable: true, evidenceHint: "Avisos de transparencia en interfaz y guía de uso", aiActRef: "Transparencia Art. 50" },
  { id: "A.8.3", block: "A.8 Partes interesadas", title: "Informe externo", requirement: "Habilitar un canal para que terceros externos reporten impactos adversos o fallos.", defaultApplicable: true, evidenceHint: "Canal público de soporte/incidencias y registro", aiActRef: "Reclamaciones y reportes" },
  { id: "A.8.4", block: "A.8 Partes interesadas", title: "Comunicación de incidentes", requirement: "Tener un plan definido para notificar rápidamente incidentes graves.", defaultApplicable: true, evidenceHint: "Plan de respuesta + alertas automáticas CPaaS/Webhook", aiActRef: "Notificación incidentes graves" },
  { id: "A.8.5", block: "A.8 Partes interesadas", title: "Información para otras partes interesadas", requirement: "Determinar qué información técnica o de riesgos se entrega a reguladores, auditores o socios.", defaultApplicable: true, evidenceHint: "Exportación de evidencias y endpoint /verify/:hash", aiActRef: "Cooperación con autoridades" },

  // A.9 Uso de sistemas de IA
  { id: "A.9.2", block: "A.9 Uso de sistemas IA", title: "Procesos para el uso responsable", requirement: "Definir procedimientos operativos sobre cómo interactuar con la IA (incluida supervisión humana).", defaultApplicable: true, evidenceHint: "SOP operativo + decisión humana SANITIZE_AND_SEND / BLOCK", aiActRef: "Supervisión humana Art. 14" },
  { id: "A.9.3", block: "A.9 Uso de sistemas IA", title: "Objetivos para el uso responsable", requirement: "Establecer criterios claros que guíen el uso ético y seguro de las herramientas de IA.", defaultApplicable: true, evidenceHint: "Directrices corporativas de uso aceptable por tenant", aiActRef: "Uso responsable" },
  { id: "A.9.4", block: "A.9 Uso de sistemas IA", title: "Uso previsto del sistema", requirement: "Garantizar que la IA solo se usa para la finalidad diseñada, bloqueando usos no autorizados.", defaultApplicable: true, evidenceHint: "PEP L7 BLOCK LOGIC, políticas por tenant y Kill-Switch", aiActRef: "Finalidad prevista" },

  // A.10 Relaciones con terceros y clientes
  { id: "A.10.2", block: "A.10 Terceros y clientes", title: "Asignación de responsabilidades", requirement: "Repartir por contrato qué obligaciones asume la empresa y cuáles el proveedor o cliente.", defaultApplicable: true, evidenceHint: "Contratos, SLA y DPA firmados", aiActRef: "Cadena de valor Art. 25" },
  { id: "A.10.3", block: "A.10 Terceros y clientes", title: "Proveedores", requirement: "Evaluar y exigir garantías a proveedores de modelos/IA (no entrenamiento con datos, seguridad).", defaultApplicable: true, evidenceHint: "Homologación de proveedores LLM/Cloud + cláusulas zero-retention", aiActRef: "Obligaciones con proveedores" },
  { id: "A.10.4", block: "A.10 Terceros y clientes", title: "Clientes", requirement: "Asegurar que los clientes reciben información y soporte para usar la IA de forma segura.", defaultApplicable: true, evidenceHint: "Documentación de despliegue cliente (GPO, extensión, sidecar)", aiActRef: "Información a desplegadores" }
];

function buildInitialControls(roleType = "INTEGRADOR_DESARROLLADOR") {
  return ISO_42001_ANNEX_A_BASE.map(item => {
    const isUserOnly = roleType === "SOLO_USUARIO_TERCEROS";
    const autoExcludeUserOnly = ["A.6.1.2", "A.6.1.3", "A.6.2.3", "A.7.3", "A.7.4"].includes(item.id);
    const applicable = isUserOnly ? !autoExcludeUserOnly : item.defaultApplicable;
    return {
      id: item.id,
      block: item.block,
      title: item.title,
      requirement: item.requirement,
      aiActRef: item.aiActRef,
      applicable,
      justification: applicable
        ? "Control aplicable al alcance operativo del tenant bajo gobernanza S.A.A.R.E. / SGP 1.0."
        : "Excluido del alcance actual: el tenant no entrena ni desarrolla modelos fundacionales propios.",
      evidence: item.evidenceHint,
      owner: "CISO / Responsable IA"
    };
  });
}

export default function SoaIso42001CompilerButton({
  apiBaseUrl = "https://api.saare.es",
  tenantId = "",
  authToken = "",
  userEmail = "",
  onCompiled = null
}) {
  const effectiveTenant = String(tenantId || "").trim() || "DEMO_ENTERPRISE";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [roleType, setRoleType] = useState("INTEGRADOR_DESARROLLADOR");
  const [aiActScope, setAiActScope] = useState("ALTO_RIESGO_Y_TRANSPARENCIA");
  const [organizationName, setOrganizationName] = useState(effectiveTenant);
  const [approverEmail, setApproverEmail] = useState(userEmail || "");
  const [controls, setControls] = useState(() => buildInitialControls("INTEGRADOR_DESARROLLADOR"));
  const [compiledMeta, setCompiledMeta] = useState(null);
  const [filterBlock, setFilterBlock] = useState("ALL");

  const headers = {
    "Content-Type": "application/json",
    "x-saare-tenant": effectiveTenant,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(userEmail ? { "x-saare-user": userEmail } : {})
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setStatusMessage("");
    fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/soa/iso42001?tenant=${encodeURIComponent(effectiveTenant)}`, {
      method: "GET",
      headers
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data?.soa && Array.isArray(data.soa.controls) && data.soa.controls.length > 0) {
          setRoleType(data.soa.roleType || "INTEGRADOR_DESARROLLADOR");
          setAiActScope(data.soa.aiActScope || "ALTO_RIESGO_Y_TRANSPARENCIA");
          setOrganizationName(data.soa.organizationName || effectiveTenant);
          setApproverEmail(data.soa.approverEmail || userEmail || "");
          setControls(data.soa.controls);
          setCompiledMeta({
            hash: data.soa.compiledHash,
            updatedAt: data.soa.updatedAt
          });
        } else {
          setOrganizationName(effectiveTenant);
          setApproverEmail(userEmail || "");
          setControls(buildInitialControls("INTEGRADOR_DESARROLLADOR"));
          setCompiledMeta(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatusMessage("No se pudo leer SoA remota; usando plantilla base local.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, effectiveTenant, authToken, userEmail, apiBaseUrl]);

  const handleRolePresetChange = (nextRole) => {
    setRoleType(nextRole);
    setControls(buildInitialControls(nextRole));
  };

  const updateControlField = (id, field, value) => {
    setControls(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleCompileAndSave = async () => {
    setCompiling(true);
    setStatusMessage("");
    try {
      const res = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/soa/iso42001`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          tenant: effectiveTenant,
          roleType,
          aiActScope,
          organizationName,
          approverEmail,
          controls
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }
      if (data?.compiledHash) {
        const updatedAt = data.updatedAt || new Date().toISOString();
        setCompiledMeta({
          hash: data.compiledHash,
          updatedAt
        });
        setStatusMessage("SoA compilada y guardada correctamente.");
        if (typeof onCompiled === "function") {
          onCompiled(data.compiledHash);
        }
      }
    } catch (err) {
      setStatusMessage(err?.message || "Error al compilar la SoA.");
    } finally {
      setCompiling(false);
    }
  };

  const handleExportHtmlReport = () => {
    const applicableCount = controls.filter(c => c.applicable).length;
    const excludedCount = controls.length - applicableCount;
    const rowsHtml = controls.map(c => `
      <tr>
        <td><strong>${c.id}</strong><br/><small>${c.block}</small></td>
        <td><strong>${c.title}</strong><br/><small>${c.requirement}</small></td>
        <td style="text-align:center;font-weight:bold;color:${c.applicable ? "#065f46" : "#991b1b"}">${c.applicable ? "APLICA" : "NO APLICA"}</td>
        <td>${c.justification || ""}</td>
        <td>${c.evidence || ""}</td>
        <td>${c.aiActRef || ""}</td>
        <td>${c.owner || ""}</td>
      </tr>
    `).join("");

    const docHtml = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>SoA ISO/IEC 42001:2023 - ${organizationName || effectiveTenant}</title>
<style>
  body { font-family: Arial, sans-serif; color: #111827; margin: 28px; font-size: 12px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .meta { background: #f3f4f6; padding: 12px; border-radius: 6px; margin-bottom: 16px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #d1d5db; padding: 7px; vertical-align: top; text-align: left; }
  th { background: #111827; color: #ffffff; }
</style>
</head>
<body>
  <h1>DECLARACIÓN DE APLICABILIDAD (SoA) — ISO/IEC 42001:2023</h1>
  <div class="meta">
    <strong>Organización / Tenant:</strong> ${organizationName || effectiveTenant} (${effectiveTenant})<br/>
    <strong>Perfil Operativo:</strong> ${roleType} | <strong>Alcance EU AI Act:</strong> ${aiActScope}<br/>
    <strong>Aprobador / Responsable:</strong> ${approverEmail || "No especificado"}<br/>
    <strong>Resumen Anexo A (38 controles):</strong> ${applicableCount} Aplican / ${excludedCount} Excluidos<br/>
    <strong>Sello Integridad SHA-256 (S.A.A.R.E. Control Plane):</strong> <code>${compiledMeta?.hash || "PENDIENTE_DE_COMPILAR"}</code><br/>
    <strong>Fecha de compilación:</strong> ${compiledMeta?.updatedAt || new Date().toISOString()}
  </div>
  <table>
    <thead>
      <tr>
        <th>Control</th>
        <th>Objetivo / Requisito</th>
        <th>Estado</th>
        <th>Justificación</th>
        <th>Evidencia SGIA / S.A.A.R.E.</th>
        <th>Cruce EU AI Act</th>
        <th>Responsable</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([docHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SoA_ISO42001_${effectiveTenant}_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const blocks = ["ALL", ...new Set(ISO_42001_ANNEX_A_BASE.map(b => b.block))];
  const visibleControls = filterBlock === "ALL" ? controls : controls.filter(c => c.block === filterBlock);
  const applicableTotal = controls.filter(c => c.applicable).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "7px 12px",
          borderRadius: "6px",
          border: "1px solid #10b981",
          background: "#064e3b",
          color: "#a7f3d0",
          fontWeight: "800",
          fontSize: "0.75rem",
          cursor: "pointer"
        }}
      >
        SOA ISO 42001 ({effectiveTenant})
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #334155",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "1180px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Cabecera */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "17px" }}>
                  Compilador Declaración de Aplicabilidad (SoA) — ISO/IEC 42001:2023
                </h2>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Tenant activo: <strong>{effectiveTenant}</strong> · {applicableTotal} de {controls.length} controles marcados como APLICA
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: "transparent", border: "1px solid #475569", color: "#cbd5e1", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>

            {/* Configuración del Tenant */}
            <div style={{ padding: "12px 20px", background: "#1e293b", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px", fontSize: "12px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>Organización / Razón Social</span>
                <input
                  value={organizationName}
                  onChange={e => setOrganizationName(e.target.value)}
                  style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #475569", background: "#0f172a", color: "#fff" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>Perfil Operativo IA (Plantilla base)</span>
                <select
                  value={roleType}
                  onChange={e => handleRolePresetChange(e.target.value)}
                  style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #475569", background: "#0f172a", color: "#fff" }}
                >
                  <option value="INTEGRADOR_DESARROLLADOR">Integrador / Desarrollador IA (36 aplican)</option>
                  <option value="SOLO_USUARIO_TERCEROS">Solo Usuario herramientas IA terceros (33 aplican)</option>
                  <option value="PROVEEDOR_MODELOS_COMPLETO">Proveedor / Entrenamiento propio (38 aplican)</option>
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>Cruce EU AI Act</span>
                <select
                  value={aiActScope}
                  onChange={e => setAiActScope(e.target.value)}
                  style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #475569", background: "#0f172a", color: "#fff" }}
                >
                  <option value="ALTO_RIESGO_Y_TRANSPARENCIA">Alto Riesgo + Transparencia (Art. 9-15 y 50)</option>
                  <option value="RIESGO_LIMITADO_TRANSPARENCIA">Riesgo Limitado / Transparencia (Art. 50)</option>
                  <option value="USO_INTERNO_BAJO_RIESGO">Uso Interno / Gobernanza Voluntaria</option>
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>Responsable / Aprobador</span>
                <input
                  value={approverEmail}
                  onChange={e => setApproverEmail(e.target.value)}
                  placeholder="ciso@empresa.com"
                  style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #475569", background: "#0f172a", color: "#fff" }}
                />
              </label>
            </div>

            {/* Filtro de bloques */}
            <div style={{ padding: "8px 20px", borderBottom: "1px solid #1e293b", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {blocks.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFilterBlock(b)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "1px solid #334155",
                    background: filterBlock === b ? "#2563eb" : "#0f172a",
                    color: "#f8fafc",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  {b === "ALL" ? "Todos (38)" : b}
                </button>
              ))}
            </div>

            {/* Tabla editable */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
              {loading ? (
                <p style={{ color: "#94a3b8" }}>Cargando SoA del tenant {effectiveTenant}...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #334155", textAlign: "left", color: "#94a3b8" }}>
                      <th style={{ padding: "8px", width: "90px" }}>Control</th>
                      <th style={{ padding: "8px", width: "240px" }}>Requisito Anexo A</th>
                      <th style={{ padding: "8px", width: "95px" }}>Aplica</th>
                      <th style={{ padding: "8px" }}>Justificación de aplicabilidad / exclusión</th>
                      <th style={{ padding: "8px" }}>Evidencia SGIA / S.A.A.R.E.</th>
                      <th style={{ padding: "8px", width: "140px" }}>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleControls.map(ctrl => (
                      <tr key={ctrl.id} style={{ borderBottom: "1px solid #1e293b" }}>
                        <td style={{ padding: "8px", verticalAlign: "top" }}>
                          <strong>{ctrl.id}</strong>
                          <div style={{ fontSize: "10px", color: "#38bdf8" }}>{ctrl.aiActRef}</div>
                        </td>
                        <td style={{ padding: "8px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 600 }}>{ctrl.title}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{ctrl.requirement}</div>
                        </td>
                        <td style={{ padding: "8px", verticalAlign: "top" }}>
                          <select
                            value={ctrl.applicable ? "YES" : "NO"}
                            onChange={e => updateControlField(ctrl.id, "applicable", e.target.value === "YES")}
                            style={{
                              padding: "4px 6px",
                              borderRadius: "6px",
                              border: "1px solid #475569",
                              background: ctrl.applicable ? "#065f46" : "#7f1d1d",
                              color: "#fff",
                              fontWeight: 600
                            }}
                          >
                            <option value="YES">Aplica</option>
                            <option value="NO">No aplica</option>
                          </select>
                        </td>
                        <td style={{ padding: "8px", verticalAlign: "top" }}>
                          <textarea
                            rows={2}
                            value={ctrl.justification}
                            onChange={e => updateControlField(ctrl.id, "justification", e.target.value)}
                            style={{ width: "100%", padding: "5px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "#f8fafc", fontSize: "11px" }}
                          />
                        </td>
                        <td style={{ padding: "8px", verticalAlign: "top" }}>
                          <textarea
                            rows={2}
                            value={ctrl.evidence}
                            onChange={e => updateControlField(ctrl.id, "evidence", e.target.value)}
                            style={{ width: "100%", padding: "5px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "#f8fafc", fontSize: "11px" }}
                          />
                        </td>
                        <td style={{ padding: "8px", verticalAlign: "top" }}>
                          <input
                            value={ctrl.owner}
                            onChange={e => updateControlField(ctrl.id, "owner", e.target.value)}
                            style={{ width: "100%", padding: "5px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "#f8fafc", fontSize: "11px" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pie con compilación y descarga */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                {statusMessage && <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "2px" }}>{statusMessage}</div>}
                {compiledMeta?.hash ? (
                  <>
                    Sello SHA-256 compilado: <code style={{ color: "#34d399" }}>{compiledMeta.hash.slice(0, 24)}...</code> ({compiledMeta.updatedAt})
                  </>
                ) : (
                  "Pulsa 'Guardar y Compilar SoA' para sellar en D1 con hash SHA-256 por tenant."
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleExportHtmlReport}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    background: "#1e293b",
                    color: "#f8fafc",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Descargar Documento SoA (.HTML / PDF)
                </button>
                <button
                  type="button"
                  disabled={compiling}
                  onClick={handleCompileAndSave}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#10b981",
                    color: "#022c22",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  {compiling ? "Compilando..." : "Guardar y Compilar SoA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}