import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { saareFetch } from "./utils/api";
import Login from "./Login";

/* ==========================================================================
   CONSTANTES GLOBALES, REGISTROS CRIPTOGRÁFICOS Y CONFIGURACIÓN SGP 1.0
   ========================================================================== */
const DEMO_ROOT_MERKLE_HASH =
  "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";

const CONTACT_EMAIL = "legal@saare.es";
const CONTACT_PHONE = "+34 633 886 506";
const WHATSAPP_URL =
  "https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE%20SGP%201.0";

const HERO_VIDEO_SRC = "/hero.mp4";

/* --------------------------------------------------------------------------
   NAVEGACIÓN · 4 FAMILIAS DE PRODUCTO
   -------------------------------------------------------------------------- */
const NAV = [
  {
    id: "producto",
    label: "PRODUCTO",
    description: "Consolas de cumplimiento",
    path: "/producto",
    children: [
      { id: "audit", label: "Auditoría pública", path: "/producto/auditoria" },
      { id: "executive", label: "EXECUTIVE", path: "/producto/executive" },
      { id: "grc", label: "GRC_AUDIT", path: "/producto/grc" },
      { id: "cyber", label: "CYBER_RESILIENCE", path: "/producto/cyber" },
    ],
  },
  { id: "forense", label: "FORENSE", description: "Evidence Vault", path: "/forense", children: [] },
  {
    id: "dev",
    label: "DESARROLLADORES",
    description: "SDK · Proxy · Daemon",
    path: "/dev",
    children: [
      { id: "sdk", label: "SDK nativo", path: "/dev/sdk" },
      { id: "proxy", label: "Proxy (PerimeterShield)", path: "/dev/proxy" },
      { id: "daemon", label: "Daemon (On-Premise)", path: "/dev/daemon" },
    ],
  },
  { id: "canal", label: "CANAL", description: "Partners y Kit Consulting", path: "/canal", children: [] },
];

const DIMENSIONS = [
  ["DIM 01", "IDENTIDAD", "Quién solicita la acción. Verificación asimétrica de firmas Ed25519 del agente o token JWT del sistema originador."],
  ["DIM 02", "ACCIÓN", "Qué quiere ejecutar. Inspección L7 de comandos (READ, MUTATE_DATABASE, SEND_PAYMENT, DELETE, EXECUTE_CODE)."],
  ["DIM 03", "CONTEXTO", "En qué contexto ocurre. Evaluación de la variable temporal, IP de origen, geolocalización y nivel de aislamiento de la sesión."],
  ["DIM 04", "RECURSO", "Sobre qué recurso. Validación del URI objetivo, tabla de base de datos, servicio financiero o endpoint API receptor."],
  ["DIM 05", "DATOS", "Qué datos intervienen. Inspección y sanitización in-RAM k-Anonymity para PII (DNI, NIF), PHI (Salud) e IBANs en tránsito."],
  ["DIM 06", "RIESGO", "Qué nivel de riesgo presenta. Scoring determinista basado en impacto económico, destructividad operativa y vector de ataque."],
  ["DIM 07", "POLÍTICA", "Qué regla aplica. Verificación contra el motor de políticas firmado localmente y compilado a código nativo."],
];

/* ==========================================================================
   CATÁLOGO COMERCIAL · seis tramos con página de detalle propia.
   ========================================================================== */
const CATALOGO = [
  {
    id: "nodo-base",
    path: "/licencias/nodo-base",
    grupo: "NODOS",
    etiqueta: "NODO BASE",
    nombre: "Nodo Base PEP L7",
    claim: "Contención determinista sin custodia de evidencias.",
    precio: "149 €",
    sufijo: "/mes",
    unidad: "Por nodo desplegado",
    comprador: "Quien despliega agentes propios",
    descripcion:
      "El motor de contención en memoria volátil, con intercepción L7 síncrona y veredicto binario. No incluye custodia persistente de evidencias: es la puerta de entrada a la plataforma.",
    features: [
      "Motor de decisión en RAM (<1,16 ms)",
      "Intercepción L7 síncrona",
      "Veredictos ALLOW / REVIEW / DENY",
      "Evaluación de las 7 dimensiones de control",
      "Modo Fail-Closed configurable",
      "Sin custodia persistente de evidencias",
    ],
    noIncluye: ["Sellado continuo de evidencias", "Dossier judicial exportable", "Consola de cumplimiento"],
    ideal: ["Pymes que despliegan sus primeros agentes", "Equipos que solo necesitan el bloqueo", "Pruebas de concepto antes de escalar"],
    cta: "ACTIVAR NODO BASE ↗",
    featured: false,
  },
  {
    id: "nodo-custodia",
    path: "/licencias/nodo-custodia",
    grupo: "NODOS",
    etiqueta: "NODO CON CUSTODIA",
    nombre: "Nodo con Custodia Forense",
    claim: "Control continuo con prueba exportable.",
    precio: "290 €",
    sufijo: "/mes",
    unidad: "Por nodo con sellado continuo",
    comprador: "Quien responde ante auditoría periódica",
    descripcion:
      "Todo lo del nodo base, más el sellado continuo con firma Ed25519, la estructuración en árbol de Merkle y el acceso al dossier exportable. Es el tramo que convierte un control en una prueba.",
    features: [
      "Todo lo incluido en el Nodo Base PEP L7",
      "Sellado continuo con firma Ed25519",
      "Estructuración en árbol de Merkle",
      "Marcado de tiempo eIDAS RFC 3161",
      "Dossier judicial exportable (Art. 326 LEC)",
      "Consola de cumplimiento con las tres superficies RBAC",
    ],
    noIncluye: ["HSM corporativo dedicado", "SLA del 99,99 %", "Despliegue air-gapped"],
    ideal: ["CISO y DPO con auditoría periódica", "Banca y seguros de tamaño medio", "Organizaciones que deben probar cumplimiento"],
    cta: "ACTIVAR NODO CON CUSTODIA ↗",
    featured: true,
  },
  {
    id: "nodo-enterprise",
    path: "/licencias/nodo-enterprise",
    grupo: "NODOS",
    etiqueta: "ENTERPRISE",
    nombre: "Nodo Soberano Enterprise",
    claim: "Despliegue aislado con contrato marco y SLA.",
    precio: "3.500 €",
    sufijo: "/mes",
    unidad: "Por nodo con HSM y SLA",
    comprador: "Sector regulado, banca, defensa y público",
    descripcion:
      "Despliegue perimetral aislado para infraestructuras críticas. El nodo vive dentro de su VPC o en arquitectura air-gapped, con claves gestionadas por el cliente y soporte de Nivel 3.",
    features: [
      "Despliegue en VPC privada o Air-Gapped",
      "Integración con HSM corporativo (PKCS#11)",
      "Claves de cifrado gestionadas por el cliente",
      "SLA garantizado del 99,99 % de disponibilidad",
      "Soporte técnico dedicado 24/7 de Nivel 3",
      "Despliegue en clústeres de Kubernetes / Helm",
    ],
    noIncluye: [],
    ideal: ["Infraestructuras críticas y defensa", "Administraciones públicas", "Entidades bajo contrato marco"],
    cta: "SOLICITAR PROPUESTA ENTERPRISE ↗",
    featured: false,
  },
  {
    id: "evidencias",
    path: "/licencias/evidencias",
    grupo: "MEDICIÓN",
    etiqueta: "EVIDENCIAS",
    nombre: "Paquete de Sellado eIDAS",
    claim: "Consumo medido en veredictos sellados.",
    precio: "120 €",
    sufijo: "/mes · 1.000 sellos",
    unidad: "Por paquete de 1.000 sellos",
    comprador: "Volumen alto de veredictos sellados",
    descripcion:
      "El consumo puro del motor: se paga proporcionalmente al uso real. Cada sello es un veredicto con marca de tiempo cualificada RFC 3161, utilizable como evidencia.",
    features: [
      "1.000 sellos cualificados al mes",
      "Exceso facturado por sello adicional",
      "Descuento por volumen superior a un millón",
      "Aplicable a cualquier nodo desplegado",
    ],
    noIncluye: [],
    ideal: ["Operación con miles de veredictos diarios", "Nodos con custodia ya contratada", "Escalado sin cambiar de tramo"],
    cta: "CONTRATAR PAQUETE DE SELLOS ↗",
    featured: false,
  },
  {
    id: "forense",
    path: "/licencias/forense",
    grupo: "PERICIAL",
    etiqueta: "FORENSE",
    nombre: "Licencia Estación Pericial",
    claim: "Verificación independiente, cobrada por caso.",
    precio: "1.200 €",
    sufijo: "/año + 300 €/dossier",
    unidad: "Licencia anual más emisión",
    comprador: "Peritos, despachos y asesoría jurídica",
    descripcion:
      "El instrumento del perito. Bóveda ciega, validador Ed25519 contra la clave pública del nodo y exportación del dossier conforme al artículo 326 de la LEC. Se cobra por caso porque el peritaje se cobra por caso.",
    features: [
      "Verificación independiente sin confiar en el vendedor",
      "Exportación de dossiers con sello RFC 3161",
      "Acceso a la bóveda ciega y al validador Ed25519",
      "Dossier de muestra descargable sin registro",
      "Soporte técnico para la ratificación en sala",
    ],
    noIncluye: [],
    ideal: ["Peritos ciberinformáticos", "Despachos de litigio tecnológico", "Departamentos de fraude y arbitraje"],
    cta: "SOLICITAR ACCESO PERICIAL ↗",
    featured: false,
  },
  {
    id: "canal",
    path: "/licencias/canal",
    grupo: "DISTRIBUCIÓN",
    etiqueta: "CANAL",
    nombre: "Programa Partner Multi-Tenant",
    claim: "Venda gobernanza de IA sin construirla.",
    precio: "Desde 450 €",
    sufijo: "/cliente/año",
    unidad: "Por cliente gestionado",
    comprador: "Consultoras, MSP y agentes digitalizadores",
    descripcion:
      "Licenciamiento marca blanca para quien audita a otros. Cada cliente gestionado con su política, su clave y su cadena de prueba independiente, más la documentación justificativa de las ayudas públicas.",
    features: [
      "Portal multi-tenant con clientes ilimitados",
      "Configuración de políticas por cliente",
      "Documentación justificativa de ayudas generada automáticamente",
      "Soporte técnico para su propio equipo",
      "Tres entregables homologados para el Kit Consulting",
    ],
    noIncluye: [],
    ideal: ["Agentes digitalizadores del Kit Consulting", "Consultoras de cumplimiento normativo", "Integradores con cartera pyme"],
    cta: "SOLICITAR KIT DE PARTNER ↗",
    featured: false,
  },
];

/* ==========================================================================
   CONTENIDO DE LAS TRES VISTAS DE CONSOLA
   Cada vista tiene su propia matriz regulatoria, su propio inventario de
   nodos, su propia superficie operativa y su propio tramo recomendado. No
   comparten cuerpo: comparten motor, que es distinto.
   ========================================================================== */
const VISTAS_CONSOLA = {
  executive: {
    id: "executive",
    badge: "VISTA EXECUTIVE",
    titular: "Gobernanza cuantitativa y blindaje de responsabilidad",
    pageTitle: "Cuánta responsabilidad está asumiendo su automatización",
    pageDesc:
      "Cuadro de mando de nivel C: riesgo operativo acumulado, consumo por área, continuidad de negocio y exposición legal derivada de cada agente autónomo en producción. Convierte el gobierno de IA en una cifra que el consejo puede leer.",
    owner: "CEO · Junta directiva · Dirección jurídica",
    rol: "BOARD_EXECUTIVE_LEVEL_1",
    metricas: [
      ["RIESGO ACUMULADO EX-ANTE", "0,02 %"],
      ["TOKENS INTERCEPTADOS / MES", "142.800 €"],
      ["AGENTES EN PRODUCCIÓN", "37 trazados"],
      ["EXPOSICIÓN BAJO DORA", "MITIGADA"],
    ],
    seccionMatriz: "OBLIGACIÓN DE CONSEJO",
    tituloMatriz: "Qué obligación cubre y qué puede demostrar",
    leadMatriz: "Cada fila es una obligación que recae sobre la dirección, el control que la atiende y el documento que puede entregar ante un consejo, una aseguradora o un inversor.",
    matriz: [
      ["EU AI Act art. 14", "Supervisión humana efectiva", "Cambio de política en vivo sin reiniciar sistemas", "Registro de cambio de política firmado"],
      ["EU AI Act art. 15", "Precisión y robustez del sistema", "Contención fail-closed y tolerancia estructural", "Veredicto firmado con su latencia"],
      ["DORA art. 5", "Gobernanza y responsabilidad de la dirección", "Políticas locales firmadas sin dependencia de red", "Certificado de autonomía de nodo"],
      ["DORA art. 9", "Protección y prevención de incidentes TIC", "Intercepción ex-ante contra vectores L7", "Registro de intercepción sellado"],
      ["NIS 2 art. 20", "Responsabilidad de la alta dirección", "Telemetría determinista sin contenido ni PII", "Contadores anónimos firmados"],
    ],
    seccionInventario: "PARQUE AUTORIZADO",
    tituloInventario: "Qué agentes están bajo control hoy",
    leadInventario: "El consejo no necesita ver la infraestructura: necesita saber cuántos agentes operan, bajo qué política y con qué resultado. Cada nodo es una unidad de riesgo trazada.",
    inventario: [
      ["agent-treasury-01", "Autónomo financiero", "Core bancario", "scope: pagos", "ALLOW"],
      ["agent-fraud-scoring-02", "Autónomo de riesgo", "VPC privada", "scope: scoring", "REVIEW"],
      ["agent-reporting-cfo", "Asistente de dirección", "App interna", "scope: reporting", "ALLOW"],
    ],
    superficieSeccion: "CUADRO DE MANDO",
    superficieTitulo: "Consolidado de nivel C",
    superficie: [
      ["PERIODO", "Últimos 30 días"],
      ["AHORRO POR COMPRESIÓN", "Context Slicing activo"],
      ["CERTIFICADO CORPORATIVO", "Exportable en 1 clic"],
      ["GASTO POR DEPARTAMENTO", "Trazado por tipo de modelo"],
      ["CONTINUIDAD DE NEGOCIO", "Sin interrupción registrada"],
    ],
    tramoRecomendado: "nodo-custodia",
    tramoCta: "ACTIVAR NODO CON CUSTODIA ↗",
  },

  grc: {
    id: "grc",
    badge: "VISTA GRC_AUDIT",
    titular: "La prueba llegó antes que el litigio",
    pageTitle: "La prueba llegó antes que el litigio",
    pageDesc:
      "Matriz de trazabilidad normativa contra el EU AI Act, DORA, NIS 2, RGPD e ISO/IEC 27037, con exportación de Proof Bundles firmados y sellados con marca de tiempo cualificada. El expediente no se redacta cuando llega la inspección: se genera mientras el sistema opera.",
    owner: "CISO · DPO · Auditoría externa",
    rol: "DPO_GRC_LEVEL_2",
    metricas: [
      ["ENMASCARAMIENTO PII", "DNI · IBAN · Tarjetas · PHI"],
      ["CLASIFICACIÓN AI ACT", "Inaceptable · Alto · Limitado"],
      ["RGPD ART. 32", "Arquitectura Zero-Disk"],
      ["REGISTRO EIPD", "Inmutable y firmado"],
    ],
    seccionMatriz: "TRAZABILIDAD NORMATIVA",
    tituloMatriz: "Matriz de requisito a veredicto",
    leadMatriz: "De la norma al veredicto, sin traducción manual. Cada fila mapea una obligación a un control ejecutable, a una política concreta y a la evidencia que queda firmada.",
    matriz: [
      ["EU AI Act art. 10", "Gobernanza de datos de contexto", "Generalización y seudonimización ex-ante", "Registro de política de datos aplicada"],
      ["EU AI Act art. 12", "Registro automático de eventos", "Registro en memoria sin violar minimización", "Huella criptográfica del veredicto"],
      ["RGPD art. 5", "Minimización de datos personales", "Zeroización tras la firma, sin persistencia", "Digest HMAC-SHA256 del payload"],
      ["RGPD art. 32", "Seguridad y cifrado del tratamiento", "Sanitización en RAM y arquitectura Zero-Disk", "Registro de no exfiltración"],
      ["ISO/IEC 27037", "Identificación de evidencia digital", "Cadena de Merkle y firma asimétrica", "Dossier forense verificable offline"],
      ["Arts. 281 y 326 LEC", "Prueba documental preconstituida", "Sellado cualificado y cadena de custodia", "Expediente aportable en sala"],
    ],
    seccionInventario: "EXPEDIENTES BAJO CUSTODIA",
    tituloInventario: "Evidencias selladas y verificables",
    leadInventario: "Cada entrada es un expediente con su cadena de custodia completa. El verificador público permite al auditor comprobar la firma sin confiar en el emisor.",
    inventario: [
      ["VRD-2026-0917-88A1F", "Veredicto DENY", "policy: POL-EU-AIACT-ART15", "RFC 3161", "VERIFIED"],
      ["VRD-2026-0916-4C09B", "Veredicto ALLOW", "policy: POL-LOG-IMMUTABLE", "RFC 3161", "VERIFIED"],
      ["EIPD-2026-014", "Evaluación de impacto", "policy: POL-PII-EGRESS", "Firma Ed25519", "VERIFIED"],
    ],
    superficieSeccion: "SUPERFICIE DE AUDITORÍA",
    superficieTitulo: "Estado del expediente",
    superficie: [
      ["POLICY_STATE", "SIGNED_BY_HSM_KEY_0x9F (v2.4.1)"],
      ["COBERTURA NORMATIVA", "94 % de los requisitos mapeados"],
      ["PROOF BUNDLES EMITIDOS", "1.284 este trimestre"],
      ["ÚLTIMA VERIFICACIÓN EXTERNA", "Sin incidencias"],
      ["PENDIENTE DE CIERRE", "2 requisitos en revisión"],
    ],
    tramoRecomendado: "nodo-custodia",
    tramoCta: "ACTIVAR NODO CON CUSTODIA ↗",
  },

  cyber: {
    id: "cyber",
    badge: "VISTA CYBER_RESILIENCE",
    titular: "Ve cada intercepción mientras ocurre",
    pageTitle: "Ve cada intercepción mientras ocurre",
    pageDesc:
      "Monitorización síncrona de intercepciones de capa 7: inyección de prompt, fuga de PII y vectores del OWASP LLM Top 10, con inspección de cada veredicto y su latencia. Sin muestreo, sin retraso y sin puntos ciegos.",
    owner: "SOC · SecOps · Threat hunters",
    rol: "CISO_SECOPS_LEVEL_3",
    metricas: [
      ["PROMPT INJECTION L7", "Intercepción en tiempo real"],
      ["SHADOW AI", "Descubrimiento automático"],
      ["ESTADO FAIL-CLOSED", "100 % activo"],
      ["LATENCIA DE APLICACIÓN", "1,18 ms"],
    ],
    seccionMatriz: "VECTORES NEUTRALIZADOS",
    tituloMatriz: "Contención por vector de ataque",
    leadMatriz: "Cada fila es un vector del OWASP LLM Top 10, el mecanismo determinista que lo neutraliza y la latencia real de la intercepción.",
    matriz: [
      ["LLM01 · Prompt Injection", "Manipulación directa del modelo", "Separación estricta de roles a nivel sintáctico", "0,8 ms"],
      ["LLM02 · Insecure Output", "Salida no validada hacia sistemas", "Validación de integridad dicotómica", "1,4 ms"],
      ["LLM06 · Sensitive Info", "Exfiltración de datos sensibles", "Sanitización k-anónima in-RAM", "1,2 ms"],
      ["LLM08 · Excessive Agency", "Acciones fuera de política", "Puerta de ejecución ex-ante", "0,4 ms"],
      ["LLM10 · Unbounded Consumption", "Consumo ilimitado de recursos", "Context Slicing y umbral determinista", "1,1 ms"],
    ],
    seccionInventario: "TRÁFICO INTERCEPTADO",
    tituloInventario: "Intercepciones en las últimas 24 horas",
    leadInventario: "Cada línea es una intercepción real con su vector, su nodo de origen y su resultado. La telemetría es numérica: nunca contiene el texto ni los datos personales.",
    inventario: [
      ["10:42:07.118", "node-proxy-ingress-01", "LLM01 · Inyección directa", "0,8 ms", "DENY"],
      ["10:41:52.004", "node-sdk-payment-api", "LLM06 · Fuga de PII", "1,2 ms", "DENY"],
      ["10:41:19.771", "node-daemon-finance", "LLM08 · Agencia excesiva", "0,4 ms", "DENY"],
    ],
    superficieSeccion: "TELEMETRÍA DE BORDE",
    superficieTitulo: "Estado del motor en vivo",
    superficie: [
      ["NODE_STATUS", "ONLINE (0,84 ms)"],
      ["INTERCEPCIONES 24 H", "4.891 bloqueadas"],
      ["VECTORES ACTIVOS", "5 del OWASP LLM Top 10"],
      ["CONMUTACIÓN FAIL-CLOSED", "Instantánea, sin reinicio"],
      ["PUNTOS CIEGOS DETECTADOS", "0"],
    ],
    tramoRecomendado: "evidencias",
    tramoCta: "CONTRATAR PAQUETE DE SELLOS ↗",
  },
};

const SEO_CONFIG = {
  home: {
    title: "Auditoría Pública | Verifique un sello S.A.A.R.E. sin confiar en nosotros",
    description:
      "Verificador público de sellos eIDAS RFC 3161. Compruebe la inmutabilidad de un veredicto contra el Trust Anchor, sin registro y sin depender de la palabra del vendedor.",
  },
  producto: {
    title: "Producto | Consolas de Cumplimiento L7 (EXECUTIVE, GRC, CYBER)",
    description: "Tres consolas de cumplimiento sobre el mismo motor: dirección ejecutiva, privacidad y resiliencia de ciberseguridad.",
  },
  forensic: {
    title: "Forense | Evidence Vault y validez procesal Art. 326 LEC",
    description: "Bóveda ciega de evidencias con firma Ed25519, sellado de tiempo eIDAS RFC 3161 y validez judicial con tacha cero.",
  },
  dev: {
    title: "Desarrolladores | SDK, Proxy y Daemon del motor S.A.A.R.E.",
    description: "Tres formas de desplegar el mismo motor. El SDK es gratuito; se cobra la evaluación sellada.",
  },
  canal: {
    title: "Canal | Partners, MSP y Kit Consulting",
    description: "Programa de partners MSP e integradores. Entregables técnicos eIDAS 100 % justificables para ayudas públicas.",
  },
  trial: {
    title: "Prueba de Control | Someta un agente a evaluación S.A.A.R.E.",
    description: "Evaluación cualificada para desplegar el plano de control S.A.A.R.E. SGP 1.0 en su VPC o infraestructura privada.",
  },
  login: {
    title: "Acceso SOC | Consola de cumplimiento S.A.A.R.E.",
    description: "Acceso restringido a personal autorizado. Autenticación con registro firmado de cada inicio de sesión.",
  },
};

function useSEO(pageKey = "home", custom = null) {
  useEffect(() => {
    const data = custom || SEO_CONFIG[pageKey] || SEO_CONFIG.home;
    document.title = data.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", data.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}${window.location.pathname}`);
  }, [pageKey, custom]);
}

/* ==========================================================================
   COMPONENTES ESTRUCTURALES
   ========================================================================== */
function AppShell({ children }) {
  const location = useLocation();

  const active = useMemo(() => {
    if (location.pathname === "/") return "producto";
    const found = NAV.find((item) => item.path !== "/" && location.pathname.startsWith(item.path));
    return found ? found.id : "producto";
  }, [location.pathname]);

  const activeGroup = NAV.find((n) => n.id === active);
  const isAuthRoute = ["/login", "/auth", "/acceso"].includes(location.pathname);

  /* La sesión se lee al navegar Y al montar. Si el token existe pero no hay
     usuario, se persiste igualmente la lectura para no mostrar el botón de
     acceso cuando en realidad hay sesión abierta.

     CORRECCIÓN: se normalizan las claves y se usa el nombre real del tenant,
     que antes se ignoraba. El botón de la barra muestra el tenant cuando el
     plan no es una prueba, para que un usuario multi-tenant se reconozca. */
  const sessionUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("saare_session_user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        email: parsed.email || "",
        name: parsed.name || "",
        role: parsed.role || "CISO_ADMIN",
        tenantName: parsed.tenantName || parsed.tenant || "ORGANIZACION",
        apiKey: parsed.apiKey || "",
        plan: parsed.plan || "ENTERPRISE",
      };
    } catch {
      return null;
    }
  }, [location.pathname]);

  const isTrialSession =
    sessionUser && String(sessionUser.plan || "").toUpperCase().includes("TRIAL");

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-sky-500 selection:text-black">
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-center text-xs font-mono text-slate-400">
        <span className="text-sky-400 font-bold">MS3V S.A.A.R.E. SL</span> · PLATAFORMA ISV SGP 1.0 · Interceptor PEP L7 en memoria RAM volátil (<code className="text-emerald-400">mlock</code> &lt;1,16 ms)
      </div>

      <header className="sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 mb-2">
            <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="S.A.A.R.E. Inicio">
              <span className="font-bold text-2xl tracking-tight text-white font-display">S.A.A.R.E.</span>
              <span className="font-mono text-[10px] bg-sky-500/10 border border-sky-500/30 text-sky-400 px-2 py-0.5 rounded font-bold">SGP 1.0</span>
            </Link>

            <div className="flex items-center gap-2">
              {sessionUser ? (
                <Link
                  to="/producto/cumplimiento"
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded border transition ${
                    isTrialSession
                      ? "border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                      : "border-sky-500/50 text-sky-300 hover:bg-sky-500/10"
                  }`}
                  title={`Sesión activa: ${sessionUser.email} · Tenant: ${sessionUser.tenantName}`}
                >
                  {isTrialSession
                    ? `PRUEBA · ${String(sessionUser.email).split("@")[0].toUpperCase()}`
                    : `CONSOLA · ${String(
                        sessionUser.tenantName || sessionUser.email.split("@")[0]
                      )
                        .toUpperCase()
                        .slice(0, 14)}`}
                </Link>
              ) : (
                <Link to="/login" className="px-3.5 py-1.5 text-xs font-mono font-bold rounded border border-sky-500/50 text-sky-300 hover:bg-sky-500/10 transition">
                  ACCESO SOC ↗
                </Link>
              )}

              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 text-xs font-mono font-bold rounded bg-emerald-500 text-black hover:bg-emerald-400 transition">
                ENTERPRISE ↗
              </a>
            </div>
          </div>

          <nav aria-label="Navegación principal" className="flex items-center gap-1 overflow-x-auto pb-1 border-t border-slate-800/80 pt-2">
            {NAV.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                aria-current={active === item.id ? "page" : undefined}
                className={`shrink-0 px-3 py-1.5 rounded transition-all text-left ${
                  active === item.id
                    ? "bg-sky-500/15 border border-sky-500/40 text-sky-300 font-bold"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-mono text-[11px] tracking-wider">{item.label}</div>
                <div className="text-[9px] text-slate-500 uppercase">{item.description}</div>
              </Link>
            ))}
          </nav>

          {activeGroup && activeGroup.children.length > 0 && !isAuthRoute && (
            <div className="flex items-center gap-4 pt-2 border-t border-slate-800/60 text-[11px] font-mono overflow-x-auto">
              <span className="text-slate-600 uppercase tracking-wider shrink-0">
                {active === "dev" ? "Modos:" : "Vistas:"}
              </span>
              {activeGroup.children.map((c) => (
                <Link
                  key={c.id}
                  to={c.path}
                  aria-current={location.pathname === c.path ? "page" : undefined}
                  className={location.pathname === c.path ? "text-sky-400 font-bold border-b border-sky-400 shrink-0" : "text-slate-400 hover:text-slate-200 shrink-0"}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {children}

      <Footer />
    </div>
  );
}

function PageHeader({ badge, title, description }) {
  return (
    <div className="border-b border-slate-800 bg-slate-950/60 py-12 mb-10">
      <div className="max-w-6xl mx-auto px-6">
        <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded">
          {badge}
        </span>
        <h1 className="font-bold text-3xl sm:text-5xl text-white mt-4 tracking-tight leading-tight font-display">
          {title}
        </h1>
        <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-4xl leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title, lead }) {
  return (
    <div className="mb-8">
      {kicker && <span className="font-mono text-[11px] font-bold text-sky-400 uppercase tracking-widest">{kicker}</span>}
      <h2 className="text-2xl font-bold text-white mt-2 font-display">{title}</h2>
      {lead && <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed max-w-3xl">{lead}</p>}
    </div>
  );
}

function CtaButton({ ctaText, href = WHATSAPP_URL, full = true }) {
  const isExternal = href.startsWith("http");
  const cls = `${full ? "block w-full" : "inline-block"} text-center px-5 py-3 bg-sky-500 text-black font-bold text-xs rounded hover:bg-sky-400 transition`;
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {ctaText}
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {ctaText}
    </Link>
  );
}

function CatalogCard({ item }) {
  if (!item) return null;
  return (
    <div
      className={`bg-slate-900/90 border p-6 rounded-lg font-mono relative overflow-hidden flex flex-col justify-between ${
        item.featured ? "border-emerald-500/50" : "border-sky-500/40"
      }`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
      <div>
        {item.featured && (
          <span className="absolute top-4 right-4 text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded">
            RECOMENDADO
          </span>
        )}
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.grupo}</span>
        <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1 pr-24">{item.etiqueta}</div>
        <h3 className="text-white font-bold text-base mt-2">{item.nombre}</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-2">{item.claim}</p>
        <div className="text-2xl font-bold text-white mt-4">
          {item.precio}
          <span className="text-xs font-normal text-slate-400"> {item.sufijo}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">{item.unidad}</p>
      </div>
      <div className="mt-6">
        <Link
          to={item.path}
          className="block w-full text-center px-5 py-3 border border-sky-500/50 text-sky-300 font-bold text-xs rounded hover:bg-sky-500/10 transition"
        >
          VER DETALLE COMPLETO →
        </Link>
      </div>
    </div>
  );
}

function TechnicalCard({ title, badge, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs">
      {badge && <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">{badge}</span>}
      <h3 className="text-white font-bold text-sm mt-2 mb-3">{title}</h3>
      <div className="text-slate-400 space-y-2 leading-relaxed">{children}</div>
    </div>
  );
}

function CodePanel({ code, title = "INTEGRACIÓN TÉCNICA · CÓDIGO NATIVO" }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 font-mono text-[10px] text-sky-400 font-bold tracking-widest">{title}</div>
      <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b border-slate-800/70 pb-2 text-[11px] font-mono">
      <span className="text-slate-500 min-w-0">{label}</span>
      <span className="text-slate-200 text-right break-words min-w-0">{value}</span>
    </div>
  );
}

function VerdictChip({ verdict }) {
  const map = {
    ALLOW: "bg-emerald-500/15 border-emerald-500 text-emerald-400",
    DENY: "bg-red-500/15 border-red-500 text-red-400",
    REVIEW: "bg-amber-500/15 border-amber-500 text-amber-400",
    VERIFIED: "bg-emerald-500/15 border-emerald-500 text-emerald-400",
    UNVERIFIABLE: "bg-amber-500/15 border-amber-500 text-amber-400",
    ERROR: "bg-red-500/15 border-red-500 text-red-400",
  };
  return (
    <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${map[verdict] || map.REVIEW}`}>
      {verdict}
    </span>
  );
}

function HeroVideoBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video className="absolute inset-0 w-full h-full object-cover" src={HERO_VIDEO_SRC} autoPlay loop muted playsInline preload="metadata" />
      <div className="absolute inset-0 bg-[#030712]/82" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/40 to-[#030712]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:32px_32px]" />
    </div>
  );
}

function ComparativaGuardarrail() {
  return (
    <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
      <div className="bg-slate-900/60 border border-red-500/30 p-6 rounded-lg">
        <h3 className="text-red-400 font-bold text-sm mb-4">GUARDARRAÍLES CLOUD PROBABILÍSTICOS</h3>
        <ul className="space-y-3 text-slate-400">
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Factura API:</span><span className="text-red-400 text-right">Doble cobro (prompt + evaluación)</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Latencia añadida:</span><span className="text-red-400 text-right">+500 ms a +2.000 ms</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Mecanismo de control:</span><span className="text-right">Otra IA alucinando sobre la primera</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Persistencia:</span><span className="text-red-400 text-right">Guarda texto en servidores ajenos</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Air-gapped:</span><span className="text-red-400 text-right">No operativo</span></li>
          <li className="flex justify-between gap-4"><span>Producto en litigio:</span><span className="text-red-400 text-right">Un log interno, impugnable</span></li>
        </ul>
      </div>
      <div className="bg-slate-900/60 border border-emerald-500/40 p-6 rounded-lg">
        <h3 className="text-emerald-400 font-bold text-sm mb-4">S.A.A.R.E. SGP 1.0 (MOTOR RUNTIME EN RAM)</h3>
        <ul className="space-y-3 text-slate-300">
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Factura API:</span><span className="text-emerald-400 font-bold text-right">0 tokens extras (0 €)</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Latencia añadida:</span><span className="text-emerald-400 font-bold text-right">&lt; 1,16 ms (mlock en RAM)</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Mecanismo de control:</span><span className="text-right">Código nativo C++/Rust L7</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Persistencia:</span><span className="text-emerald-400 font-bold text-right">Zero-Disk (solo hashes SHA-256)</span></li>
          <li className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span>Air-gapped:</span><span className="text-emerald-400 font-bold text-right">Nativo</span></li>
          <li className="flex justify-between gap-4"><span>Producto en litigio:</span><span className="text-emerald-400 font-bold text-right">Dossier verificable por un perito</span></li>
        </ul>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Tabla de datos reutilizable. La primera columna nunca envuelve palabra,
   las demás sí, y el contenedor mantiene scroll horizontal en móvil para
   que una celda larga no rompa el ancho de la tabla.
   -------------------------------------------------------------------------- */
function DataTable({ headers, rows, renderLast }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[720px] text-left font-mono text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-sky-400">
            {headers.map((h, i) => (
              <th key={i} className={`pb-3 pr-4 align-bottom ${i === 0 ? "whitespace-nowrap" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-300">
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`py-3 pr-4 align-top leading-relaxed ${
                    ci === 0 ? "font-bold text-white whitespace-nowrap" : ""
                  }`}
                >
                  {ci === r.length - 1 && renderLast ? renderLast(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==========================================================================
   PESTAÑA 1 · AUDITORÍA PÚBLICA
   ========================================================================== */
function TabAuditoriaPublica() {
  useSEO("home");
  const [hash, setHash] = useState(DEMO_ROOT_MERKLE_HASH);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [demoText, setDemoText] = useState(
    "Analiza cliente DNI 12345678A, email legal@saare.es y teléfono +34 633 886 506 para orden de cobro ORD-8839 por importe 14.500 EUR."
  );
  const [demoProcessed, setDemoProcessed] = useState("");
  const [demoMetrics, setDemoMetrics] = useState(null);

  async function handleVerify(e) {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);
    setVerifyResult(null);

    try {
      const response = await saareFetch(`/v1/verify/${encodeURIComponent(hash.trim())}`);
      const data = await response.json().catch(() => ({}));
      const confirmed = response.ok && data?.status === "VERIFIED";

      setVerifyResult({
        status: confirmed ? "VERIFIED" : "UNVERIFIABLE",
        hash: hash.trim(),
        timestamp: confirmed ? data?.timestamp || null : null,
        standard: data?.standard || "eIDAS RFC 3161 / Art. 326 LEC / ISO 27037",
        algorithm: "Ed25519 / SHA-256",
        reason: confirmed ? null : "El Trust Anchor no confirmó este registro.",
      });
    } catch {
      setVerifyResult({
        status: "ERROR",
        hash: hash.trim(),
        timestamp: null,
        standard: "eIDAS RFC 3161 / Art. 326 LEC / ISO 27037",
        algorithm: "Ed25519 / SHA-256",
        reason: "No se pudo contactar con el Trust Anchor. El registro no ha sido verificado.",
      });
    } finally {
      setLoading(false);
    }
  }

  function runInBrowserSanitizer() {
    const t0 = performance.now();
    const sanitized = demoText
      .replace(/[0-9]{8}[A-Z]/gi, "[DNI_ANONYMIZED]")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, "[EMAIL_ANONYMIZED]")
      .replace(/\+?[0-9]{9,12}/gi, "[PHONE_ANONYMIZED]")
      .replace(/ORD-[0-9]+/gi, "[RESOURCE_ID]");
    const t1 = performance.now();

    setDemoProcessed(sanitized);
    setDemoMetrics({
      latency: (t1 - t0).toFixed(2),
      tokensCost: "0 €",
      memoryMode: "RAM (mlock volátil)",
      policy: "FAIL_CLOSED / ZERO_DISK",
      verdict: demoText.includes("14.500") ? "REVIEW" : "ALLOW",
      verdictNote: demoText.includes("14.500") ? "Excede el umbral de 10.000 €" : "Dentro de política",
    });
  }

  const verifyBorder =
    verifyResult?.status === "VERIFIED" ? "border-emerald-500/50" : verifyResult?.status === "UNVERIFIABLE" ? "border-amber-500/50" : "border-red-500/50";

  return (
    <main>
      <section className="relative border-b border-slate-800 bg-[#020617] overflow-hidden pt-12 pb-16">
        <HeroVideoBackdrop />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="bg-slate-900/85 border border-sky-500/30 p-8 rounded-xl backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded">
                GOBERNANZA DE IA CON PRUEBA CRIPTOGRÁFICA
              </span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                Trust Anchor · SAARE-MD-IPRES-2026
              </span>
            </div>

            {/* Identificación primero: responde al «¿esto es para mí?» antes que nada */}
            <p className="mt-6 text-slate-300 text-sm sm:text-base max-w-4xl font-mono leading-relaxed">
              <span className="text-sky-400 font-bold">Para quién:</span> organizaciones con
              agentes de IA que ejecutan acciones irreversibles —pagos, borrados, expedientes—
              y que hoy no pueden demostrar qué se decidió antes de cada una.
            </p>

            <h1 className="font-bold text-3xl sm:text-5xl text-white mt-4 tracking-tight leading-tight font-display">
              Sus agentes de IA ejecutan.{" "}
              <span className="text-sky-400">¿Puede probarlo?</span>
            </h1>

            <p className="mt-5 text-slate-400 text-sm max-w-4xl leading-relaxed">
              CISO, DPO, dirección jurídica y operaciones que responden ante auditoría,
              regulador o aseguradora. Contención determinista en el borde, sin consumo de
              tokens y sin persistencia en el nodo.
            </p>

            {/* Dos puertas: la técnica y la de negocio */}
            <div className="mt-8 grid lg:grid-cols-2 gap-4">
              {/* Puerta A · Verificar */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-5">
                <span className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  ¿Ya tiene un sello?
                </span>
                <h2 className="text-white font-bold text-sm mt-2 mb-3">
                  Verifíquelo ahora. No hace falta que nos crea.
                </h2>
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    placeholder="Raíz Merkle o ID de evidencia"
                    aria-label="Raíz Merkle o identificador de evidencia"
                    className="flex-1 bg-black/90 border border-slate-700 px-4 py-3 text-xs font-mono text-sky-300 rounded focus:border-sky-500 focus:outline-none"
                  />
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-500 text-black font-mono font-bold text-xs rounded hover:bg-emerald-400 transition shrink-0 disabled:opacity-60">
                    {loading ? "VERIFICANDO..." : "VERIFICAR SELLO"}
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] text-slate-500">
                  <button type="button" onClick={() => setHash(DEMO_ROOT_MERKLE_HASH)} className="hover:text-sky-400 transition">
                    Cargar hash de demostración
                  </button>
                  <span>·</span>
                  <a href="#como-funciona" className="hover:text-sky-400 transition">
                    Cómo se genera un sello →
                  </a>
                </div>
              </div>

              {/* Puerta B · Prueba de exposición */}
              <div className="bg-slate-950/70 border border-emerald-500/30 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    ¿Todavía no tiene ninguno?
                  </span>
                  <h2 className="text-white font-bold text-sm mt-2 mb-3">
                    Ejecute la prueba de exposición sobre sus propios agentes.
                  </h2>
                  <ul className="space-y-2 font-mono text-[11px] text-slate-400">
                    <li>· Qué acciones se autorizarían hoy con su política</li>
                    <li>· Cuáles se bloquearían antes de ejecutarse</li>
                    <li>· Qué expediente de prueba generaría su operación</li>
                  </ul>
                </div>
                <div className="mt-5">
                  <Link
                    to="/trial"
                    className="block w-full text-center px-5 py-3 bg-emerald-500 text-black font-bold text-xs rounded hover:bg-emerald-400 transition"
                  >
                    SOLICITAR PRUEBA DE EXPOSICIÓN · 7 DÍAS →
                  </Link>
                  <p className="text-[10px] text-slate-500 text-center mt-3 font-mono">
                    Sin coste · Sin integración previa · Resultado en su expediente
                  </p>
                </div>
              </div>
            </div>

            {verifyResult && (
              <div className={`mt-5 p-4 bg-slate-950 rounded font-mono text-xs border ${verifyBorder}`}>
                <div className="flex items-center gap-2 mb-2">
                  <VerdictChip verdict={verifyResult.status} />
                  <span className="text-slate-300">
                    {verifyResult.status === "VERIFIED"
                      ? "Sello verificado contra el Trust Anchor público"
                      : verifyResult.status === "UNVERIFIABLE"
                      ? "Registro no confirmado"
                      : "Verificación no completada"}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] break-all">Hash: {verifyResult.hash}</div>
                {verifyResult.timestamp && (
                  <div className="text-slate-400 text-[10px] mt-1">Timestamp: {verifyResult.timestamp}</div>
                )}
                <div className="text-slate-500 text-[10px] mt-1">
                  Estándar: {verifyResult.standard} · Algoritmo: {verifyResult.algorithm}
                </div>
                {verifyResult.reason && (
                  <div className="text-slate-500 text-[10px] mt-2 italic">{verifyResult.reason}</div>
                )}
              </div>
            )}

            <p className="mt-4 text-[10px] text-slate-500 font-mono">
              Sin coste · Sin registro · Verificación reproducible por cualquier perito
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-lg font-mono text-xs">
              <span className="text-emerald-400 font-bold">AUTENTICIDAD DE ORIGEN</span>
              <p className="text-slate-400 mt-2 leading-relaxed text-[11px]">
                La clave privada Ed25519 del nodo. Suplantar exigiría comprometer la clave, no el sistema.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-lg font-mono text-xs">
              <span className="text-emerald-400 font-bold">INALTERABILIDAD</span>
              <p className="text-slate-400 mt-2 leading-relaxed text-[11px]">
                El digest HMAC-SHA256. La modificación de un solo bit altera el hash de forma irreversible.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-lg font-mono text-xs">
              <span className="text-amber-400 font-bold">CERTEZA TEMPORAL</span>
              <p className="text-slate-400 mt-2 leading-relaxed text-[11px]">
                El sello cualificado RFC 3161 de una autoridad acreditada, conforme al art. 32 eIDAS.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-12 border-b border-slate-800">
        <SectionTitle
          kicker="CADENA DE CUSTODIA"
          title="Cómo se genera el sello que acaba de verificar"
          lead="Cada veredicto del motor entra en un árbol Merkle. La raíz se firma con Ed25519 y se sella con marca de tiempo RFC 3161. Lo que se conserva es la huella, nunca el contenido en claro."
        />

        {/* Línea de encaje */}
        <div className="bg-slate-950/60 border-l-2 border-sky-500/60 pl-4 py-3 mb-8 font-mono text-xs">
          <span className="text-sky-400 font-bold uppercase tracking-widest text-[10px]">Qué le resuelve</span>
          <p className="text-slate-300 mt-2 leading-relaxed">
            Cuando le reclamen por una acción de su agente, usted no reconstruye nada:
            entrega el sello. El expediente existe ya, sellado en el momento en que se decidió.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl font-mono text-xs mb-8">
          <div className="space-y-3">
            <DataRow label="1 · VEREDICTO" value="ALLOW o DENY con sujeto, política e instante" />
            <DataRow label="2 · ÁRBOL MERKLE" value="El veredicto se encadena con los anteriores" />
            <DataRow label="3 · FIRMA" value="Ed25519 sobre la raíz del árbol" />
            <DataRow label="4 · SELLO DE TIEMPO" value="RFC 3161 emitido por autoridad cualificada" />
            <DataRow label="5 · VERIFICACIÓN" value="Reproducible con la raíz, la firma y la clave pública" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <TechnicalCard title="Bóveda ciega" badge="CONOCIMIENTO CERO">
            <p className="text-emerald-400 font-bold">Demuestra quién autorizó la acción, sin exponer el contenido.</p>
            <p>El verificador inspecciona sin ver el contenido en claro.</p>
            <p>Las claves de custodia las controla el cliente, nunca S.A.A.R.E.</p>
          </TechnicalCard>
          <TechnicalCard title="Verificación offline" badge="SIN CONEXIÓN">
            <p className="text-emerald-400 font-bold">Puede probarlo aunque no haya red, y sin pedirnos permiso.</p>
            <p>La CLI saare-evidence-cli reproduce la cadena sin internet.</p>
            <p>Alineado con ISO/IEC 27037 para evidencia electrónica.</p>
          </TechnicalCard>
          <TechnicalCard title="Dossier exportable" badge="ART. 326 LEC">
            <p className="text-emerald-400 font-bold">El documento que un perito acepta sin discutir su origen.</p>
            <p>Exportación del paquete .saare-proof con la cadena completa.</p>
            <p>Aportable en un procedimiento sin reconstrucción posterior.</p>
          </TechnicalCard>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 border-b border-slate-800">
        <SectionTitle
          kicker="EVALUACIÓN EX-ANTE"
          title="Qué se evalúa antes de autorizar"
          lead="Cada llamada L7 se descompone y analiza sobre memoria volátil antes de autorizar la emisión del Execution Permit."
        />

        {/* Línea de encaje */}
        <div className="bg-slate-950/60 border-l-2 border-sky-500/60 pl-4 py-3 mb-8 font-mono text-xs">
          <span className="text-sky-400 font-bold uppercase tracking-widest text-[10px]">Qué le resuelve</span>
          <p className="text-slate-300 mt-2 leading-relaxed">
            No bloquea «la IA» en abstracto: decide sobre esta acción, de este agente, sobre
            este recurso. Siete dimensiones que cubren lo que un filtro genérico deja pasar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DIMENSIONS.map(([code, title, desc]) => (
            <div key={code} className="bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono text-xs">
              <span className="text-sky-400 font-bold">{code}</span>
              <h3 className="text-white font-bold text-sm mt-2">{title}</h3>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* El argumento comercial no vive en auditoría: se remite a producto */}
      <section className="max-w-6xl mx-auto px-6 py-10 border-b border-slate-800">
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-6 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Siguiente paso</span>
            <p className="text-slate-300 mt-2 leading-relaxed">
              Ya ha visto qué se evalúa y cómo se prueba. Ahora vea qué le costaría tenerlo
              en producción y cómo se compara con lo que ya usa.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/producto/cumplimiento"
              className="text-center px-5 py-3 border border-sky-500/50 text-sky-300 font-bold rounded hover:bg-sky-500/10 transition whitespace-nowrap"
            >
              VER LAS TRES CONSOLAS →
            </Link>
            <a
              href="#licencias"
              className="text-center px-5 py-3 border border-slate-700 text-slate-300 font-bold rounded hover:bg-slate-800 transition whitespace-nowrap"
            >
              VER LICENCIAMIENTO ↓
            </a>
          </div>
        </div>
      </section>

      <section id="licencias" className="max-w-6xl mx-auto px-6 py-12">
        <SectionTitle
          kicker="LICENCIAMIENTO"
          title="Seis tramos, seis páginas"
          lead="Se cobra por el eje que escala —nodo desplegado y evidencia sellada—, no por el número de personas. Cada tramo tiene su propio detalle y su propia superficie técnica."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATALOGO.map((item) => (
            <CatalogCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Bloque de cierre: el momento de mayor intención de la página */}
      <section className="relative border-t border-slate-800 bg-[#020617] overflow-hidden py-16">
        <HeroVideoBackdrop />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <span className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-widest">
            Cierre
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-4 tracking-tight leading-tight">
            Cuando el agente decida, S.A.A.R.E. ya habrá respondido.
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Empiece por donde le duele: verifique lo que ya tiene, o ejecute una prueba de
            exposición sobre sus propios agentes y vea qué expediente generaría hoy su operación.
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Link
              to="/trial"
              className="block w-full text-center px-6 py-4 bg-emerald-500 text-black font-mono font-bold text-sm rounded hover:bg-emerald-400 transition"
            >
              SOLICITAR PRUEBA DE EXPOSICIÓN · 7 DÍAS →
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center px-6 py-4 border border-sky-500/50 text-sky-300 font-mono font-bold text-sm rounded hover:bg-sky-500/10 transition"
            >
              SOLICITAR PROPUESTA ENTERPRISE ↗
            </a>
          </div>

          <p className="mt-6 text-[10px] text-slate-500 font-mono">
            Sin coste de alta · Sin permanencia · Despliegue en su VPC o Air-Gapped · Soporte en español
          </p>

          {/* Tres accesos por rol para quien ya es cliente */}
          <div className="mt-10 pt-8 border-t border-slate-800/60">
            <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
              ¿Ya es cliente? Entre por su vista
            </span>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-xs">
              <Link to="/producto/executive" className="text-slate-400 hover:text-sky-400 transition">
                EXECUTIVE
              </Link>
              <span className="text-slate-700">·</span>
              <Link to="/producto/grc" className="text-slate-400 hover:text-sky-400 transition">
                GRC_AUDIT
              </Link>
              <span className="text-slate-700">·</span>
              <Link to="/producto/cyber" className="text-slate-400 hover:text-sky-400 transition">
                CYBER_RESILIENCE
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PÁGINA · DETALLE DE CADA TRAMO DE LICENCIA
   ========================================================================== */
function DetalleLicencia({ id }) {
  const item = CATALOGO.find((c) => c.id === id);

  useSEO("home", item ? { title: `${item.nombre} | Licenciamiento S.A.A.R.E. SGP 1.0`, description: item.descripcion.slice(0, 155) } : null);

  if (!item) {
    return (
      <main>
        <PageHeader badge="LICENCIAMIENTO" title="Tramo no encontrado" description="El tramo solicitado no existe en el catálogo." />
        <section className="max-w-3xl mx-auto px-6 py-6 mb-16 text-center">
          <CtaButton ctaText="VOLVER AL CATÁLOGO →" href="/#licencias" full={false} />
        </section>
      </main>
    );
  }

  const hermanos = CATALOGO.filter((c) => c.id !== item.id);

  return (
    <main>
      <div className="max-w-6xl mx-auto px-6 pt-8 font-mono text-[11px] text-slate-500">
        <Link to="/#licencias" className="hover:text-sky-400">Licenciamiento</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-400">{item.grupo}</span>
        <span className="mx-2">/</span>
        <span className="text-sky-400">{item.etiqueta}</span>
      </div>

      <PageHeader badge={`${item.grupo} · ${item.etiqueta}`} title={item.nombre} description={item.descripcion} />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-xl font-mono text-xs">
            <SectionTitle kicker="QUÉ INCLUYE" title="Alcance del tramo" />
            <ul className="space-y-3">
              {item.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {item.noIncluye.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No incluye</span>
                <ul className="space-y-2 mt-3">
                  {item.noIncluye.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-500 leading-relaxed">
                      <span className="shrink-0">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 border border-sky-500/40 p-8 rounded-xl font-mono text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Precio</span>
              <div className="text-4xl font-bold text-white mt-3">{item.precio}</div>
              <div className="text-sm text-slate-400 mt-1">{item.sufijo}</div>
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <DataRow label="UNIDAD DE COBRO" value={item.unidad} />
                <DataRow label="COMPRADOR" value={item.comprador} />
                <DataRow label="CONTRATO" value="Sin permanencia" />
              </div>
            </div>
            <div className="mt-8">
              <CtaButton ctaText={item.cta} />
              <p className="text-[10px] text-slate-500 text-center mt-3">Sin coste de alta · Sin permanencia · Su VPC o Air-Gapped</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle kicker="ENCAJE" title="Para quién es este tramo" />
          <div className="grid md:grid-cols-3 gap-6">
            {item.ideal.map((t, i) => (
              <div key={i} className="border-l-2 border-sky-500/40 pl-4 text-slate-300 leading-relaxed">{t}</div>
            ))}
          </div>
        </div>

        {item.grupo === "NODOS" && (
          <>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
              <SectionTitle kicker="MECANISMO" title="Lo que hace el motor en este tramo" lead="El motor es idéntico en los tres nodos. Lo que cambia es la custodia de evidencias y el aislamiento del despliegue." />
              <div className="space-y-3">
                <DataRow label="LATENCIA" value="P99 < 1,16 ms" />
                <DataRow label="CONSUMO DE TOKENS" value="0 € (sin segundo modelo)" />
                <DataRow label="EVALUACIÓN" value="7 dimensiones de control" />
                <DataRow label="SELLADO CONTINUO" value={item.id === "nodo-base" ? "No incluido" : "Firma Ed25519 + RFC 3161"} />
                <DataRow label="DOSSIER JUDICIAL" value={item.id === "nodo-base" ? "No incluido" : "Exportable (Art. 326 LEC)"} />
                <DataRow label="DESPLIEGUE AISLADO" value={item.id === "nodo-enterprise" ? "VPC / Air-Gapped + HSM" : "Estándar"} />
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl mb-12 font-mono text-xs">
              <SectionTitle kicker="INTEGRACIÓN" title="Cómo se despliega" />
              <CodePanel
                title="CLIENTE SDK · AUTORIZACIÓN SÍNCRONA"
                code={`import { SaareJudgeClient } from '@saare/sdk';

const judge = new SaareJudgeClient({
  apiKey: process.env.SAARE_API_KEY,
  failPolicy: 'FAIL_CLOSED'
});

const result = await judge.authorize({
  subject: "payment-agent-742",
  action: "send_wire_transfer",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00 }
});

${item.id === "nodo-base" ? "// Sin custodia: solo el veredicto\nif (result.decision !== 'ALLOW') throw new Error(result.reason);" : "// Con custodia: el veredicto queda sellado\nawait auditLedger.append(result.proofBundle);"}`}
              />
            </div>
          </>
        )}

        {item.id === "evidencias" && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
            <SectionTitle kicker="MEDICIÓN" title="Cómo se factura el consumo" lead="La telemetría es numérica y anónima: contadores de evaluaciones y veredictos, nunca contenido ni datos personales." />
            <div className="space-y-3">
              <DataRow label="MÉTRICA PRINCIPAL" value="Veredictos sellados" />
              <DataRow label="PAQUETE BASE" value="1.000 sellos / mes" />
              <DataRow label="EXCESO" value="Facturado por sello adicional" />
              <DataRow label="VOLUMEN ALTO" value="Descuento por encima de 1.000.000" />
              <DataRow label="CONTENIDO TRANSMITIDO" value="Ninguno · solo contadores" />
            </div>
          </div>
        )}

        {item.id === "forense" && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
            <SectionTitle kicker="CADENA DE CUSTODIA" title="Los tres requisitos del artículo 326 LEC" lead="Cada requisito se responde con un mecanismo concreto, no con una afirmación." />
            <div className="space-y-3">
              <DataRow label="AUTENTICIDAD DE ORIGEN" value="Clave privada Ed25519 del nodo · AFT-2026-AUTH-X9" />
              <DataRow label="INALTERABILIDAD" value="Digest HMAC-SHA256 · un bit altera el hash" />
              <DataRow label="CERTEZA TEMPORAL" value="Sello cualificado RFC 3161 · art. 32 eIDAS" />
              <DataRow label="VERIFICACIÓN OFFLINE" value="CLI saare-evidence-cli sin conexión" />
              <DataRow label="FACTURACIÓN" value="Licencia anual + emisión por caso" />
            </div>
          </div>
        )}

        {item.id === "canal" && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
            <SectionTitle kicker="ENTREGABLES DEL CANAL" title="Tres entregables homologados" lead="El partner produce documentación técnica verificable, no una memoria descriptiva." />
            <div className="space-y-3">
              <DataRow label="1 · DIAGNÓSTICO" value="Informe de auditoría de Shadow AI en la empresa cliente" />
              <DataRow label="2 · DESPLIEGUE" value="Políticas activas en RAM con la consola multi-tenant" />
              <DataRow label="3 · EXPEDIENTE" value="Cumplimiento certificado con firma eIDAS para la ayuda" />
              <DataRow label="MODELO" value="Pago por cliente gestionado, no por usuario" />
            </div>
          </div>
        )}

        {item.grupo === "NODOS" && (
          <div className="max-w-6xl mx-auto mb-12">
            <SectionTitle kicker="CONTEXTO COMPETITIVO" title="Frente al guardarraíl convencional" />
            <ComparativaGuardarrail />
          </div>
        )}

        <div className="border-t border-slate-800 pt-10">
          <SectionTitle kicker="CATÁLOGO COMPLETO" title="Otros tramos" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hermanos.map((h) => (
              <CatalogCard key={h.id} item={h} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   VISTA DE CONSOLA · una superficie diferenciada por rol
   El cuerpo cambia por completo según la vista: matriz, inventario, superficie
   operativa y tramo recomendado son propios de cada rol.
   ========================================================================== */
function VistaConsola({ vistaId }) {
  const v = VISTAS_CONSOLA[vistaId];
  useSEO("producto", { title: `${v.badge} | Consolas de Cumplimiento S.A.A.R.E.`, description: v.pageDesc.slice(0, 155) });

  const esCyber = v.id === "cyber";

  return (
    <main>
      <PageHeader badge={`PRODUCTO · ${v.badge}`} title={v.pageTitle} description={v.pageDesc} />

      <section className="max-w-6xl mx-auto px-6 py-6">
        {/* Identidad de la vista y sus cuatro indicadores */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1 bg-slate-900/90 border border-sky-500/40 p-6 rounded-lg font-mono text-xs">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{v.badge}</span>
            <h3 className="text-white font-bold text-base mt-2">{v.titular}</h3>
            <p className="text-slate-500 mt-2 leading-relaxed">{v.owner}</p>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <DataRow label="ROL DE ACCESO" value={v.rol} />
            </div>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {v.metricas.map(([label, value], i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono text-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                <span className="text-white font-bold text-lg mt-3 break-words">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matriz propia de la vista */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12">
          <SectionTitle kicker={v.seccionMatriz} title={v.tituloMatriz} lead={v.leadMatriz} />
          <DataTable
            headers={esCyber ? ["VECTOR OWASP", "MECANISMO DE EXPLOTACIÓN", "MITIGACIÓN DETERMINISTA", "LATENCIA"] : ["MARCO Y ARTÍCULO", "CONTROL REQUERIDO", "MECANISMO S.A.A.R.E.", "EVIDENCIA GENERADA"]}
            rows={v.matriz}
          />
        </div>

        {/* Inventario propio de la vista */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle kicker={v.seccionInventario} title={v.tituloInventario} lead={v.leadInventario} />
          <DataTable
            headers={esCyber ? ["INSTANTE", "NODO DE ORIGEN", "VECTOR", "LATENCIA", "VEREDICTO"] : ["IDENTIFICADOR", "ELEMENTO", "POLÍTICA O ÁMBITO", "SELLO", "ESTADO"]}
            rows={v.inventario}
            renderLast={(cell) => <VerdictChip verdict={cell} />}
          />
        </div>

        {/* Superficie operativa propia de la vista */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle kicker={v.superficieSeccion} title={v.superficieTitulo} />
          <div className="bg-slate-950 p-6 rounded border border-slate-800 space-y-3">
            {v.superficie.map(([label, value], i) => (
              <DataRow key={i} label={label} value={value} />
            ))}
          </div>
        </div>

        {/* Tramo recomendado para esta vista */}
        <div className="max-w-2xl mx-auto mb-12">
          <CatalogCard item={CATALOGO.find((c) => c.id === v.tramoRecomendado)} />
        </div>

        {/* Salto a las otras dos vistas */}
        <div className="border-t border-slate-800 pt-10">
          <SectionTitle kicker="OTRAS SUPERFICIES" title="Las otras vistas de la misma consola" />
          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(VISTAS_CONSOLA)
              .filter((o) => o.id !== v.id)
              .map((o) => (
                <TechnicalCard key={o.id} title={o.titular} badge={o.badge}>
                  <p className="text-slate-500">{o.owner}</p>
                  <Link to={`/producto/${o.id}`} className="inline-block mt-3 text-sky-400 hover:underline">
                    Abrir vista →
                  </Link>
                </TechnicalCard>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · CONSOLAS DE CUMPLIMIENTO (índice de las tres vistas)
   ========================================================================== */
function TabCumplimiento() {
  useSEO("producto");

  return (
    <main>
      <PageHeader
        badge="PRODUCTO · CONSOLAS DE CUMPLIMIENTO"
        title="Una consola de gobierno, tres superficies por rol"
        description="Plano unificado de control para dirección ejecutiva, cumplimiento de privacidad y resiliencia de ciberseguridad. El control de acceso basado en roles adapta la interfaz, la matriz y los indicadores según el perfil, sobre el mismo motor de decisión."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Object.values(VISTAS_CONSOLA).map((v) => (
            <TechnicalCard key={v.id} title={v.titular} badge={v.badge}>
              <p className="text-slate-500">{v.owner}</p>
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <DataRow label="INDICADOR CLAVE" value={`${v.metricas[0][0]} · ${v.metricas[0][1]}`} />
                <DataRow label="ROL DE ACCESO" value={v.rol} />
              </div>
              <Link to={`/producto/${v.id}`} className="inline-block mt-4 text-sky-400 hover:underline font-bold">
                Abrir esta vista →
              </Link>
            </TechnicalCard>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle kicker="ADMINISTRACIÓN" title="Inventario unificado de nodos" lead="Una sola consola gobierna los tres modos de despliegue. Las políticas se distribuyen globalmente o por etiquetas de alcance." />
          <DataTable
            headers={["NODO / INSTANCIA", "DESPLIEGUE", "ENTORNO", "ÁMBITO", "ESTADO"]}
            rows={[
              ["node-sdk-payment-api", "SDK nativo", "App Node.js / Lambda", "scope: microservices", "ALLOW"],
              ["node-proxy-ingress-01", "Proxy (PerimeterShield)", "Docker / K8s", "scope: external-apis", "ALLOW"],
              ["node-daemon-finance-srv", "Daemon (On-Premise)", "Ubuntu Server 22.04", "scope: core-banking", "ALLOW"],
            ]}
            renderLast={(cell) => <VerdictChip verdict={cell} />}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12">
          <SectionTitle kicker="CUMPLIMIENTO POR DISEÑO" title="Matriz regulatoria integrada" />
          <DataTable
            headers={["MARCO NORMATIVO", "CONTROL REQUERIDO", "MECANISMO S.A.A.R.E.", "EVIDENCIA GENERADA"]}
            rows={[
              ["EU AI Act arts. 10 y 12", "Gobernanza de datos y registro de eventos", "Generalización ex-ante y registro en memoria", "Huella criptográfica del veredicto"],
              ["EU AI Act arts. 14 y 15", "Supervisión humana y robustez", "Cambio de política en vivo y contención fail-closed", "Veredicto firmado con latencia"],
              ["RGPD art. 32", "Minimización y cifrado de datos", "Sanitización en RAM y arquitectura Zero-Disk", "Digest SHA-256 del payload"],
              ["DORA", "Resiliencia operativa y continuidad", "Políticas locales firmadas sin dependencia de red", "Certificado de autonomía de nodo"],
              ["NIS 2", "Gestión de riesgo y notificación", "Telemetría determinista sin contenido ni PII", "Contadores anónimos firmados"],
              ["ISO/IEC 27037", "Identificación de evidencia digital", "Cadena de Merkle y firma asimétrica", "Dossier forense verificable offline"],
              ["Arts. 281 y 326 LEC", "Prueba documental preconstituida", "Sellado cualificado y cadena de custodia", "Expediente aportable en sala"],
            ]}
          />
        </div>

        <div className="max-w-2xl mx-auto">
          <CatalogCard item={CATALOGO.find((c) => c.id === "nodo-custodia")} />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · FORENSE
   ========================================================================== */
function TabForense() {
  useSEO("forensic");
  return (
    <main>
      <PageHeader
        badge="FORENSE · EVIDENCE VAULT"
        title="Un log se alega. Un árbol de Merkle firmado se prueba."
        description="Entorno pericial para jueces, peritos y despachos. Bóveda ciega, verificación independiente contra la clave pública del nodo y exportación del dossier conforme al Art. 326 LEC."
      />
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <TechnicalCard title="Bóveda ciega de conocimiento cero" badge="VERIFICACIÓN">
            <p>• El perito inspecciona y valida sin ver el contenido en claro.</p>
            <p>• Claves de custodia controladas por el cliente, nunca por S.A.A.R.E.</p>
            <p>• Acceso por rol con registro de cada consulta firmado.</p>
          </TechnicalCard>
          <TechnicalCard title="Validador Ed25519 independiente" badge="CADENA DE CUSTODIA">
            <p>• Contraste de la firma del nodo contra su clave pública.</p>
            <p>• Verificación reproducible sin confiar en el emisor.</p>
            <p>• Cadena eIDAS y sello cualificado RFC 3161 como certeza temporal.</p>
          </TechnicalCard>
          <TechnicalCard title="Dossier procesal exportable" badge="ART. 326 LEC">
            <p>• Exportación del paquete .saare-proof con la cadena completa.</p>
            <p>• Alineado con ISO/IEC 27037 para evidencia electrónica.</p>
            <p>• Auditoría de propiedad intelectual contra la Ley 1/2019.</p>
          </TechnicalCard>
        </div>
        <div className="max-w-2xl mx-auto">
          <CatalogCard item={CATALOGO.find((c) => c.id === "forense")} />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · DESARROLLADORES
   ========================================================================== */
function TabDev() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="DESARROLLADORES · TRES MODOS DE DESPLIEGUE"
        title="Intégrelo en una tarde, o no lo integre en absoluto."
        description="El SDK es gratuito. Se cobra la evaluación sellada, no el acceso. Tres formas de desplegar el mismo motor según dónde necesite la intercepción."
      />
      <section className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-3 gap-6">
        <TechnicalCard title="SDK nativo" badge="LabEngine">
          <p>Autorización embebida en el código fuente del agente o microservicio.</p>
          <p className="text-emerald-400 font-bold mt-2">Gratuito · se cobra el sellado</p>
          <Link to="/dev/sdk" className="inline-block mt-3 text-sky-400 hover:underline">Ver integración →</Link>
        </TechnicalCard>
        <TechnicalCard title="Proxy perimetral" badge="PerimeterShield">
          <p>Intercepción L7 en el borde de la red, por contenedor o clúster.</p>
          <p className="text-emerald-400 font-bold mt-2">Por nodo proxy desplegado</p>
          <Link to="/dev/proxy" className="inline-block mt-3 text-sky-400 hover:underline">Ver despliegue →</Link>
        </TechnicalCard>
        <TechnicalCard title="Daemon on-premise" badge="Servicio local">
          <p>Servicio nativo para redes aisladas y LLMs locales, con claves HSM.</p>
          <p className="text-emerald-400 font-bold mt-2">Por instancia ejecutada</p>
          <Link to="/dev/daemon" className="inline-block mt-3 text-sky-400 hover:underline">Ver despliegue →</Link>
        </TechnicalCard>
      </section>
    </main>
  );
}

function TabSDK() {
  useSEO("dev");
  return (
    <main>
      <PageHeader badge="MODO SDK · LabEngine" title="La autorización en el código fuente, antes de la acción de riesgo." description="Biblioteca nativa @saare/sdk y pip install saare-sdk. Validación de esquemas MCP y autorización síncrona sin salir del proceso." />
      <section className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        <CodePanel
          title="PATRÓN DE INTEGRACIÓN · CLIENTE SDK"
          code={`import { SaareJudgeClient } from '@saare/sdk';

const judge = new SaareJudgeClient({
  apiKey: process.env.SAARE_API_KEY,
  failPolicy: 'FAIL_CLOSED'
});

const result = await judge.authorize({
  subject: "payment-agent-742",
  action: "send_wire_transfer",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00 }
});

if (result.decision !== "ALLOW") {
  throw new Error('Bloqueo Ex-Ante S.A.A.R.E.: ' + result.reason);
}

await executeBankTransfer(result.executionPermit);`}
        />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs space-y-2">
          <DataRow label="BENCHMARK EVALUACIÓN" value="P99 < 1,16 ms" />
          <DataRow label="CONSUMO DE TOKENS" value="0 € (sin segundo modelo)" />
          <DataRow label="AHORRO POR COMPRESIÓN" value="Context Slicing activo" />
          <DataRow label="VALIDACIÓN DE ESQUEMAS" value="AST in-memory · soporte MCP" />
        </div>
        <div className="max-w-2xl mx-auto bg-slate-900/90 border border-emerald-500/50 p-6 rounded-lg font-mono">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">SDK NATIVO · ACCESO</span>
          <div className="text-3xl font-bold text-white mt-2">0 € <span className="text-sm font-normal text-slate-400">/mes</span></div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-3">El SDK es gratuito. Lo que se paga es la evaluación sellada.</p>
          <div className="mt-4">
            <CtaButton ctaText="DESCARGAR SDK ↗" />
          </div>
        </div>
      </section>
    </main>
  );
}

function TabProxy() {
  useSEO("dev");
  return (
    <main>
      <PageHeader badge="MODO PROXY · PerimeterShield" title="Intercepción L7 en el borde, antes de que el tráfico salga." description="Contenedor Docker o despliegue Helm en Kubernetes. Sanitización k-anónima y defensa contra prompt injections sin tocar el código de los agentes." />
      <section className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        <CodePanel
          title="DESPLIEGUE · DOCKER COMPOSE"
          code={`version: '3.8'
services:
  saare-shield:
    image: registry.saare.es/perimeter-shield:v7.0.4
    environment:
      - SAARE_TENANT_KEY=\${SAARE_TENANT_KEY}
      - SAARE_POLICY_MODE=STRICT_FAIL_CLOSED
      - SAARE_SCOPE=external-apis
    ports:
      - "8765:8765"
    restart: unless-stopped`}
        />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs space-y-2">
          <DataRow label="PUNTO DE INTERCEPCIÓN" value="127.0.0.1:8765 (bucle local)" />
          <DataRow label="ALCANCE DE POLÍTICA" value="scope: external-apis" />
          <DataRow label="MODO DE FALLO" value="STRICT_FAIL_CLOSED" />
          <DataRow label="SANITIZACIÓN" value="k-Anonymity in-RAM" />
        </div>
        <div className="max-w-2xl mx-auto">
          <CatalogCard item={CATALOGO.find((c) => c.id === "nodo-custodia")} />
        </div>
      </section>
    </main>
  );
}

function TabDaemon() {
  useSEO("dev");
  return (
    <main>
      <PageHeader badge="MODO DAEMON · ON-PREMISE" title="Servicio local para redes aisladas y modelos propios." description="Demonio no privilegiado en C++/Rust, atado al bucle local. Para LLMs on-premise, arquitecturas air-gapped y claves gestionadas por HSM." />
      <section className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        <CodePanel
          title="DESPLIEGUE · SYSTEMD UNIT"
          code={`[Unit]
Description=SAARE Decision Core (Zero-Disk L7)
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/saare-daemon --bind 127.0.0.1:8765
Environment=SAARE_TENANT_KEY=\${SAARE_TENANT_KEY}
Environment=SAARE_MEMORY_MODE=MLOCK_VOLATILE
Environment=SAARE_HSM_PKCS11=/etc/saare/hsm.so
Restart=always
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target`}
        />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs space-y-2">
          <DataRow label="PRIVILEGIOS" value="Demonio no privilegiado" />
          <DataRow label="MEMORIA" value="mlock · sin paginación a disco" />
          <DataRow label="CLAVES" value="HSM corporativo (PKCS#11)" />
          <DataRow label="REARRANQUE" value="Revinculación del socket en <500 ms" />
        </div>
        <div className="max-w-2xl mx-auto">
          <CatalogCard item={CATALOGO.find((c) => c.id === "nodo-enterprise")} />
        </div>
      </section>
    </main>
  );
}

function TabVentas() {
  useSEO("canal");
  return (
    <main>
      <PageHeader badge="CANAL · PARTNERS Y KIT CONSULTING" title="Venda gobernanza de IA sin construirla." description="Programa multi-tenant para consultoras, MSP y Agentes Digitalizadores. Cada cliente gestionado con su política, su clave y su cadena de prueba independiente." />
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <TechnicalCard title="Marca blanca operativa" badge="MULTI-TENANT">
            <p>El veredicto y la evidencia se generan en su infraestructura.</p>
            <p>La relación comercial con su cliente permanece intacta.</p>
          </TechnicalCard>
          <TechnicalCard title="Justificación de ayudas" badge="KIT CONSULTING">
            <p>Documentación técnica verificable para los programas de digitalización.</p>
            <p>Expediente de entregables eIDAS listo para presentar.</p>
          </TechnicalCard>
          <TechnicalCard title="Precio por cartera" badge="MODELO">
            <p>Pago por cliente gestionado, no por usuario del despacho.</p>
            <p>Un consultor arrastra su cartera completa.</p>
          </TechnicalCard>
        </div>
        <div className="max-w-2xl mx-auto">
          <CatalogCard item={CATALOGO.find((c) => c.id === "canal")} />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PÁGINA · PRUEBA DE CONTROL
   ========================================================================== */
function TrialPage() {
  useSEO("trial");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [agents, setAgents] = useState(1);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const isEnterprise = Number(agents) > 10;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (isEnterprise) {
      const text = encodeURIComponent(`Solicito revisión Enterprise S.A.A.R.E. · Empresa: ${company} · Agentes: ${agents} · Correo: ${email}`);
      window.open(`https://wa.me/34633886506?text=${text}`, "_blank");
      setStatus("idle");
      return;
    }

    try {
      const response = await saareFetch("/v1/trial", {
        method: "POST",
        body: JSON.stringify({ email, company, agents: Number(agents) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Error al procesar la solicitud");
      setStatus("success");
      setMessage("Solicitud aprobada. Le hemos enviado las instrucciones del entorno a su correo corporativo. El siguiente paso es desplegar el nodo de prueba en su VPC.");
    } catch {
      setStatus("error");
      setMessage("No se ha podido conectar con el backend. Puede solicitar la propuesta Enterprise directamente vía WhatsApp.");
    }
  }

  return (
    <main>
      <PageHeader badge="PRUEBA DE CONTROL DE EJECUCIÓN" title="Someta un agente autónomo al plano de control S.A.A.R.E." description="Inicie una evaluación técnica. Complete los datos corporativos para aprovisionar un entorno de prueba o solicitar una revisión de arquitectura." />
      <section className="max-w-3xl mx-auto px-6 py-6 mb-16">
        {status === "success" ? (
          <div className="bg-slate-900 border border-emerald-500 p-8 rounded-xl font-mono text-xs">
            <div className="text-emerald-400 font-bold text-sm mb-2">SOLICITUD PROCESADA</div>
            <p className="text-slate-300 leading-relaxed">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-xl space-y-6 font-mono text-xs">
            <div>
              <label htmlFor="trial-email" className="block text-sky-400 mb-2">CORREO CORPORATIVO (*)</label>
              <input id="trial-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ciso@empresa.com" aria-describedby="trial-email-hint" className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500" />
              <p id="trial-email-hint" className="text-[10px] text-slate-500 mt-1">Para la prueba de exposición necesitamos un correo corporativo.</p>
            </div>
            <div>
              <label htmlFor="trial-company" className="block text-sky-400 mb-2">ORGANIZACIÓN (*)</label>
              <input id="trial-company" type="text" required autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Nombre de la entidad" className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label htmlFor="trial-agents" className="block text-sky-400 mb-2">AGENTES AUTÓNOMOS EN PRODUCCIÓN (*)</label>
              <input id="trial-agents" type="number" min="1" required value={agents} onChange={(e) => setAgents(e.target.value)} aria-describedby="trial-agents-hint" className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500" />
              <p id="trial-agents-hint" className="text-[10px] text-slate-500 mt-1">Más de 10 agentes cualifica automáticamente para despliegue privado Enterprise.</p>
            </div>
            {status === "error" && <div className="text-red-400">{message}</div>}
            <button type="submit" disabled={status === "loading"} className="w-full py-4 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition disabled:opacity-60">
              {status === "loading" ? "PROCESANDO..." : isEnterprise ? "SOLICITAR REVISIÓN ENTERPRISE" : "INICIAR PRUEBA DE CONTROL"}
            </button>
            <p className="text-[10px] text-slate-500 text-center">Sin coste de alta · Sin permanencia · Su VPC o Air-Gapped</p>
          </form>
        )}
      </section>
    </main>
  );
}

/* ==========================================================================
   PÁGINAS CORPORATIVAS
   ========================================================================== */
function CorporatePage({ variant }) {
  const CONTENT = {
    empresa: {
      badge: "CORPORATIVO",
      title: "MS3V S.A.A.R.E. SL · Soberanía tecnológica europea",
      description: "Infraestructura independiente de gobernanza de IA. Intercepción ex-ante en memoria volátil, contención determinista y prueba digital probatoria. Sin dependencia de proveedores externos.",
      body: [
        "S.A.A.R.E. opera como una infraestructura soberana de autorización ex-ante y gobernanza runtime para agentes autónomos, bajo el protocolo SGP 1.0 y el principio Fail-Closed. Mientras los agentes ejecutan acciones, el motor evalúa, decide e intercepta en tiempo real, garantizando el cumplimiento del Reglamento Europeo de Inteligencia Artificial, DORA, NIST CSF 2.0 y el Reglamento General de Protección de Datos.",
        "La compañía mantiene su sede y su infraestructura en la Unión Europea, y ninguna decisión de contenido abandona el perímetro del cliente. Los contadores de licenciamiento son numéricos y anónimos: registran el número de evaluaciones y veredictos, nunca el texto ni los datos personales.",
      ],
    },
    "buenas-practicas": {
      badge: "ÉTICA Y BUEN USO",
      title: "Código de buen uso de la IA",
      description: "Marco de uso responsable: minimización de datos por diseño, supervisión humana efectiva, trazabilidad de cada decisión automatizada y no persistencia de contenido en el nodo evaluador.",
      body: [
        "Principio de minimización. El sistema procesa en memoria volátil y no persiste contenido en claro. La custodia conserva huellas criptográficas, no texto. Cualquier dato personal detectado en tránsito se generaliza antes de que abandone el nodo, conforme al artículo 5 del Reglamento General de Protección de Datos.",
        "Principio de supervisión humana. El responsable de cumplimiento puede modificar las reglas del motor en tiempo real sin reiniciar los sistemas, de modo que el control efectivo permanece en manos de la organización y no del automatismo. Cada cambio de política queda registrado y firmado.",
        "Principio de trazabilidad. Cada decisión autorizada queda sellada con su política aplicada y su instante exacto. La trazabilidad no es un registro de vigilancia: es la prueba de que el sistema actuó conforme a la política vigente en el momento de la ejecución.",
        "Principio de no discriminación. La generalización semántica sustituye valores exactos por rangos y aplica ruido diferencial, lo que evita que variables indirectas permitan reidentificar a una persona o inferir categorías sensibles.",
      ],
    },
    legal: {
      badge: "CENTRO LEGAL B2B",
      title: "Centro legal y privacidad Zero-Disk",
      description: "Condiciones B2B, acuerdo de encargado de tratamiento, política de privacidad y SLA Zero-Disk. Documentación disponible para auditoría previa a la contratación.",
      body: [
        "Acuerdo de encargado de tratamiento. S.A.A.R.E. actúa como encargado en los tratamientos derivados del despliegue del nodo, y como responsable únicamente en los datos de licenciamiento. El modelo de contrato y sus anexos están disponibles para revisión previa a cualquier compromiso.",
        "Compromiso Zero-Disk. El nodo evaluador no escribe contenido en disco. El bloque de memoria se bloquea con mlock para impedir la paginación, y se sobreescribe con ceros tras la firma. La custodia de evidencias es externa al nodo y almacena huellas o contenido cifrado con clave del cliente.",
        "SLA Zero-Disk. El compromiso de disponibilidad, los tiempos de respuesta del soporte y las condiciones de continuidad de servicio para el tramo Enterprise se documentan en el contrato marco, con SLA garantizado del 99,99 % para el despliegue dedicado.",
        "Prueba preconstituida. La generación de evidencia se alinea con los artículos 281 y 326 de la Ley de Enjuiciamiento Civil y con ISO/IEC 27037, de modo que el expediente sea aportable en un procedimiento sin necesidad de reconstrucción posterior.",
      ],
    },
  };

  const data = CONTENT[variant] || CONTENT.empresa;
  useSEO("home");

  return (
    <main>
      <PageHeader badge={data.badge} title={data.title} description={data.description} />
      <section className="max-w-3xl mx-auto px-6 py-6 mb-16 space-y-6">
        {data.body.map((p, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
        ))}
        <p className="text-sm text-slate-400 font-mono pt-4 border-t border-slate-800">
          Para el detalle contractual completo, contacte con el equipo legal en{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-400 hover:underline">{CONTACT_EMAIL}</a>.
          Facilitamos la documentación necesaria antes de cualquier compromiso.
        </p>
      </section>
    </main>
  );
}

function LoginPage() {
  useSEO("login");
  return <Login />;
}

/* ==========================================================================
   PIE DE PÁGINA
   Cinco columnas en escritorio, tres en tablet y una en móvil. El salto
   intermedio evita el apretado entre 768 y 1024 px.
   ========================================================================== */
function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-12 pb-8 px-6 font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-8 mb-10">
        <div className="space-y-3">
          <div className="text-white font-bold text-sm tracking-wide">MS3V S.A.A.R.E. SL</div>
          <p className="text-slate-500 text-[11px] leading-relaxed">Infraestructura independiente de gobernanza de IA. Intercepción ex-ante en memoria RAM y prueba digital probatoria.</p>
          <div className="text-[10px] text-slate-600">Madrid, España</div>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Producto</div>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/producto/auditoria" className="hover:text-sky-400">Auditoría pública</Link></li>
            <li><Link to="/producto/executive" className="hover:text-sky-400">Consola EXECUTIVE</Link></li>
            <li><Link to="/producto/grc" className="hover:text-sky-400">Consola GRC_AUDIT</Link></li>
            <li><Link to="/producto/cyber" className="hover:text-sky-400">Consola CYBER_RESILIENCE</Link></li>
            <li><Link to="/forense" className="hover:text-sky-400">Evidence Vault</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Licencias</div>
          <ul className="space-y-2 text-[11px]">
            {CATALOGO.map((c) => (
              <li key={c.id}>
                <Link to={c.path} className="hover:text-sky-400">{c.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Desarrolladores y canal</div>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/dev/sdk" className="hover:text-sky-400">SDK nativo</Link></li>
            <li><Link to="/dev/proxy" className="hover:text-sky-400">Proxy perimetral</Link></li>
            <li><Link to="/dev/daemon" className="hover:text-sky-400">Daemon on-premise</Link></li>
            <li><Link to="/canal" className="hover:text-sky-400">Programa de partners</Link></li>
            <li><Link to="/login" className="hover:text-sky-400">Acceso SOC</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Corporativo</div>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/empresa" className="hover:text-sky-400">Sobre MS3V S.A.A.R.E. SL</Link></li>
            <li><Link to="/buenas-practicas" className="hover:text-sky-400">Código de buen uso de IA</Link></li>
            <li><Link to="/legal" className="hover:text-sky-400">Centro legal B2B y DPA</Link></li>
            <li>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-sky-400">{CONTACT_EMAIL}</a></li>
            <li>Teléfono: {CONTACT_PHONE}</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-[10px] text-slate-600">
        <div>© 2026 MS3V S.A.A.R.E. SL. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <Link to="/legal" className="hover:text-slate-400">Privacidad</Link>
          <Link to="/legal" className="hover:text-slate-400">Términos B2B</Link>
          <Link to="/legal" className="hover:text-slate-400">SLA Zero-Disk</Link>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/* ==========================================================================
   ENRUTADOR GENERAL
   ========================================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<TabAuditoriaPublica />} />
          <Route path="/producto" element={<TabAuditoriaPublica />} />
          <Route path="/producto/auditoria" element={<TabAuditoriaPublica />} />

          {/* Tres vistas de consola, cada una con su propia superficie */}
          <Route path="/producto/executive" element={<VistaConsola vistaId="executive" />} />
          <Route path="/producto/grc" element={<VistaConsola vistaId="grc" />} />
          <Route path="/producto/cyber" element={<VistaConsola vistaId="cyber" />} />
          <Route path="/producto/cumplimiento" element={<TabCumplimiento />} />

          <Route path="/forense" element={<TabForense />} />

          <Route path="/dev" element={<TabDev />} />
          <Route path="/dev/sdk" element={<TabSDK />} />
          <Route path="/dev/proxy" element={<TabProxy />} />
          <Route path="/dev/daemon" element={<TabDaemon />} />

          <Route path="/canal" element={<TabVentas />} />

          {CATALOGO.map((c) => (
            <Route key={c.id} path={c.path} element={<DetalleLicencia id={c.id} />} />
          ))}

          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/acceso" element={<LoginPage />} />

          <Route path="/trial" element={<TrialPage />} />
          <Route path="/empresa" element={<CorporatePage variant="empresa" />} />
          <Route path="/buenas-practicas" element={<CorporatePage variant="buenas-practicas" />} />
          <Route path="/legal" element={<CorporatePage variant="legal" />} />

          <Route path="/cumplimiento" element={<TabCumplimiento />} />
          <Route path="/grc" element={<VistaConsola vistaId="grc" />} />
          <Route path="/auditoria" element={<TabAuditoriaPublica />} />
          <Route path="/sdk" element={<TabSDK />} />
          <Route path="/proxy" element={<TabProxy />} />
          <Route path="/daemon" element={<TabDaemon />} />
          <Route path="/software" element={<TabProxy />} />
          <Route path="/sales" element={<TabVentas />} />
          <Route path="/ventas" element={<TabVentas />} />
          <Route path="/developers" element={<TabDev />} />
          <Route path="/enterprise" element={<VistaConsola vistaId="executive" />} />

          <Route path="*" element={<TabAuditoriaPublica />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}