/* ==========================================================================
   S.A.A.R.E. SGP 1.0 · LANDING ENTERPRISE COMPLETA CON BOTONES DE COBRO
   ========================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { saareFetch, saareCheckout } from "./utils/api";
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

const METRIC_LABELS = {
  DEMO: { text: "DEMO", cls: "bg-slate-500/10 border-slate-500/40 text-slate-400" },
  BENCHMARK: { text: "BENCHMARK", cls: "bg-sky-500/10 border-sky-500/40 text-sky-300" },
  REFERENCE: { text: "REFERENCE", cls: "bg-amber-500/10 border-amber-500/40 text-amber-300" },
  LIVE: { text: "LIVE", cls: "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" },
};

/* NAVEGACIÓN AGRUPADA */
const NAV = [
  { id: "auditoria", label: "1. AUDITORÍA PÚBLICA", description: "Motor de referencia", path: "/" },
  { id: "cumplimiento", label: "2. CUMPLIMIENTO L7", description: "Board · GRC · CISO", path: "/producto/cumplimiento" },
  { id: "forense", label: "3. LEGAL-FORENSE", description: "Evidence Vault", path: "/forense" },
  { id: "ventas", label: "4. AGENTES VENTA", description: "Partners · Canal", path: "/ventas" },
  { id: "sdk", label: "5. MODO SDK", description: "LabEngine", path: "/sdk" },
  { id: "proxy", label: "6. MODO PROXY", description: "PerimeterShield", path: "/proxy" },
  { id: "daemon", label: "7. MODO DAEMON", description: "On-Premise", path: "/daemon" },
];

const DIMENSIONS = [
  ["DIM 01", "IDENTIDAD", "Quién solicita la acción. Verificación asimétrica de firmas Ed25519 del agente o token JWT del sistema originador."],
  ["DIM 02", "ACCIÓN", "Qué quiere ejecutar. Inspección L7 de comandos (READ, MUTATE_DATABASE, SEND_PAYMENT, DELETE, EXECUTE_CODE)."],
  ["DIM 03", "CONTEXTO", "En qué contexto ocurre. Evaluación de la variable temporal, IP de origen, geolocalización y aislamiento."],
  ["DIM 04", "RECURSO", "Sobre qué recurso. Validación del URI objetivo, tabla de base de datos, servicio financiero o endpoint API receptor."],
  ["DIM 05", "DATOS", "Qué datos intervienen. Inspección y sanitización in-RAM k-Anonymity para PII (DNI, NIF), PHI e IBANs en tránsito."],
  ["DIM 06", "RIESGO", "Qué nivel de riesgo presenta. Scoring determinista basado en impacto económico y vector de ataque."],
  ["DIM 07", "POLÍTICA", "Qué regla aplica. Verificación contra el motor de políticas firmado localmente y compilado a código nativo."],
];

const DECISION_PATH = [
  ["01", "INTENTO DE ACCIÓN", "El agente emite un comando contra un recurso protegido.", "INTERCEPTED"],
  ["02", "NORMALIZACIÓN", "NFKC, decodificación y tokenizado del payload en RAM.", "PARSED"],
  ["03", "EVALUACIÓN 7D", "Las siete dimensiones se resuelven contra la política firmada.", "EVALUATED"],
  ["04", "VEREDICTO", "ALLOW, DENY o REVIEW emitido por regla determinista.", "DENY"],
  ["05", "PERMISO", "Si procede, se emite un Permit Token de un solo uso y corto TTL.", "NOT_ISSUED"],
  ["06", "EVIDENCIA", "Digest sellado, firmado y anclado al árbol de Merkle.", "SEALED"],
];

const EVIDENCE_CHAIN = [
  ["DIGEST", "SHA-256", "Huella del veredicto y de su contexto mínimo. El contenido sensible nunca se persiste: solo su representación criptográfica."],
  ["MERKLE", "ÁRBOL DE MERKLE", "Los digests del periodo se agregan en una raíz única. Alterar un solo veredicto invalida la raíz publicada."],
  ["FIRMA", "Ed25519", "La raíz se firma con la clave privada del nodo (o del HSM del cliente en Enterprise). La clave pública es verificable por terceros."],
  ["TIEMPO", "RFC 3161 · eIDAS", "Una autoridad de sellado de tiempo cualificada fija el momento exacto de la firma. La evidencia gana valor procesal."],
];

const DEFENSE_VECTORS = [
  ["LLM01 · Prompt Injection", "Manipulación directa o indirecta del modelo para alterar su comportamiento.", "Separación estricta de roles a nivel sintáctico; AST de comandos permitidos.", "0,8 ms", "BENCHMARK"],
  ["LLM02 · Insecure Output Handling", "Salida del modelo consumida sin validación por sistemas posteriores.", "Validación de integridad dicotómica antes de la ejecución.", "1,4 ms", "BENCHMARK"],
  ["LLM06 · Sensitive Information Disclosure", "Exfiltración de PII, PHI o secretos a través del contexto.", "Sanitización k-anónima in-RAM; política de egreso de datos.", "1,2 ms", "BENCHMARK"],
  ["LLM08 · Excessive Agency", "El agente ejecuta acciones más allá de su mandato declarado.", "Puerta de ejecución ex-ante; scope de acción por identidad firmada.", "0,4 ms", "BENCHMARK"],
  ["LLM10 · Unbounded Consumption", "Consumo ilimitado de tokens, cómputo o presupuesto.", "Context Slicing y umbrales deterministas por política.", "1,1 ms", "BENCHMARK"],
];

const INTEROP = [
  ["OPENAI", "GPT-4 · GPT-5 · o-series", "Intercepta las llamadas salientes hacia la API antes de que el prompt abandone su perímetro.", "PROXY / SDK"],
  ["ANTHROPIC", "Claude family", "Control de herramientas (tool-use) y de acciones autónomas sobre recursos corporativos.", "PROXY / SDK"],
  ["GOOGLE", "Gemini family", "Gobernanza del tráfico multimodal con la misma política declarativa.", "PROXY"],
  ["MODELOS LOCALES", "Llama · Mistral · DeepSeek", "Daemon local para inferencia privada: el control vive donde vive el modelo.", "DAEMON"],
];

const DEPLOYMENT = [
  ["VPC PRIVADA", "El nodo se despliega dentro de su nube virtual. Sus claves, sus políticas, su red.", "Nodo con Custodia"],
  ["PRIVATE CLOUD", "Clúster Kubernetes gestionado por su equipo con Helm chart firmado.", "Nodo con Custodia / Enterprise"],
  ["ON-PREMISE", "Servidor físico o virtual en su centro de datos. Systemd o servicio Windows.", "Enterprise"],
  ["AIR-GAPPED", "Red aislada sin salida a Internet. Actualización de políticas por paquete firmado offline.", "Enterprise"],
];

const TELEMETRIA_SALE = [
  "Contadores numéricos de veredictos (ALLOW / DENY / REVIEW)",
  "Estado y versión de la política activa",
  "Digest criptográfico SHA-256 de los veredictos",
  "Identificador técnico del nodo desplegado",
  "Métricas de latencia de aplicación del motor",
];
const TELEMETRIA_NO_SALE = [
  "Prompts ni respuestas del modelo en texto claro",
  "Datos personales (PII / PHI) ni identificadores de usuario",
  "Secretos corporativos, claves de API ni credenciales",
  "Contenido de conversaciones ni documentos procesados",
  "Topología interna de su infraestructura",
];

const BUEN_USO = [
  ["HUMAN-IN-THE-LOOP", "El veredicto REVIEW deriva la acción a un operador humano. Ninguna decisión de alto impacto se automatiza sin vía de escalado."],
  ["GOBERNANZA VIVA", "Las políticas se versionan y firman. Cada cambio queda registrado con autoría y marca de tiempo: la gobernanza es auditable."],
  ["PROPÓSITO DECLARADO", "S.A.A.R.E. es infraestructura de contención y prueba. No es una herramienta de vigilancia de personas ni de perfilado de empleados."],
  ["TRANSPARENCIA RADICAL", "Todo dato mostrado declara su naturaleza (DEMO, BENCHMARK, REFERENCE, LIVE). Ningún ejemplo se presenta como promesa universal."],
];

const PARTNER_ENTREGABLES = [
  ["ENTREGABLE 01", "Informe de gobernanza de IA", "Documento técnico que acredita la implantación del plano de control, firmado y verificable."],
  ["ENTREGABLE 02", "Matriz de cumplimiento operativo", "Trazabilidad de obligaciones (EU AI Act, DORA, NIS 2, RGPD) a controles ejecutables con evidencia asociada."],
  ["ENTREGABLE 03", "Expediente de evidencia sellada", "Muestra de la cadena de custodia del cliente: raíz Merkle, firma Ed25519 y sello RFC 3161."],
];

/* CATÁLOGO DE LICENCIAS CON CONFIGURACIÓN DE PAGO DIRECTO */
const CATALOGO = [
  {
    id: "nodo-base",
    priceId: "price_nodo_base_149eur",
    path: "/licencias/nodo-base",
    grupo: "NODOS",
    etiqueta: "NODO BASE",
    nombre: "Nodo Base PEP L7",
    claim: "Contención determinista sin custodia de evidencias.",
    precio: "149 €",
    priceAmount: 149,
    sufijo: "/mes",
    unidad: "Por nodo desplegado",
    comprador: "Quien despliega agentes propios",
    descripcion:
      "El motor de contención en memoria volátil, con intercepción L7 síncrona y veredicto binario. No incluye custodia persistente de evidencias: es la puerta de entrada a la plataforma.",
    features: [
      "Motor de decisión en RAM (1,16 ms · BENCHMARK)",
      "Intercepción L7 síncrona",
      "Veredictos ALLOW / DENY; REVIEW en capa de gobierno",
      "Evaluación de las 7 dimensiones de control",
      "Modo Fail-Closed configurable",
      "Sin custodia persistente de evidencias",
    ],
    noIncluye: ["Sellado continuo de evidencias", "Dossier judicial exportable", "Consola de cumplimiento"],
    ideal: ["Pymes que despliegan sus primeros agentes", "Equipos que solo necesitan el bloqueo", "Pruebas de concepto antes de escalar"],
    cta: "COMPRAR NODO BASE (149 €/mes) 💳",
    type: "checkout",
    featured: false,
  },
  {
    id: "nodo-custodia",
    priceId: "price_nodo_custodia_290eur",
    path: "/licencias/nodo-custodia",
    grupo: "NODOS",
    etiqueta: "NODO CON CUSTODIA",
    nombre: "Nodo con Custodia Forense",
    claim: "Control continuo con prueba exportable.",
    precio: "290 €",
    priceAmount: 290,
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
      "Consola de cumplimiento con las cuatro superficies RBAC",
    ],
    noIncluye: ["HSM corporativo dedicado", "SLA del 99,99 %", "Despliegue air-gapped"],
    ideal: ["CISO y DPO con auditoría periódica", "Banca y seguros de tamaño medio", "Organizaciones que deben probar cumplimiento"],
    cta: "COMPRAR CON CUSTODIA (290 €/mes) 💳",
    type: "checkout",
    featured: true,
  },
  {
    id: "nodo-enterprise",
    priceId: "price_nodo_enterprise_custom",
    path: "/licencias/nodo-enterprise",
    grupo: "NODOS",
    etiqueta: "ENTERPRISE",
    nombre: "Nodo Soberano Enterprise",
    claim: "Despliegue aislado con contrato marco y SLA.",
    precio: "3.500 €",
    priceAmount: 3500,
    sufijo: "/mes",
    unidad: "Por nodo con HSM y SLA",
    comprador: "Sector regulado, banca, defensa y público",
    descripcion:
      "Despliegue perimetral aislado para infraestructuras críticas. El nodo vive dentro de su VPC o en arquitectura air-gapped, con claves gestionadas por el cliente y soporte de Nivel 3.",
    features: [
      "Despliegue en VPC privada o Air-Gapped",
      "Integración con HSM corporativo (PKCS#11)",
      "Claves de cifrado gestionadas por el cliente",
      "SLA Enterprise definido contractualmente",
      "Soporte técnico dedicado 24/7 de Nivel 3",
      "Despliegue en clústeres de Kubernetes / Helm",
    ],
    noIncluye: [],
    ideal: ["Infraestructuras críticas y defensa", "Administraciones públicas", "Entidades bajo contrato marco"],
    cta: "SOLICITAR PROPUESTA ENTERPRISE ↗",
    type: "contact",
    featured: false,
  },
  {
    id: "evidencias",
    priceId: "price_sellos_120eur",
    path: "/licencias/evidencias",
    grupo: "MEDICIÓN",
    etiqueta: "EVIDENCIAS",
    nombre: "Paquete de Sellado eIDAS",
    claim: "Consumo medido en veredictos sellados.",
    precio: "120 €",
    priceAmount: 120,
    sufijo: "/mes · 1.000 sellos",
    unidad: "Por paquete de 1.000 sellos",
    comprador: "Volumen alto de veredictos sellados",
    descripcion:
      "El consumo puro del motor: se paga proporcionalmente al uso real. Cada sello incorpora una marca de tiempo RFC 3161 y puede formar parte de una evidencia verificable.",
    features: [
      "1.000 sellos RFC 3161 al mes",
      "Exceso facturado por sello adicional",
      "Descuento por volumen superior a un millón",
      "Aplicable a cualquier nodo desplegado",
    ],
    noIncluye: [],
    ideal: ["Operación con miles de veredictos diarios", "Nodos con custodia ya contratada", "Escalado sin cambiar de tramo"],
    cta: "COMPRAR SELLOS (120 €/mes) 💳",
    type: "checkout",
    featured: false,
  },
  {
    id: "forense",
    priceId: "price_pericial_1200eur",
    path: "/licencias/forense",
    grupo: "PERICIAL",
    etiqueta: "FORENSE",
    nombre: "Licencia Estación Pericial",
    claim: "Verificación independiente, cobrada por caso.",
    precio: "1.200 €",
    priceAmount: 1200,
    sufijo: "/año + 300 €/dossier",
    unidad: "Licencia anual más emisión",
    comprador: "Peritos, despachos y asesoría jurídica",
    descripcion:
      "El instrumento del perito. Bóveda ciega, validador Ed25519 contra la clave pública del nodo y exportación de un dossier para análisis pericial.",
    features: [
      "Verificación independiente sin confiar en el vendedor",
      "Exportación de dossiers con sello RFC 3161",
      "Acceso a la bóveda ciega y al validador Ed25519",
      "Dossier de muestra descargable sin registro",
      "Soporte técnico para la ratificación en sala",
    ],
    noIncluye: [],
    ideal: ["Peritos ciberinformáticos", "Despachos de litigio tecnológico", "Departamentos de fraude y arbitraje"],
    cta: "CONTRATAR LICENCIA ANUAL (1.200 €) 💳",
    type: "checkout",
    featured: false,
  },
  {
    id: "canal",
    priceId: "price_partner_450eur",
    path: "/licencias/canal",
    grupo: "DISTRIBUCIÓN",
    etiqueta: "CANAL",
    nombre: "Programa Partner Multi-Tenant",
    claim: "Venda gobernanza de IA sin construirla.",
    precio: "Desde 450 €",
    priceAmount: 450,
    sufijo: "/cliente/año",
    unidad: "Por cliente gestionado",
    comprador: "Consultoras, MSP y agentes digitalizadores",
    descripcion:
      "Licenciamiento marca blanca para quien audita a otros. Cada cliente gestionado con su política, su clave y su cadena de prueba independiente, más la documentación justificativa.",
    features: [
      "Portal multi-tenant con clientes ilimitados",
      "Configuración de políticas por cliente",
      "Documentación justificativa de ayudas generada automáticamente",
      "Soporte técnico para su propio equipo",
      "Tres entregables homologados para el Kit Consulting",
    ],
    noIncluye: [],
    ideal: ["Agentes digitalizadores del Kit Consulting", "Consultoras de cumplimiento normativo", "Integradores con cartera pyme"],
    cta: "ACTIVAR PROGRAMA PARTNER (450 €) 💳",
    type: "checkout",
    featured: false,
  },
];

const VISTAS_CONSOLA = {
  executive: {
    id: "executive",
    badge: "VISTA BOARD / EXECUTIVE",
    titular: "Gobernanza cuantitativa y blindaje de responsabilidad",
    pageTitle: "Cuánta responsabilidad está asumiendo su automatización",
    pageDesc:
      "Cuadro de mando para dirección: riesgo operativo acumulado, consumo por área, continuidad de negocio y exposición legal derivada de cada agente autónomo en producción. Convierte el gobierno de IA en una cifra que el consejo puede evaluar.",
    pregunta: "¿Qué riesgo está asumiendo el negocio?",
    owner: "CEO · Junta directiva · Dirección jurídica",
    rol: "BOARD_EXECUTIVE_LEVEL_1",
    metricas: [
      ["RIESGO ACUMULADO EX-ANTE", "0,02 %", "DEMO"],
      ["TOKENS INTERCEPTADOS / MES", "142.800 €", "DEMO"],
      ["AGENTES EN PRODUCCIÓN", "37 trazados", "DEMO"],
      ["EXPOSICIÓN BAJO DORA", "MITIGADA", "DEMO"],
    ],
    seccionMatriz: "OBLIGACIÓN DE CONSEJO",
    tituloMatriz: "Qué obligación cubre y qué puede demostrar",
    leadMatriz:
      "Cada fila es una obligación que recae sobre la dirección, el control que la atiende y el documento que puede entregar ante un consejo, aseguradora o inversor.",
    matriz: [
      ["EU AI Act art. 14", "Supervisión humana efectiva", "Cambio de política en vivo sin reiniciar sistemas", "Registro de cambio de política firmado"],
      ["EU AI Act art. 15", "Precisión y robustez del sistema", "Contención fail-closed y tolerancia estructural", "Veredicto firmado con su latencia"],
      ["DORA art. 5", "Gobernanza y responsabilidad de la dirección", "Políticas locales firmadas sin dependencia de red", "Registro técnico de autonomía de nodo"],
      ["DORA art. 9", "Protección y prevención de incidentes TIC", "Intercepción ex-ante contra vectores L7", "Registro de intercepción sellado"],
      ["NIS 2 art. 20", "Responsabilidad de la alta dirección", "Telemetría determinista sin contenido ni PII", "Contadores anónimos firmados"],
    ],
    seccionInventario: "PARQUE AUTORIZADO",
    tituloInventario: "Qué agentes están bajo control hoy",
    leadInventario:
      "El consejo no necesita ver la infraestructura: necesita saber cuántos agentes operan, bajo qué política y con qué resultado.",
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
    tramoCta: "COMPRAR CON CUSTODIA (290 €/mes) 💳",
  },
  grc: {
    id: "grc",
    badge: "VISTA GRC / PRIVACIDAD",
    titular: "La prueba llegó antes que el litigio",
    pageTitle: "La prueba llegó antes que el litigio",
    pageDesc:
      "Matriz de trazabilidad normativa contra el EU AI Act, DORA, NIS 2, RGPD e ISO/IEC 27037, con exportación de Proof Bundles firmados y sellados con marca de tiempo cualificada.",
    pregunta: "¿Qué controles puedo demostrar?",
    owner: "CISO · DPO · Auditoría externa",
    rol: "DPO_GRC_LEVEL_2",
    metricas: [
      ["ENMASCARAMIENTO PII", "DNI · IBAN · Tarjetas · PHI", "REFERENCE"],
      ["CLASIFICACIÓN AI ACT", "Inaceptable · Alto · Limitado", "REFERENCE"],
      ["RGPD ART. 32", "Arquitectura Zero-Disk", "REFERENCE"],
      ["REGISTRO EIPD", "Inmutable y firmado", "REFERENCE"],
    ],
    seccionMatriz: "TRAZABILIDAD NORMATIVA",
    tituloMatriz: "Matriz de requisito a veredicto",
    leadMatriz:
      "De la norma al veredicto, sin traducción manual. Cada fila mapea una obligación a un control ejecutable y a la evidencia que genera.",
    matriz: [
      ["EU AI Act art. 10", "Gobernanza de datos de contexto", "Generalización y seudonimización ex-ante", "Registro de política de datos aplicada"],
      ["EU AI Act art. 12", "Registro automático de eventos", "Registro en memoria sin violar minimización", "Huella criptográfica del veredicto"],
      ["RGPD art. 5", "Minimización de datos personales", "Zeroización tras la firma, sin persistencia", "Digest HMAC-SHA256 del payload"],
      ["RGPD art. 32", "Seguridad y cifrado del tratamiento", "Sanitización en RAM y arquitectura Zero-Disk", "Registro de no exfiltración"],
      ["ISO/IEC 27037", "Identificación de evidencia digital", "Cadena de Merkle y firma asimétrica", "Dossier forense verificable offline"],
      ["Arts. 281 y 326 LEC", "Evidencia documental verificable", "Sellado cualificado y cadena de custodia", "Expediente exportable para revisión pericial"],
    ],
    seccionInventario: "EXPEDIENTES BAJO CUSTODIA",
    tituloInventario: "Evidencias selladas y verificables",
    leadInventario: "Cada entrada es un expediente con su cadena de custodia completa.",
    inventario: [
      ["VRD-2026-0917-88A1F", "Veredicto DENY", "policy: POL-EU-AIACT-ART15", "RFC 3161", "VERIFIED"],
      ["VRD-2026-0916-4C09B", "Veredicto ALLOW", "policy: POL-LOG-IMMUTABLE", "RFC 3161", "VERIFIED"],
      ["EIPD-2026-014", "Evaluación de impacto", "policy: POL-PII-EGRESS", "Firma Ed25519", "VERIFIED"],
    ],
    superficieSeccion: "SUPERFICIE DE AUDITORÍA",
    superficieTitulo: "Estado del expediente",
    superficie: [
      ["POLICY_STATE", "SIGNED_BY_HSM_KEY_0x9F (v2.4.1)"],
      ["COBERTURA NORMATIVA", "94 % mapeados · DEMO"],
      ["PROOF BUNDLES EMITIDOS", "1.284 este trimestre · DEMO"],
      ["ÚLTIMA VERIFICACIÓN EXTERNA", "Sin incidencias"],
      ["PENDIENTE DE CIERRE", "2 requisitos en revisión"],
    ],
    tramoRecomendado: "nodo-custodia",
    tramoCta: "COMPRAR CON CUSTODIA (290 €/mes) 💳",
  },
  cyber: {
    id: "cyber",
    badge: "VISTA CISO / RESILIENCIA",
    titular: "Ve cada intercepción mientras ocurre",
    pageTitle: "Ve cada intercepción mientras ocurre",
    pageDesc:
      "Monitorización síncrona de intercepciones de capa 7: inyección de prompt, fuga de PII y vectores del OWASP LLM Top 10, con inspección de cada veredicto y su latencia.",
    pregunta: "¿Qué está bloqueando el motor ahora?",
    owner: "SOC · SecOps · Threat hunters",
    rol: "CISO_SECOPS_LEVEL_3",
    metricas: [
      ["PROMPT INJECTION L7", "Intercepción en tiempo real", "REFERENCE"],
      ["SHADOW AI", "Descubrimiento automático", "REFERENCE"],
      ["ESTADO FAIL-CLOSED", "100 % activo", "REFERENCE"],
      ["LATENCIA DE APLICACIÓN", "1,18 ms", "BENCHMARK"],
    ],
    seccionMatriz: "VECTORES NEUTRALIZADOS",
    tituloMatriz: "Contención por vector de ataque",
    leadMatriz:
      "Cada fila es un vector del OWASP LLM Top 10, el mecanismo determinista que lo neutraliza y la latencia medida en banco de pruebas.",
    matriz: [
      ["LLM01 · Prompt Injection", "Manipulación directa del modelo", "Separación estricta de roles a nivel sintáctico", "0,8 ms · BENCHMARK"],
      ["LLM02 · Insecure Output", "Salida no validada hacia sistemas", "Validación de integridad dicotómica", "1,4 ms · BENCHMARK"],
      ["LLM06 · Sensitive Info", "Exfiltración de datos sensibles", "Sanitización k-anónima in-RAM", "1,2 ms · BENCHMARK"],
      ["LLM08 · Excessive Agency", "Acciones fuera de política", "Puerta de ejecución ex-ante", "0,4 ms · BENCHMARK"],
      ["LLM10 · Unbounded Consumption", "Consumo ilimitado de recursos", "Context Slicing y umbral determinista", "1,1 ms · BENCHMARK"],
    ],
    seccionInventario: "TRÁFICO INTERCEPTADO",
    tituloInventario: "Intercepciones en las últimas 24 horas",
    leadInventario:
      "Cada línea es una intercepción con su vector, su nodo de origen y su resultado. La telemetría es numérica: nunca contiene el texto ni los datos personales.",
    inventario: [
      ["10:42:07.118", "node-proxy-ingress-01", "LLM01 · Inyección directa", "0,8 ms", "DENY"],
      ["10:41:52.004", "node-sdk-payment-api", "LLM06 · Fuga de PII", "1,2 ms", "DENY"],
      ["10:41:19.771", "node-daemon-finance", "LLM08 · Agencia excesiva", "0,4 ms", "DENY"],
    ],
    superficieSeccion: "TELEMETRÍA DE BORDE",
    superficieTitulo: "Estado del motor en vivo",
    superficie: [
      ["NODE_STATUS", "ONLINE (0,84 ms · BENCHMARK)"],
      ["INTERCEPCIONES 24 H", "4.891 bloqueadas · DEMO"],
      ["VECTORES ACTIVOS", "5 del OWASP LLM Top 10"],
      ["CONMUTACIÓN FAIL-CLOSED", "Instantánea, sin reinicio"],
      ["PUNTOS CIEGOS DETECTADOS", "0"],
    ],
    tramoRecomendado: "evidencias",
    tramoCta: "COMPRAR SELLOS (120 €/mes) 💳",
  },
  forense: {
    id: "forense",
    badge: "VISTA FORENSE / PERICIAL",
    titular: "Verifique la evidencia sin confiar en nosotros",
    pageTitle: "Verifique la evidencia sin confiar en nosotros",
    pageDesc:
      "Estación pericial independiente: bóveda ciega de evidencias, validación Ed25519 contra la clave pública del nodo y exportación de dossier procesal conforme a los Arts. 281 y 326 LEC e ISO/IEC 27037.",
    pregunta: "¿Puedo verificar la evidencia independientemente?",
    owner: "Peritos · Despachos · Departamentos de fraude",
    rol: "FORENSIC_EXTERNAL_LEVEL_4",
    metricas: [
      ["CADENA DE CUSTODIA", "Digest · Merkle · Ed25519 · RFC 3161", "REFERENCE"],
      ["VERIFICACIÓN", "Independiente, offline, por CLI", "REFERENCE"],
      ["BÓVEDA", "Ciega: sin acceso al contenido", "REFERENCE"],
      ["VALOR PROCESAL", "Arts. 281 / 326 LEC", "REFERENCE"],
    ],
    seccionMatriz: "MARCO PROCESAL",
    tituloMatriz: "De la evidencia técnica a la prueba en sala",
    leadMatriz:
      "Cada fila conecta un requisito procesal con el mecanismo criptográfico que lo satisface y el artefacto que el perito puede ratificar.",
    matriz: [
      ["Art. 326 LEC", "Reconocimiento de documentos privados", "Dossier firmado y sellado con marca cualificada", "Expediente exportable verificable"],
      ["Art. 299 LEC", "Valoración de la prueba pericial", "Verificación independiente por tercero cualificado", "Informe pericial sobre la cadena"],
      ["ISO/IEC 27037", "Gestión de evidencia digital", "Identificación, recolección y preservación selladas", "Cadena de custodia documentada"],
      ["eIDAS (Reg. 910/2014)", "Sello de tiempo cualificado", "Marcado RFC 3161 por autoridad reconocida", "Token de tiempo verificable offline"],
    ],
    seccionInventario: "EXPEDIENTES DE MUESTRA",
    tituloInventario: "Dossiers disponibles para validación",
    leadInventario:
      "Expedientes de demostración con su raíz Merkle pública. El perito puede verificarlos con herramientas propias, sin software del vendedor.",
    inventario: [
      ["DOSSIER-2026-0042", "Exfiltración PII contenida", "merkle: 6f1b…a842", "Ed25519 · RFC 3161", "VERIFIED"],
      ["DOSSIER-2026-0038", "Pago no autorizado denegado", "merkle: 9c21…77f0", "Ed25519 · RFC 3161", "VERIFIED"],
    ],
    superficieSeccion: "ESTACIÓN PERICIAL",
    superficieTitulo: "Estado del verificador",
    superficie: [
      ["MODO DE VERIFICACIÓN", "Offline · clave pública del nodo"],
      ["DEPENDENCIA DEL VENDEDOR", "Ninguna para validar"],
      ["DOSSIER DE MUESTRA", "Descargable sin registro"],
      ["SOPORTE EN SALA", "Incluido en la licencia anual"],
    ],
    tramoRecomendado: "forense",
    tramoCta: "CONTRATAR LICENCIA ANUAL (1.200 €) 💳",
  },
};

const SEO_CONFIG = {
  home: {
    title: "S.A.A.R.E. SGP 1.0 | Infraestructura de Autorización Ex-Ante para IA",
    description:
      "Convertimos políticas de uso de IA en decisiones ejecutables antes de la acción. Control L7, motor de respuesta determinista y evidencia criptográfica.",
  },
  producto: {
    title: "Producto | Consola Unificada (BOARD, GRC, CISO, FORENSE)",
    description:
      "Una sola consola para cuatro lecturas del mismo sistema: riesgo ejecutivo, cumplimiento normativo, resiliencia técnica y peritaje.",
  },
  forensic: {
    title: "Forense | Evidence Vault y Verificación Independiente S.A.A.R.E.",
    description:
      "Bóveda ciega de evidencias con firma Ed25519, sellado de tiempo eIDAS RFC 3161 y trazabilidad procesal conforme al Art. 326 LEC.",
  },
  dev: {
    title: "Desarrolladores | SDK, Proxy y Daemon S.A.A.R.E.",
    description:
      "Tres modos de ejecución para un mismo motor de decisión: LabEngine (SDK), PerimeterShield (Proxy L7) y servicio On-Premise.",
  },
  canal: {
    title: "Canal | Partners MSP y Agentes Digitalizadores",
    description:
      "Programa de partners multi-tenant. Entregables técnicos verificables y soporte para programas de digitalización corporativa.",
  },
  trial: {
    title: "Prueba de Control | Someta un Agente a Evaluación",
    description:
      "Evaluación cualificada para desplegar el plano de control S.A.A.R.E. SGP 1.0 en su VPC o infraestructura privada.",
  },
  login: {
    title: "Acceso SOC | Consola S.A.A.R.E.",
    description:
      "Acceso restringido a personal autorizado. Autenticación con registro firmado de cada inicio de sesión.",
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

function DataLabel({ type }) {
  const conf = METRIC_LABELS[type] || METRIC_LABELS.DEMO;
  return (
    <span className={`inline-block font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border tracking-widest ${conf.cls}`}>
      {conf.text}
    </span>
  );
}

function MetricCard({ label, value, tag = "DEMO" }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg font-mono">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest">{label}</span>
        <DataLabel type={tag} />
      </div>
      <div className="text-white font-bold text-base mt-2">{value}</div>
    </div>
  );
}

function AppShell({ children }) {
  const location = useLocation();

  const active = useMemo(() => {
    const path = location.pathname;
    if (path === "/" || path === "/auditoria" || path === "/producto" || path === "/producto/auditoria") return "auditoria";
    if (path === "/cumplimiento" || path.startsWith("/producto/") || path === "/grc") return "cumplimiento";
    if (path === "/forense") return "forense";
    if (path === "/ventas" || path === "/sales" || path === "/canal") return "ventas";
    if (path === "/sdk" || path.startsWith("/dev/sdk")) return "sdk";
    if (path === "/proxy" || path.startsWith("/dev/proxy") || path === "/software") return "proxy";
    if (path === "/daemon" || path.startsWith("/dev/daemon")) return "daemon";
    return "auditoria";
  }, [location.pathname]);

  const isAuthRoute = ["/login", "/auth", "/acceso"].includes(location.pathname);

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

  const isTrialSession = sessionUser && String(sessionUser.plan || "").toUpperCase().includes("TRIAL");

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-sky-500 selection:text-black">
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-center text-[10px] sm:text-xs font-mono text-slate-500">
        <span className="text-sky-400 font-bold">S.A.A.R.E. SGP 1.0</span>
        <span className="mx-2">·</span>
        Infraestructura de autorización ex-ante y gobernanza runtime L7
      </div>

      <header className="sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="S.A.A.R.E. Inicio">
              <span className="font-bold text-2xl tracking-tight text-white font-display">S.A.A.R.E.</span>
              <span className="font-mono text-[10px] bg-sky-500/10 border border-sky-500/30 text-sky-400 px-2 py-0.5 rounded font-bold">SGP 1.0</span>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              {sessionUser ? (
                <Link
                  to="/producto/cumplimiento"
                  className={`hidden sm:inline-flex px-3.5 py-2 text-[10px] font-mono font-bold rounded border transition ${
                    isTrialSession
                      ? "border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                      : "border-sky-500/50 text-sky-300 hover:bg-sky-500/10"
                  }`}
                >
                  {isTrialSession ? "PRUEBA" : "CONSOLE"}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 text-[10px] font-mono font-bold rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  ACCESO SOC ↗
                </Link>
              )}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex px-3.5 py-2 text-[10px] font-mono font-bold rounded bg-emerald-500 text-black hover:bg-emerald-400 transition"
              >
                ENTERPRISE ↗
              </a>
            </div>
          </div>

          <nav aria-label="Navegación principal" className="mt-3 flex items-stretch gap-1 overflow-x-auto pb-1 border-t border-slate-800/80 pt-2 scrollbar-none">
            {NAV.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                aria-current={active === item.id ? "page" : undefined}
                className={`shrink-0 px-3 py-2 rounded border transition-all text-left min-w-fit ${
                  active === item.id
                    ? "bg-sky-500/12 border-sky-500/40 text-sky-300"
                    : "border-transparent hover:bg-slate-800/50 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wide">{item.label}</div>
                <div className="text-[9px] text-slate-500 uppercase mt-0.5">{item.description}</div>
              </Link>
            ))}
          </nav>

          {!isAuthRoute && (active === "cumplimiento" || active === "sdk" || active === "proxy" || active === "daemon") && (
            <div className="flex items-center gap-4 pt-2 border-t border-slate-800/60 text-[10px] sm:text-[11px] font-mono overflow-x-auto">
              <span className="text-slate-600 uppercase tracking-wider shrink-0">Vista:</span>
              {active === "cumplimiento" && (
                <>
                  <Link to="/producto/executive" className={location.pathname === "/producto/executive" ? "text-sky-400 font-bold shrink-0" : "text-slate-400 hover:text-slate-200 shrink-0"}>BOARD_EXECUTIVE</Link>
                  <Link to="/producto/grc" className={location.pathname === "/producto/grc" ? "text-sky-400 font-bold shrink-0" : "text-slate-400 hover:text-slate-200 shrink-0"}>GRC_AUDIT</Link>
                  <Link to="/producto/cyber" className={location.pathname === "/producto/cyber" ? "text-sky-400 font-bold shrink-0" : "text-slate-400 hover:text-slate-200 shrink-0"}>CYBER_RESILIENCE</Link>
                  <Link to="/forense" className="text-slate-400 hover:text-slate-200 shrink-0">FORENSIC_EXTERNAL</Link>
                </>
              )}
              {active === "sdk" && <Link to="/dev/sdk" className="text-slate-300 hover:text-sky-400 shrink-0">LabEngine / SDK nativo</Link>}
              {active === "proxy" && <Link to="/dev/proxy" className="text-slate-300 hover:text-sky-400 shrink-0">PerimeterShield / Proxy</Link>}
              {active === "daemon" && <Link to="/dev/daemon" className="text-slate-300 hover:text-sky-400 shrink-0">Servicio local / On-Premise</Link>}
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
        <h1 className="font-bold text-3xl sm:text-5xl text-white mt-4 tracking-tight leading-tight font-display">{title}</h1>
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

function CtaButton({ ctaText, item, href = WHATSAPP_URL, full = true }) {
  if (item && item.type === "checkout") {
    return (
      <button
        onClick={() => saareCheckout(item.id)}
        className={`${full ? "block w-full" : "inline-block"} text-center px-5 py-3 bg-emerald-500 text-black font-bold text-xs rounded hover:bg-emerald-400 transition cursor-pointer`}
      >
        {ctaText}
      </button>
    );
  }

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

  const handleAction = (e) => {
    if (item.type === "checkout") {
      e.preventDefault();
      saareCheckout(item.id);
    }
  };

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
      <div className="mt-6 space-y-2">
        {item.type === "checkout" ? (
          <button
            onClick={handleAction}
            className="block w-full text-center px-5 py-3 bg-emerald-500 text-black font-bold text-xs rounded hover:bg-emerald-400 transition cursor-pointer"
          >
            {item.cta}
          </button>
        ) : (
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center px-5 py-3 bg-sky-500 text-black font-bold text-xs rounded hover:bg-sky-400 transition"
          >
            {item.cta}
          </a>
        )}
        <Link
          to={item.path}
          className="block w-full text-center px-5 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-[10px] rounded hover:bg-slate-800/50 transition"
        >
          VER DETALLE TÉCNICO →
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
                <td key={ci} className={`py-3 pr-4 align-top leading-relaxed ${ci === 0 ? "font-bold text-white whitespace-nowrap" : ""}`}>
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

function PolicyEnginePanel() {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/50">
        <span className="font-mono text-[10px] tracking-widest text-slate-400">POLICY ENGINE · saare_console</span>
        <DataLabel type="REFERENCE" />
      </div>
      <div className="p-6 font-mono text-xs space-y-3">
        <DataRow label="POLICY" value="FIN-PAYMENT-042" />
        <DataRow label="VERSION" value="17 · firmada HSM" />
        <DataRow label="AGENT" value="treasury-agent-04" />
        <DataRow label="ACTION" value="SEND_PAYMENT" />
        <DataRow label="RESOURCE" value="core-banking-api://transfers" />
        <DataRow label="RISK" value="HIGH · OUTBOUND" />
        <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
          <span className="text-slate-500">RESULT</span>
          <VerdictChip verdict="DENY" />
        </div>
        <DataRow label="PERMIT" value="NOT_ISSUED" />
      </div>
    </div>
  );
}

function EvidenceChainPanel() {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/50">
        <span className="font-mono text-[10px] tracking-widest text-slate-400">EVIDENCE VAULT · CADENA DE CUSTODIA</span>
        <DataLabel type="REFERENCE" />
      </div>
      <div className="p-6 font-mono text-xs space-y-3">
        <DataRow label="DIGEST" value="SHA-256 · e3b0c44298fc1c14…" />
        <DataRow label="MERKLE ROOT" value="6f1b3986…c7f1a842" />
        <DataRow label="SIGNATURE" value="Ed25519 · HSM_KEY_0x9F" />
        <DataRow label="TIMESTAMP" value="RFC 3161 · eIDAS cualificado" />
        <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
          <span className="text-slate-500">STATUS</span>
          <VerdictChip verdict="VERIFIED" />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   LANDING PRINCIPAL / MOTOR DE REFERENCIA
   ========================================================================== */
function TabAuditoriaPublica() {
  useSEO("home");

  const [hash, setHash] = useState(DEMO_ROOT_MERKLE_HASH);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    const query = hash.trim();
    if (!query) return;
    setLoading(true);
    setVerifyResult(null);
    try {
      const response = await saareFetch(`/v1/verify/${encodeURIComponent(query)}`);
      const data = await response.json().catch(() => ({}));
      const confirmed = response.ok && data?.status === "VERIFIED";
      setVerifyResult({
        status: confirmed ? "VERIFIED" : "UNVERIFIABLE",
        hash: query,
        timestamp: confirmed ? data?.timestamp || null : null,
        standard: data?.standard || "RFC 3161",
        algorithm: data?.algorithm || "Ed25519 / SHA-256",
        reason: confirmed ? null : "El Trust Anchor no confirmó este registro.",
      });
    } catch {
      setVerifyResult({
        status: "ERROR",
        hash: query,
        timestamp: null,
        standard: "RFC 3161",
        algorithm: "Ed25519 / SHA-256",
        reason: "No se pudo contactar con el Trust Anchor. El registro permanece sin verificar.",
      });
    } finally {
      setLoading(false);
    }
  }

  const softwarePackages = [
    ["01", "LabEngine", "SDK Nativo", "Desarrollo · RAG · Agentes autónomos"],
    ["02", "PerimeterShield", "Proxy L7", "Red · Clústeres Kubernetes · Perímetro"],
    ["03", "EvidenceVault", "Estación Forense", "SOC · Peritaje · Auditoría independiente"],
    ["04", "ComplianceSuite", "Consola Unificada", "Board · GRC · CISO"],
  ];

  return (
    <main>
      {/* 01 · HERO + DECISION TRACE */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#020617]">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 lg:pt-16 lg:pb-24">
          <div className="grid xl:grid-cols-[1.1fr_.9fr] gap-12 items-center">
            <div>
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded">
                GOBERNANZA EJECUTABLE
              </span>

              <h1 className="font-display font-bold text-4xl sm:text-6xl text-white tracking-tight leading-[1.02] mt-6">
                Sus agentes de IA actúan.<br />
                <span className="text-sky-300">S.A.A.R.E. decide antes.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
                Convierte las políticas de uso de IA en una decisión ejecutable
                antes de que la acción alcance el sistema.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/trial" className="px-6 py-3.5 rounded bg-sky-500 text-black font-mono text-xs font-bold hover:bg-sky-400 transition">
                  VER LA DECISIÓN ↗
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="px-6 py-3.5 rounded border border-slate-700 text-slate-200 font-mono text-xs font-bold hover:bg-slate-900 transition">
                  SOLICITAR ARQUITECTURA ENTERPRISE ↗
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6 font-mono text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ALLOW / DENY</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> EX-ANTE</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> FAIL-CLOSED</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/50">
                <span className="font-mono text-[10px] tracking-widest text-slate-400">S.A.A.R.E. / DECISION TRACE</span>
                <DataLabel type="REFERENCE" />
              </div>
              <div className="p-6 font-mono text-xs space-y-3">
                <DataRow label="AGENT" value="treasury-agent-04" />
                <DataRow label="ACTION" value="SEND_PAYMENT" />
                <DataRow label="RESOURCE" value="core-banking-api://transfers" />
                <DataRow label="POLICY" value="FIN-PAYMENT-042 (v17)" />
                <DataRow label="RISK" value="HIGH · OUTBOUND" />
                <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-slate-500">VERDICT</span>
                  <VerdictChip verdict="DENY" />
                </div>
                <div className="text-[9px] text-slate-600 pt-2 border-t border-slate-900 break-all">
                  MERKLE ROOT: {DEMO_ROOT_MERKLE_HASH}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 · PUBLIC TRUST ANCHOR */}
      <section id="trust-anchor" className="border-b border-slate-800 bg-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[.85fr_1.15fr] gap-8 items-center">
            <div>
              <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">PUBLIC TRUST ANCHOR</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">No confíe en nosotros.</h2>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed font-mono">
                Introduzca una evidencia. El sistema consultará el Trust Anchor.
                La interfaz no decide si la evidencia es válida: el registro verificable lo decide.
              </p>
            </div>
            <div>
              <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
                <input
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Merkle Root o ID de evidencia"
                  className="flex-1 bg-slate-950 border border-slate-700 px-4 py-3 text-xs font-mono text-slate-200 rounded focus:outline-none focus:border-amber-400"
                />
                <button type="submit" disabled={loading} className="px-5 py-3 rounded bg-amber-400 text-black font-mono text-xs font-bold hover:bg-amber-300 disabled:opacity-60 transition cursor-pointer">
                  {loading ? "CONSULTANDO..." : "VERIFICAR"}
                </button>
              </form>
              {verifyResult && (
                <div className={`mt-3 rounded border p-4 bg-slate-950 font-mono ${verifyResult.status === "VERIFIED" ? "border-emerald-500/50" : "border-red-500/50"}`}>
                  <div className="flex items-center gap-2">
                    <VerdictChip verdict={verifyResult.status} />
                    <span className="text-xs text-slate-300">{verifyResult.status === "VERIFIED" ? "Registro confirmado en el Trust Anchor" : "Registro no verificable"}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <DataRow label="ALGORITHM" value={verifyResult.algorithm} />
                    <DataRow label="TIMESTAMP" value={verifyResult.standard} />
                    <DataRow label="EVIDENCE" value="MERKLE ROOT" />
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 break-all">{verifyResult.hash}</div>
                  {verifyResult.reason && <div className="mt-2 text-[10px] text-amber-400">{verifyResult.reason}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 03 · DE PAPEL A ENFORCEMENT */}
      <section className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="DE PAPEL A ENFORCEMENT"
            title="Tu política de IA no debería ser solo un documento. Debería poder ejecutarse."
            lead="Un Plan de Uso de IA en papel no detiene una fuga. La misma política, compilada a regla versionada, sí."
          />

          <div className="grid lg:grid-cols-2 gap-8 mt-10">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <div className="font-mono text-[10px] font-bold text-red-400 tracking-widest mb-6">ANTES · GOBIERNO DOCUMENTAL</div>
              <div className="space-y-4 font-mono text-xs">
                {[
                  ["POLÍTICA DE USO DE IA", "Documento aprobado por dirección"],
                  ["PDF", "Distribuido por correo interno"],
                  ["FORMACIÓN", "Sesión anual de concienciación"],
                  ["CONFIANZA EN EL USUARIO", "Sin control técnico efectivo"],
                ].map(([t, d], i, arr) => (
                  <div key={t}>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                      <div className="text-white font-bold">{t}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{d}</div>
                    </div>
                    {i < arr.length - 1 && <div className="text-center text-slate-700 py-1">↓</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-6">
              <div className="font-mono text-[10px] font-bold text-emerald-400 tracking-widest mb-6">CON S.A.A.R.E. · GOBIERNO EJECUTABLE</div>
              <div className="space-y-4 font-mono text-xs">
                {[
                  ["POLÍTICA", "La misma decisión de gobierno"],
                  ["REGLA VERSIONADA", "Compilada a nativo y firmada"],
                  ["DECISIÓN EX-ANTE", "Antes de que la acción ocurra"],
                  ["ALLOW / DENY", "Veredicto binario en el punto de acción"],
                  ["EVIDENCIA", "Digest sellado, firmado y anclado"],
                ].map(([t, d], i, arr) => (
                  <div key={t}>
                    <div className="bg-slate-950 border border-emerald-500/20 p-4 rounded-lg">
                      <div className="text-white font-bold">{t}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{d}</div>
                    </div>
                    {i < arr.length - 1 && <div className="text-center text-emerald-800 py-1">↓</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 text-center font-mono text-xs text-slate-400 bg-slate-900/40 border border-slate-800 p-4 rounded-lg">
            LA POLÍTICA NO DESAPARECE. <span className="text-white font-bold">SE CONVIERTE EN INFRAESTRUCTURA.</span>
          </div>
        </div>
      </section>

      {/* 04 · EL PROBLEMA */}
      <section className="border-b border-slate-800 bg-[#020617] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="font-mono text-[10px] font-bold text-sky-400 tracking-[0.2em]">EL PROBLEMA</span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mt-3 leading-tight">
                Los agentes ya tienen acceso a sus sistemas.<br />
                <span className="text-sky-300">Sus políticas todavía no.</span>
              </h2>
              <p className="mt-5 text-sm text-slate-300 leading-relaxed">
                Un agente autónomo con credenciales puede leer una base de datos, mover fondos
                o enviar información fuera de su perímetro. La mayoría de organizaciones responde
                con un documento de uso responsable: necesario, pero estructuralmente incapaz de
                detener nada. Entre la política y la acción no existe hoy ninguna capa ejecutable.
              </p>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                S.A.A.R.E. es esa capa: un Policy Enforcement Point de capa 7 que evalúa cada
                acción antes de que ocurra y deja una prueba criptográfica de cada decisión.
              </p>
            </div>
            <PolicyEnginePanel />
          </div>
        </div>
      </section>

      {/* 05 · COMPOSICIÓN DE LA ISV */}
      <section className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="COMPOSICIÓN DE LA ISV"
            title="1 Motor. 3 Formas de Ejecución. 4 Paquetes de Software. 1 Consola. 1 Cadena de Evidencia."
            lead="Arquitectura unificada alrededor de un único Runtime PEP L7 determinista. Los modos de ejecución no son productos distintos: son el mismo motor viviendo en puntos distintos de su infraestructura."
          />

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-xs mb-10 overflow-x-auto">
            <div className="min-w-[650px] text-center space-y-4">
              <div className="inline-block bg-sky-500/10 border border-sky-500/40 text-sky-300 px-4 py-2 rounded font-bold">
                S.A.A.R.E. SGP 1.0 · CORE DECISION ENGINE
              </div>
              <div className="text-slate-600">│</div>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="border border-slate-800 bg-slate-900 p-3 rounded">
                  <div className="text-emerald-400 font-bold">SDK</div>
                  <div className="text-[10px] text-slate-400 mt-1">LabEngine</div>
                </div>
                <div className="border border-slate-800 bg-slate-900 p-3 rounded">
                  <div className="text-emerald-400 font-bold">PROXY</div>
                  <div className="text-[10px] text-slate-400 mt-1">PerimeterShield</div>
                </div>
                <div className="border border-slate-800 bg-slate-900 p-3 rounded">
                  <div className="text-emerald-400 font-bold">DAEMON</div>
                  <div className="text-[10px] text-slate-400 mt-1">Local Node</div>
                </div>
              </div>
              <div className="text-slate-600">│</div>
              <div className="inline-block bg-slate-900 border border-slate-800 text-slate-300 px-6 py-2 rounded">
                CONTROL PLANE ── saare_console ── EVIDENCE VAULT
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {softwarePackages.map(([num, name, type, target]) => (
              <div key={name} className="bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-600">{num}</span>
                  <span className="text-sky-400 font-bold">{type}</span>
                </div>
                <div className="text-white font-bold text-base mt-3">{name}</div>
                <div className="text-[11px] text-slate-500 mt-2">{target}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 · DECISIÓN ARQUITECTÓNICA */}
      <section className="border-b border-slate-800 bg-[#020617] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="DECISIÓN ARQUITECTÓNICA"
            title="¿Dónde debe vivir el control?"
            lead="El cliente no cambia la lógica de seguridad. Cambia únicamente el punto de intercepción según su infraestructura."
          />

          <div className="grid md:grid-cols-3 gap-6 mt-10 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold">DENTRO DE SU APLICACIÓN</span>
                <h3 className="text-white font-bold text-lg mt-1 mb-4">SDK · LabEngine</h3>
                <div className="space-y-2 text-slate-400">
                  <DataRow label="CUÁNDO USARLO" value="Agentes y RAG con código accesible" />
                  <DataRow label="CÓMO SE INTEGRA" value="pip / npm / paquete nativo" />
                  <DataRow label="QUÉ CONTROLA" value="Llamadas a funciones y prompts" />
                  <DataRow label="DÓNDE EJECUTA" value="In-process (RAM compartida)" />
                  <DataRow label="CÓMO SE ACTUALIZA" value="Política firmada vía Control Plane" />
                  <DataRow label="QUÉ COMPRA" value="Nodo Base o Nodo con Custodia" />
                </div>
              </div>
              <Link to="/dev/sdk" className="mt-6 text-sky-400 hover:underline block text-right font-bold">DETALLES SDK →</Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold">EN EL TRÁFICO</span>
                <h3 className="text-white font-bold text-lg mt-1 mb-4">PROXY · PerimeterShield</h3>
                <div className="space-y-2 text-slate-400">
                  <DataRow label="CUÁNDO USARLO" value="Tráfico perimetral y APIs de terceros" />
                  <DataRow label="CÓMO SE INTEGRA" value="Docker / Helm K8s / Sidecar" />
                  <DataRow label="QUÉ CONTROLA" value="Peticiones HTTP/REST L7" />
                  <DataRow label="DÓNDE EJECUTA" value="Borde del clúster / Gateway" />
                  <DataRow label="CÓMO SE ACTUALIZA" value="Política firmada vía Control Plane" />
                  <DataRow label="QUÉ COMPRA" value="Nodo Base o Nodo con Custodia" />
                </div>
              </div>
              <Link to="/dev/proxy" className="mt-6 text-sky-400 hover:underline block text-right font-bold">DETALLES PROXY →</Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold">EN EL SERVIDOR</span>
                <h3 className="text-white font-bold text-lg mt-1 mb-4">DAEMON · Local Node</h3>
                <div className="space-y-2 text-slate-400">
                  <DataRow label="CUÁNDO USARLO" value="Redes aisladas y modelos propios" />
                  <DataRow label="CÓMO SE INTEGRA" value="Systemd / Servicio Windows / HSM" />
                  <DataRow label="QUÉ CONTROLA" value="Sockets locales y bus de mensajes" />
                  <DataRow label="DÓNDE EJECUTA" value="On-Premise / Air-Gapped" />
                  <DataRow label="CÓMO SE ACTUALIZA" value="Paquete firmado offline" />
                  <DataRow label="QUÉ COMPRA" value="Nodo Soberano Enterprise" />
                </div>
              </div>
              <Link to="/dev/daemon" className="mt-6 text-sky-400 hover:underline block text-right font-bold">DETALLES DAEMON →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 07 · SIETE DIMENSIONES */}
      <section className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="MODELO DE EVALUACIÓN"
            title="Siete dimensiones resueltas antes de cada acción"
            lead="Cada intento de acción se descompone en siete preguntas. Si alguna dimensión falla contra la política firmada, el veredicto es DENY y no hay ejecución."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10">
            {DIMENSIONS.map(([dim, title, desc]) => (
              <div key={dim} className={`bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono ${dim === "DIM 07" ? "lg:col-span-2 xl:col-span-1" : ""}`}>
                <div className="text-[10px] text-sky-400 font-bold">{dim}</div>
                <div className="text-white font-bold text-sm mt-2">{title}</div>
                <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">{desc}</div>
              </div>
            ))}
            <div className="bg-slate-900/50 border border-dashed border-slate-700 p-5 rounded-lg font-mono flex flex-col justify-center">
              <div className="text-[10px] text-slate-500">RESULTADO</div>
              <div className="flex gap-2 mt-2">
                <VerdictChip verdict="ALLOW" />
                <VerdictChip verdict="DENY" />
                <VerdictChip verdict="REVIEW" />
              </div>
              <div className="text-[10px] text-slate-500 mt-3">REVIEW deriva a operador humano (human-in-the-loop).</div>
            </div>
          </div>
        </div>
      </section>

      {/* 08 · DECISION PATH */}
      <section className="border-b border-slate-800 bg-[#020617] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="DECISION PATH"
            title="Action → Verdict → Permit"
            lead="El recorrido completo de una acción dentro del plano de control. Todo ocurre en memoria volátil del nodo; solo el digest del resultado abandona el proceso."
          />
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mt-10 font-mono">
            {DECISION_PATH.map(([num, title, desc, state]) => (
              <div key={num} className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-sky-400 font-bold">{num}</span>
                  <span className="text-[8px] text-slate-600 font-bold">{state}</span>
                </div>
                <div className="text-white font-bold text-xs mt-2">{title}</div>
                <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 font-mono text-[10px] text-slate-500 bg-slate-900/40 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-x-8 gap-y-2">
            <span>LATENCIA TOTAL DEL CICLO: <span className="text-slate-300">1,16 ms</span> <DataLabel type="BENCHMARK" /></span>
            <span>PERSISTENCIA EN DISCO: <span className="text-slate-300">NINGUNA (Zero-Disk)</span></span>
            <span>FALLO DEL MOTOR: <span className="text-slate-300">FAIL-CLOSED POR DEFECTO</span></span>
          </div>
        </div>
      </section>

      {/* 09 · saare_console */}
      <section className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="saare_console"
            title="Una sola consola para cuatro lecturas del mismo sistema."
            lead="Mismo motor. Mismas decisiones. Misma evidencia. Distinta interpretación según el rol RBAC de acceso."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 font-mono text-xs">
            <Link to="/producto/executive" className="bg-slate-900 border border-slate-800 p-5 rounded-lg hover:border-sky-500/50 transition">
              <span className="text-[10px] text-sky-400 font-bold">BOARD / EXECUTIVE</span>
              <div className="text-white font-bold text-sm mt-2">¿Qué riesgo está asumiendo el negocio?</div>
              <p className="text-slate-500 text-[11px] mt-2">Exposición operativa acumulada y continuidad bajo DORA / NIS 2.</p>
            </Link>

            <Link to="/producto/grc" className="bg-slate-900 border border-slate-800 p-5 rounded-lg hover:border-sky-500/50 transition">
              <span className="text-[10px] text-sky-400 font-bold">GRC / PRIVACIDAD</span>
              <div className="text-white font-bold text-sm mt-2">¿Qué controles puedo demostrar?</div>
              <p className="text-slate-500 text-[11px] mt-2">Matriz normativa EU AI Act / RGPD y exportación de Proof Bundles.</p>
            </Link>

            <Link to="/producto/cyber" className="bg-slate-900 border border-slate-800 p-5 rounded-lg hover:border-sky-500/50 transition">
              <span className="text-[10px] text-sky-400 font-bold">CISO / SECOPS</span>
              <div className="text-white font-bold text-sm mt-2">¿Qué está bloqueando el motor ahora?</div>
              <p className="text-slate-500 text-[11px] mt-2">Intercepciones OWASP LLM Top 10 y estado Fail-Closed en vivo.</p>
            </Link>

            <Link to="/forense" className="bg-slate-900 border border-slate-800 p-5 rounded-lg hover:border-sky-500/50 transition">
              <span className="text-[10px] text-sky-400 font-bold">FORENSE / PERICIAL</span>
              <div className="text-white font-bold text-sm mt-2">¿Puedo verificar la evidencia independientemente?</div>
              <p className="text-slate-500 text-[11px] mt-2">Bóveda ciega y verificación offline por terceros (Art. 326 LEC).</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 10 · EVIDENCE CHAIN */}
      <section className="border-b border-slate-800 bg-[#020617] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <SectionTitle
                kicker="EVIDENCE CHAIN"
                title="Digest → Merkle → Ed25519 → RFC 3161"
                lead="Cada veredicto puede convertirse en una prueba verificable por un tercero, sin necesidad de confiar en S.A.A.R.E. ni en su infraestructura."
              />
              <div className="space-y-3 font-mono text-xs">
                {EVIDENCE_CHAIN.map(([tag, name, desc]) => (
                  <div key={tag} className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">{tag}</span>
                      <span className="text-white font-bold">{name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-32">
              <EvidenceChainPanel />
              <p className="mt-4 text-[11px] font-mono text-slate-500 leading-relaxed">
                La custodia de evidencias está disponible desde el tramo Nodo con Custodia.
                La verificación pública del Trust Anchor no requiere licencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11 · SECURITY / ARCHITECTURE BRIEF */}
      <section className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="SECURITY / ARCHITECTURE BRIEF"
            title="El nodo decide. El plano de control gobierna."
            lead="Separación estricta de planos: la decisión ocurre en el nodo, de forma autónoma y sin dependencia de red; el Control Plane distribuye políticas firmadas y recoge telemetría mínima."
          />

          <div className="grid lg:grid-cols-[1fr_.8fr] gap-8 items-start mt-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-xs overflow-x-auto">
              <div className="min-w-[420px] space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {DEPLOYMENT.map(([name]) => (
                    <div key={name} className="border border-slate-800 bg-slate-900 p-2 rounded text-[9px] text-slate-300 font-bold">{name}</div>
                  ))}
                </div>
                <div className="text-center text-slate-600">↓</div>
                <div className="border border-sky-500/40 bg-sky-500/5 p-4 rounded-lg">
                  <div className="text-sky-300 font-bold text-center">DECISION NODE</div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                    <div className="border border-slate-800 bg-slate-900 p-2 rounded text-slate-400">LOCAL POLICY · firmada</div>
                    <div className="border border-slate-800 bg-slate-900 p-2 rounded text-slate-400">FAIL-CLOSED · por defecto</div>
                    <div className="border border-slate-800 bg-slate-900 p-2 rounded text-slate-400">VOLATILE PROCESSING · RAM</div>
                    <div className="border border-slate-800 bg-slate-900 p-2 rounded text-slate-400">EVIDENCE PIPELINE · digest</div>
                  </div>
                </div>
                <div className="text-center text-slate-600">↓ telemetría mínima · políticas firmadas ↑</div>
                <div className="border border-slate-800 bg-slate-900 p-3 rounded text-center text-slate-300 font-bold">
                  CONTROL PLANE · API · D1 · KV
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <TechnicalCard title="Autonomía del nodo" badge="RESILIENCIA">
                <p>Si el Control Plane deja de estar disponible, el nodo sigue decidiendo con la última política firmada. La contención no depende de la red.</p>
              </TechnicalCard>
              <TechnicalCard title="Distribución de políticas" badge="GOBERNANZA">
                <p>Cada política viaja firmada y versionada. El nodo rechaza cualquier paquete cuya firma no valide contra la clave de gobierno.</p>
              </TechnicalCard>
              <CtaButton ctaText="SOLICITAR ARQUITECTURA COMPLETA →" href={WHATSAPP_URL} full={false} />
            </div>
          </div>
        </div>
      </section>

      {/* 12 · DEFENSA ACTIVA */}
      <section className="border-b border-slate-800 bg-[#020617] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="DEFENSA ACTIVA"
            title="Injection, PII, Shadow AI, Fail-Closed"
            lead="Contención determinista de los vectores críticos del OWASP LLM Top 10, con la latencia medida en banco de pruebas de cada intercepción."
          />
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mt-8">
            <DataTable
              headers={["VECTOR OWASP", "MECANISMO DE EXPLOTACIÓN", "MITIGACIÓN DETERMINISTA", "LATENCIA", "ETIQUETA"]}
              rows={DEFENSE_VECTORS}
              renderLast={(cell) => <DataLabel type={cell} />}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-6 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="text-sky-400 font-bold text-[10px] tracking-widest">SHADOW AI</div>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">Descubrimiento automático de tráfico hacia proveedores de IA no autorizados dentro del perímetro.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="text-sky-400 font-bold text-[10px] tracking-widest">FAIL-CLOSED</div>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">Ante cualquier fallo interno del motor, la acción se deniega. La disponibilidad nunca prima sobre la contención.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="text-sky-400 font-bold text-[10px] tracking-widest">ZERO-DISK</div>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">El payload se procesa en RAM con mlock y se zeroiza tras la firma. No existe archivo que exfiltrar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 13 · INTEROPERABILIDAD */}
      <section className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="INTEROPERABILIDAD"
            title="Agnóstico al modelo. Agnóstico al proveedor."
            lead="La política se escribe una vez y se aplica igual sobre cualquier modelo, en la nube o en su propio hardware."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 font-mono text-xs">
            {INTEROP.map(([name, family, desc, mode]) => (
              <div key={name} className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <div className="text-white font-bold text-sm">{name}</div>
                <div className="text-[10px] text-sky-400 mt-1">{family}</div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{desc}</p>
                <div className="text-[9px] text-slate-500 mt-3 font-bold">{mode}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14 · DESPLIEGUE SOBERANO */}
      <section className="border-b border-slate-800 bg-[#020617] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="DESPLIEGUE"
            title="VPC · Private Cloud · On-Premise · Air-Gapped"
            lead="El motor vive donde vive su infraestructura. La soberanía de claves y políticas permanece en el cliente en todas las topologías."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 font-mono text-xs">
            {DEPLOYMENT.map(([name, desc, tramo]) => (
              <div key={name} className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-white font-bold text-sm">{name}</div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{desc}</p>
                </div>
                <div className="text-[9px] text-emerald-400 font-bold mt-4">{tramo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15 · ESCALADO DE LICENCIAMIENTO CON ACCIÓN DIRECTA */}
      <section id="licencias" className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="ESCALADO DE LICENCIAMIENTO"
            title="El flujo económico de la plataforma"
            lead="Cuatro líneas económicas principales. La expansión del cliente sigue el crecimiento de su parque de agentes y de su exigencia probatoria."
          />

          <div className="grid md:grid-cols-5 gap-3 mt-10 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg relative flex flex-col justify-between">
              <div>
                <div className="text-sky-400 font-bold">CONTROL</div>
                <div className="text-white font-bold text-lg mt-2">149 € <span className="text-slate-500 text-xs">/mes</span></div>
                <p className="text-[10px] text-slate-500 mt-2">Nodo Base. Contención L7 sin custodia.</p>
              </div>
              <button
                onClick={() => saareCheckout("nodo-base")}
                className="mt-4 block w-full text-center px-3 py-2 bg-emerald-500 text-black font-bold text-[10px] rounded hover:bg-emerald-400 transition cursor-pointer"
              >
                COMPRAR (149 €) 💳
              </button>
            </div>

            <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-lg relative flex flex-col justify-between">
              <div>
                <div className="text-emerald-400 font-bold">CONTROL + CUSTODIA</div>
                <div className="text-white font-bold text-lg mt-2">290 € <span className="text-slate-500 text-xs">/mes</span></div>
                <p className="text-[10px] text-slate-500 mt-2">Sellado Ed25519 + Consola de cumplimiento.</p>
              </div>
              <button
                onClick={() => saareCheckout("nodo-custodia")}
                className="mt-4 block w-full text-center px-3 py-2 bg-emerald-500 text-black font-bold text-[10px] rounded hover:bg-emerald-400 transition cursor-pointer"
              >
                COMPRAR (290 €) 💳
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg relative flex flex-col justify-between">
              <div>
                <div className="text-amber-400 font-bold">ESCALA DE EVIDENCIA</div>
                <div className="text-white font-bold text-lg mt-2">120 € <span className="text-slate-500 text-xs">/mes</span></div>
                <p className="text-[10px] text-slate-500 mt-2">Paquetes de 1.000 sellos eIDAS.</p>
              </div>
              <button
                onClick={() => saareCheckout("evidencias")}
                className="mt-4 block w-full text-center px-3 py-2 bg-emerald-500 text-black font-bold text-[10px] rounded hover:bg-emerald-400 transition cursor-pointer"
              >
                COMPRAR (120 €) 💳
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg relative flex flex-col justify-between">
              <div>
                <div className="text-sky-400 font-bold">FORENSE</div>
                <div className="text-white font-bold text-lg mt-2">1.200 € <span className="text-slate-500 text-xs">/año</span></div>
                <p className="text-[10px] text-slate-500 mt-2">Estación pericial + 300 €/dossier.</p>
              </div>
              <button
                onClick={() => saareCheckout("forense")}
                className="mt-4 block w-full text-center px-3 py-2 bg-emerald-500 text-black font-bold text-[10px] rounded hover:bg-emerald-400 transition cursor-pointer"
              >
                CONTRATAR (1.200 €) 💳
              </button>
            </div>

            <div className="bg-slate-900 border border-purple-500/40 p-5 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-purple-400 font-bold">ENTERPRISE</div>
                <div className="text-white font-bold text-lg mt-2">3.500 € <span className="text-slate-500 text-xs">/mes</span></div>
                <p className="text-[10px] text-slate-500 mt-2">VPC / Air-Gapped con HSM y SLA.</p>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block w-full text-center px-3 py-2 bg-sky-500 text-black font-bold text-[10px] rounded hover:bg-sky-400 transition"
              >
                PROPUESTA ↗
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {CATALOGO.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* 16 · PARTNERS */}
      <section className="border-b border-slate-800 bg-[#020617] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="CANAL PARTNER"
            title="Venda gobernanza de IA sin construirla."
            lead="S.A.A.R.E. es la solución técnica. El programa Partner es el canal. Las ayudas públicas (Kit Consulting y similares) son el instrumento de financiación del cliente final: una palanca comercial, nunca la tesis del producto."
          />

          <div className="font-mono text-[10px] text-slate-500 bg-slate-900/40 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-x-6 gap-y-2 items-center">
            <span className="text-white font-bold">S.A.A.R.E.</span>
            <span>→</span><span>SOLUCIÓN TÉCNICA</span>
            <span>→</span><span>CANAL PARTNER</span>
            <span>→</span><span className="text-slate-300">KIT CONSULTING / AYUDAS</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-8 font-mono text-xs">
            {PARTNER_ENTREGABLES.map(([num, title, desc]) => (
              <div key={num} className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <div className="text-[10px] text-sky-400 font-bold">{num}</div>
                <div className="text-white font-bold text-sm mt-2">{title}</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/ventas" className="inline-block px-6 py-3 border border-sky-500/50 text-sky-300 font-mono text-xs font-bold rounded hover:bg-sky-500/10 transition">
              VER PROGRAMA PARTNER COMPLETO →
            </Link>
          </div>
        </div>
      </section>

      {/* 17 · SEGURIDAD Y BUEN USO */}
      <section className="border-b border-slate-800 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            kicker="SEGURIDAD Y BUEN USO"
            title="Contención de máquinas. No vigilancia de personas."
            lead="S.A.A.R.E. es infraestructura de autorización y prueba sobre acciones de agentes de IA. Estos principios definen el perímetro ético y operativo del producto."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 font-mono text-xs">
            {BUEN_USO.map(([title, desc]) => (
              <div key={title} className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <div className="text-white font-bold text-xs">{title}</div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12 font-mono text-xs">
            <div className="bg-slate-900/80 border border-emerald-500/30 p-6 rounded-xl">
              <div className="text-emerald-400 font-bold mb-4">✓ SALE DEL NODO (TELEMETRÍA MÍNIMA)</div>
              <ul className="space-y-2 text-slate-300">
                {TELEMETRIA_SALE.map((t) => (
                  <li key={t} className="flex items-center gap-2"><span className="text-emerald-400">›</span> {t}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900/80 border border-red-500/30 p-6 rounded-xl">
              <div className="text-red-400 font-bold mb-4">× NO SALE DEL NODO (NUNCA PERSISTIDO)</div>
              <ul className="space-y-2 text-slate-400">
                {TELEMETRIA_NO_SALE.map((t) => (
                  <li key={t} className="flex items-center gap-2"><span className="text-red-400">›</span> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 18 · CTA FINAL CONSOLIDADO */}
      <section className="relative overflow-hidden bg-[#020617] py-24 text-center border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 font-mono">
          <span className="text-xs text-sky-400 font-bold tracking-widest uppercase">S.A.A.R.E. SGP 1.0</span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4">
            ¿Dónde quiere empezar?
          </h2>
          <p className="mt-4 text-slate-400 text-sm max-w-xl mx-auto">
            Tres vías de acceso, tres funciones distintas: probar el producto, hablar de arquitectura o verificar una evidencia.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-bold">
            <Link to="/trial" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black rounded hover:bg-emerald-400 transition">
              QUIERO PROBAR EL CONTROL ↗
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 border border-slate-700 text-slate-200 rounded hover:bg-slate-900 transition">
              QUIERO HABLAR CON UN ARQUITECTO ↗
            </a>
            <a href="/#trust-anchor" className="w-full sm:w-auto px-8 py-4 border border-amber-500/40 text-amber-300 rounded hover:bg-amber-500/10 transition">
              QUIERO VERIFICAR UNA EVIDENCIA ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PÁGINAS SECUNDARIAS DESARROLLADAS
   ========================================================================== */
function DetalleLicencia({ id }) {
  const item = CATALOGO.find((c) => c.id === id);
  useSEO("home", item ? { title: `${item.nombre} | Licenciamiento S.A.A.R.E.`, description: item.descripcion.slice(0, 155) } : null);

  if (!item) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center font-mono">
        <PageHeader badge="LICENCIAMIENTO" title="Tramo no encontrado" description="El tramo solicitado no existe." />
        <CtaButton ctaText="VOLVER AL CATÁLOGO →" href="/#licencias" full={false} />
      </main>
    );
  }

  return (
    <main>
      <PageHeader badge={`${item.grupo} · ${item.etiqueta}`} title={item.nombre} description={item.descripcion} />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16 font-mono text-xs">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl">
              <SectionTitle kicker="ALCANCE" title="Características del tramo" />
              <ul className="space-y-3">
                {item.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {item.noIncluye.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <div className="text-[10px] text-red-400 font-bold tracking-widest mb-3">NO INCLUIDO EN ESTE TRAMO</div>
                  <ul className="space-y-2">
                    {item.noIncluye.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-500">
                        <span className="text-red-400 font-bold">×</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl">
              <SectionTitle kicker="PERFIL" title={`Comprador: ${item.comprador}`} />
              <div className="grid sm:grid-cols-3 gap-3">
                {item.ideal.map((p) => (
                  <div key={p} className="border border-slate-800 bg-slate-950 p-3 rounded text-slate-400 text-[11px]">{p}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-sky-500/40 p-8 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-sky-400 font-bold uppercase">{item.grupo}</span>
              <div className="text-3xl font-bold text-white mt-2">{item.precio}</div>
              <div className="text-slate-400 mt-1">{item.sufijo}</div>
              <div className="text-[10px] text-slate-500 mt-2">{item.unidad}</div>
              <p className="text-[11px] text-slate-400 mt-6 leading-relaxed border-t border-slate-800 pt-4">{item.claim}</p>
            </div>
            <div className="mt-8 space-y-3">
              <CtaButton ctaText={item.cta} item={item} />
              <Link to="/trial" className="block w-full text-center px-5 py-3 border border-slate-700 text-slate-300 font-bold text-xs rounded hover:bg-slate-800 transition">
                PROBAR ANTES EN /trial →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function VistaConsola({ vistaId }) {
  const v = VISTAS_CONSOLA[vistaId];
  useSEO("producto", { title: `${v.badge} | saare_console`, description: v.pageDesc.slice(0, 155) });
  const esCyber = v.id === "cyber";
  const esForense = v.id === "forense";
  const tramo = CATALOGO.find((c) => c.id === v.tramoRecomendado);

  return (
    <main>
      <PageHeader badge={v.badge} title={v.pageTitle} description={v.pageDesc} />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16 space-y-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 font-mono text-xs flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="text-[10px] text-slate-500 tracking-widest">PREGUNTA QUE RESPONDE ESTA VISTA</div>
            <div className="text-white font-bold text-base mt-1">{v.pregunta}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-[10px] text-slate-500 tracking-widest">ROL DE ACCESO</div>
            <div className="text-sky-400 font-bold mt-1">{v.rol}</div>
            <div className="text-[10px] text-slate-500 mt-1">{v.owner}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {v.metricas.map(([label, value, tag]) => (
            <MetricCard key={label} label={label} value={value} tag={tag} />
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl">
          <SectionTitle kicker={v.seccionMatriz} title={v.tituloMatriz} lead={v.leadMatriz} />
          <DataTable
            headers={
              esCyber
                ? ["VECTOR OWASP", "MECANISMO DE EXPLOTACIÓN", "MITIGACIÓN DETERMINISTA", "LATENCIA"]
                : esForense
                ? ["MARCO PROCESAL", "REQUISITO", "MECANISMO S.A.A.R.E.", "ARTEFACTO PERICIAL"]
                : ["MARCO Y ARTÍCULO", "CONTROL REQUERIDO", "MECANISMO S.A.A.R.E.", "EVIDENCIA GENERADA"]
            }
            rows={v.matriz}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl">
          <SectionTitle kicker={v.seccionInventario} title={v.tituloInventario} lead={v.leadInventario} />
          <DataTable
            headers={
              esCyber
                ? ["TIMESTAMP", "NODO", "VECTOR", "LATENCIA", "VEREDICTO"]
                : esForense
                ? ["EXPEDIENTE", "TIPO", "RAÍZ MERKLE", "SELLO", "ESTADO"]
                : ["ACTIVO", "TIPO", "ENTORNO / POLÍTICA", "SCOPE / SELLO", "ESTADO"]
            }
            rows={v.inventario}
            renderLast={(cell) => <VerdictChip verdict={cell} />}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-xl font-mono text-xs">
            <SectionTitle kicker={v.superficieSeccion} title={v.superficieTitulo} />
            <div className="space-y-3">
              {v.superficie.map(([label, value]) => (
                <DataRow key={label} label={label} value={value} />
              ))}
            </div>
          </div>
          {tramo && (
            <div className="bg-slate-900 border border-emerald-500/40 p-8 rounded-xl font-mono text-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold tracking-widest">TRAMO RECOMENDADO</span>
                <div className="text-white font-bold text-base mt-2">{tramo.nombre}</div>
                <div className="text-2xl font-bold text-white mt-3">
                  {tramo.precio} <span className="text-xs font-normal text-slate-400">{tramo.sufijo}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{tramo.claim}</p>
              </div>
              <div className="mt-6 space-y-3">
                <CtaButton ctaText={v.tramoCta} item={tramo} />
                <Link to={tramo.path} className="block text-center text-[10px] text-slate-500 hover:text-slate-300">
                  ver ficha completa del tramo →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function TabCumplimiento() {
  useSEO("producto");
  return <VistaConsola vistaId="grc" />;
}

function TabForense() {
  useSEO("forensic");
  return <VistaConsola vistaId="forense" />;
}

function TabDev() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="DESARROLLADORES"
        title="Tres modos de ejecución. Un mismo motor."
        description="SDK nativo (LabEngine), Proxy L7 perimetral (PerimeterShield) y servicio On-Premise (Daemon). La lógica de decisión es idéntica en los tres; cambia únicamente el punto de intercepción."
      />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16">
        <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
          <Link to="/dev/sdk" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-sky-500/50 transition">
            <span className="text-[10px] text-emerald-400 font-bold">MODO SDK</span>
            <h3 className="text-white font-bold text-lg mt-1">LabEngine</h3>
            <p className="text-slate-400 mt-3 leading-relaxed">Autorización in-process dentro de su aplicación, RAG o agente.</p>
            <div className="text-sky-400 font-bold mt-4">INTEGRAR SDK →</div>
          </Link>
          <Link to="/dev/proxy" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-sky-500/50 transition">
            <span className="text-[10px] text-emerald-400 font-bold">MODO PROXY</span>
            <h3 className="text-white font-bold text-lg mt-1">PerimeterShield</h3>
            <p className="text-slate-400 mt-3 leading-relaxed">Intercepción L7 en el borde: Docker, Helm o sidecar de Kubernetes.</p>
            <div className="text-sky-400 font-bold mt-4">DESPLEGAR PROXY →</div>
          </Link>
          <Link to="/dev/daemon" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-sky-500/50 transition">
            <span className="text-[10px] text-emerald-400 font-bold">MODO DAEMON</span>
            <h3 className="text-white font-bold text-lg mt-1">Local Node</h3>
            <p className="text-slate-400 mt-3 leading-relaxed">Servicio local para redes aisladas, modelos propios y HSM.</p>
            <div className="text-sky-400 font-bold mt-4">INSTALAR DAEMON →</div>
          </Link>
        </div>
      </section>
    </main>
  );
}

function TabSDK() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="LABENGINE · MODO SDK"
        title="El control vive dentro de su aplicación"
        description="Paquete nativo que envuelve las llamadas del agente y consulta al motor de decisión en memoria compartida. Sin salida de red: la autorización ocurre in-process."
      />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16 space-y-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TechnicalCard title="Cuándo elegir el modo SDK" badge="DECISIÓN">
              <p>Agentes, pipelines RAG o herramientas internas cuyo código fuente controla. Es el punto de integración más profundo y el de menor latencia de intercepción.</p>
            </TechnicalCard>
            <TechnicalCard title="Qué controla" badge="ALCANCE">
              <p>Llamadas a funciones (tool-use), construcción de prompts, acceso a recursos internos y egreso de datos. Cada acción pasa por la evaluación de las 7 dimensiones antes de ejecutarse.</p>
            </TechnicalCard>
            <TechnicalCard title="Cómo se actualiza" badge="GOBERNANZA">
              <p>La política llega firmada desde el Control Plane y se carga en RAM. Un cambio de política se aplica en vivo, sin reiniciar el servicio ni redesplegar la aplicación.</p>
            </TechnicalCard>
          </div>
          <div className="space-y-6">
            <CodePanel
              title="INTEGRACIÓN · PYTHON (REFERENCE)"
              code={`from saare import LabEngine

engine = LabEngine(
    node_key='NODE_KEY_HSM',
    policy='FIN-PAYMENT-042',
    fail_closed=True,
)

@engine.guard(action='SEND_PAYMENT',
              resource='core-banking://transfers')
def send_payment(amount, iban):
    # Solo se ejecuta si el veredicto es ALLOW
    return banking_api.transfer(amount, iban)`}
            />
            <CodePanel
              title="VEREDICTO DEVUELTO (REFERENCE)"
              code={`{
  "verdict": "DENY",
  "policy": "FIN-PAYMENT-042",
  "policy_version": 17,
  "dimensions_failed": ["RISK", "DATA"],
  "latency_ms": 1.16,
  "evidence_digest": "e3b0c44298fc1c14…",
  "permit": null
}`}
            />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-slate-400">El modo SDK se licencia como <span className="text-white font-bold">Nodo Base</span> o <span className="text-white font-bold">Nodo con Custodia</span>.</div>
          <div className="flex gap-3">
            <Link to="/licencias/nodo-base" className="px-5 py-3 border border-sky-500/50 text-sky-300 font-bold rounded hover:bg-sky-500/10 transition">VER NODO BASE →</Link>
            <Link to="/trial" className="px-5 py-3 bg-sky-500 text-black font-bold rounded hover:bg-sky-400 transition">PROBAR SDK ↗</Link>
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
      <PageHeader
        badge="PERIMETERSHIELD · MODO PROXY"
        title="El control vive en el tráfico"
        description="Pasarela L7 que intercepta cada petición hacia proveedores de IA o APIs internas antes de que salga del perímetro. Despliegue en Docker, Helm o sidecar de Kubernetes."
      />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16 space-y-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TechnicalCard title="Cuándo elegir el modo Proxy" badge="DECISIÓN">
              <p>Cuando el tráfico hacia modelos sale por red — APIs de OpenAI, Anthropic o Google, o agentes de terceros sin código accesible. También para descubrir Shadow AI en el perímetro.</p>
            </TechnicalCard>
            <TechnicalCard title="Qué controla" badge="ALCANCE">
              <p>Peticiones HTTP/REST de capa 7: destino, payload, cabeceras y volumen. Aplica la política antes de reenviar y emite el veredicto con su evidencia asociada.</p>
            </TechnicalCard>
            <TechnicalCard title="Dónde ejecuta" badge="TOPOLOGÍA">
              <p>En el borde del clúster o como gateway dedicado. Escalado horizontal sin estado: la decisión es local en cada réplica; la política se sincroniza firmada desde el Control Plane.</p>
            </TechnicalCard>
          </div>
          <div className="space-y-6">
            <CodePanel
              title="DESPLIEGUE · KUBERNETES / HELM (REFERENCE)"
              code={`helm install perimetershield saare/charts \\
  --set node.keyRef=hsm://pkcs11/key-0x9f \\
  --set policy.bundle=FIN-PAYMENT-042:v17 \\
  --set failClosed=true \\
  --set evidence.custody=true \\
  --set telemetry.minimal=true`}
            />
            <CodePanel
              title="FLUJO DE INTERCEPCIÓN (REFERENCE)"
              code={`AGENT ──▶ PERIMETERSHIELD ──▶ POLICY EVAL (7D, RAM)
                                   │
                    ┌──────────────┴──────────────┐
                 ALLOW ▶ upstream            DENY ▶ 403 + digest
                    │                              │
              respuesta filtrada          evidencia sellada
              (PII sanitizada)            (Merkle + Ed25519)`}
            />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-slate-400">El modo Proxy se licencia como <span className="text-white font-bold">Nodo Base</span>, <span className="text-white font-bold">Nodo con Custodia</span> o <span className="text-white font-bold">Enterprise</span>.</div>
          <div className="flex gap-3">
            <Link to="/licencias/nodo-custodia" className="px-5 py-3 border border-sky-500/50 text-sky-300 font-bold rounded hover:bg-sky-500/10 transition">VER NODO CON CUSTODIA →</Link>
            <Link to="/trial" className="px-5 py-3 bg-sky-500 text-black font-bold rounded hover:bg-sky-400 transition">PROBAR PROXY ↗</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function TabDaemon() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="LOCAL NODE · MODO DAEMON"
        title="El control vive en su servidor"
        description="Servicio local para redes aisladas y modelos propios. Systemd o servicio Windows, con claves en HSM del cliente y actualización de políticas por paquete firmado offline."
      />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16 space-y-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TechnicalCard title="Cuándo elegir el modo Daemon" badge="DECISIÓN">
              <p>Infraestructuras críticas, defensa, sector público o cualquier red sin salida a Internet. Es la modalidad de máxima soberanía: nada abandona su perímetro, ni siquiera la telemetría mínima si así se configura.</p>
            </TechnicalCard>
            <TechnicalCard title="Air-Gapped real" badge="AISLAMIENTO">
              <p>Las políticas se distribuyen como paquetes firmados verificables offline. El nodo valida la firma contra la clave de gobierno antes de cargar cualquier actualización.</p>
            </TechnicalCard>
            <TechnicalCard title="Claves del cliente" badge="HSM">
              <p>Integración PKCS#11 con su HSM corporativo. Las claves de firma de evidencias las genera y las custodia el cliente: S.A.A.R.E. no puede firmar en su nombre.</p>
            </TechnicalCard>
          </div>
          <div className="space-y-6">
            <CodePanel
              title="INSTALACIÓN · SYSTEMD (REFERENCE)"
              code={`# paquete firmado, verificación previa a la instalación
saare-cli verify saare-node-1.0.sgp \\
  --pubkey governance.pub

sudo dpkg -i saare-node-1.0.sgp
sudo systemctl enable --now saare-node

# estado del nodo (sin salida de red)
saare-cli status
# NODE_STATUS  ONLINE
# POLICY       FIN-PAYMENT-042 v17 (SIGNED)
# FAIL_CLOSED  true
# EVIDENCE     local vault (air-gapped)`}
            />
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <div className="text-sky-400 font-bold text-[10px] tracking-widest">MLOCK + ZEROIZACIÓN</div>
                <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">La memoria del motor se bloquea contra swap y se zeroiza tras cada firma.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <div className="text-sky-400 font-bold text-[10px] tracking-widest">SIN DEPENDENCIA DE RED</div>
                <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">La decisión es local y autónoma. La contención no se degrada sin conectividad.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-slate-400">El modo Daemon se licencia como <span className="text-white font-bold">Nodo Soberano Enterprise</span>, con contrato marco y SLA.</div>
          <div className="flex gap-3">
            <Link to="/licencias/nodo-enterprise" className="px-5 py-3 border border-sky-500/50 text-sky-300 font-bold rounded hover:bg-sky-500/10 transition">VER ENTERPRISE →</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="px-5 py-3 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition">HABLAR CON UN ARQUITECTO ↗</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function TabVentas() {
  useSEO("canal");
  const tramo = CATALOGO.find((c) => c.id === "canal");
  return (
    <main>
      <PageHeader
        badge="CANAL PARTNERS"
        title="Programa Partner Multi-Tenant"
        description="Licenciamiento marca blanca para consultoras, MSP y agentes digitalizadores. Cada cliente gestionado dispone de su política, su clave y su cadena de prueba independiente."
      />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16 space-y-8">
        <div className="font-mono text-[10px] text-slate-500 bg-slate-900/40 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-x-6 gap-y-2 items-center">
          <span className="text-white font-bold">S.A.A.R.E.</span>
          <span>→</span><span>SOLUCIÓN TÉCNICA</span>
          <span>→</span><span>CANAL PARTNER</span>
          <span>→</span><span className="text-slate-300">KIT CONSULTING / AYUDAS PÚBLICAS</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 font-mono text-xs">
          {PARTNER_ENTREGABLES.map(([num, title, desc]) => (
            <div key={num} className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
              <div className="text-[10px] text-sky-400 font-bold">{num}</div>
              <div className="text-white font-bold text-sm mt-2">{title}</div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl">
          <SectionTitle
            kicker="ALCANCE DEL PROGRAMA"
            title="Qué incluye la licencia de canal"
            lead="Todo lo necesario para operar gobernanza de IA como servicio sobre su cartera, sin construir infraestructura propia."
          />
          <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
            {tramo.features.map((f) => (
              <div key={f} className="flex items-start gap-3 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl font-mono text-xs">
          <SectionTitle
            kicker="PERFIL DE PARTNER"
            title="Para quién es este programa"
          />
          <div className="grid sm:grid-cols-3 gap-3">
            {tramo.ideal.map((p) => (
              <div key={p} className="border border-slate-800 bg-slate-950 p-3 rounded text-slate-400 text-[11px]">{p}</div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
            <div>
              <div className="text-2xl font-bold text-white">{tramo.precio} <span className="text-xs font-normal text-slate-400">{tramo.sufijo}</span></div>
              <div className="text-[10px] text-slate-500 mt-1">{tramo.unidad}</div>
            </div>
            <div className="flex gap-3">
              <Link to={tramo.path} className="px-5 py-3 border border-sky-500/50 text-sky-300 font-bold rounded hover:bg-sky-500/10 transition">VER FICHA COMPLETA →</Link>
              <CtaButton ctaText={tramo.cta} item={tramo} full={false} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrialPage() {
  useSEO("trial");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", modo: "proxy", mensaje: "" });

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main>
      <PageHeader
        badge="PRUEBA DE CONTROL"
        title="Someta un agente a control"
        description="Evaluación cualificada: desplegamos un nodo de demostración sobre uno de sus agentes y le entregamos el decision trace y la evidencia sellada del ejercicio."
      />
      <section className="max-w-4xl mx-auto px-6 py-6 mb-16">
        {sent ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-10 text-center font-mono">
            <VerdictChip verdict="VERIFIED" />
            <h2 className="text-white font-bold text-xl mt-4">Solicitud registrada</h2>
            <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Un arquitecto de soluciones le contactará en un plazo máximo de 48 h laborables
              para definir el alcance del ejercicio de control.
            </p>
            <Link to="/" className="inline-block mt-6 px-6 py-3 border border-slate-700 text-slate-200 font-mono text-xs font-bold rounded hover:bg-slate-800 transition">
              VOLVER AL MOTOR DE REFERENCIA →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 font-mono text-xs space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] text-slate-500 tracking-widest mb-2">NOMBRE Y CARGO</label>
                <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-4 py-3 rounded text-slate-200 focus:outline-none focus:border-sky-400" placeholder="Nombre · CISO / CTO / DPO" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 tracking-widest mb-2">ORGANIZACIÓN</label>
                <input required value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-4 py-3 rounded text-slate-200 focus:outline-none focus:border-sky-400" placeholder="Empresa o entidad" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 tracking-widest mb-2">EMAIL CORPORATIVO</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 px-4 py-3 rounded text-slate-200 focus:outline-none focus:border-sky-400" placeholder="nombre@empresa.com" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 tracking-widest mb-2">MODO DE EJECUCIÓN A EVALUAR</label>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  ["sdk", "SDK · LabEngine", "Dentro de la aplicación"],
                  ["proxy", "PROXY · PerimeterShield", "En el tráfico de red"],
                  ["daemon", "DAEMON · Local Node", "En el servidor / air-gapped"],
                ].map(([val, title, desc]) => (
                  <button type="button" key={val} onClick={() => setForm({ ...form, modo: val })}
                    className={`text-left p-4 rounded-lg border transition ${form.modo === val ? "border-sky-500/60 bg-sky-500/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"}`}>
                    <div className="text-white font-bold">{title}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 tracking-widest mb-2">CONTEXTO DEL AGENTE (OPCIONAL)</label>
              <textarea rows={4} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 px-4 py-3 rounded text-slate-200 focus:outline-none focus:border-sky-400 resize-none"
                placeholder="Qué hace el agente, a qué sistemas accede y qué política quiere hacer ejecutable." />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed">
                Solo usaremos estos datos para gestionar la evaluación. Sin listas de correo ni cesión a terceros.
              </p>
              <button type="submit" className="px-8 py-4 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition shrink-0 cursor-pointer">
                SOMETER UN AGENTE ↗
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

function CorporatePage({ variant }) {
  useSEO("home");

  const content = {
    empresa: {
      badge: "CORPORATIVO",
      title: "MS3V S.A.A.R.E. SL",
      description: "Infraestructura española de autorización ex-ante para inteligencia artificial. Ingeniería de plano de control, evidencia criptográfica y gobernanza ejecutable.",
      blocks: [
        ["MISIÓN", "Convertir las políticas de uso de IA en decisiones ejecutables y demostrables, para que la automatización autónoma opere bajo control verificable."],
        ["ENFOQUE", "Determinismo frente a probabilidad: reglas compiladas, decisión ex-ante, fail-closed por defecto y evidencia verificable por terceros."],
        ["SOBERANÍA", "Despliegue en infraestructura del cliente, claves del cliente y telemetría mínima. El contenido de sus sistemas nunca sale del nodo."],
      ],
    },
    "buenas-practicas": {
      badge: "BUEN USO",
      title: "Contención de máquinas, no vigilancia de personas",
      description: "Los principios que delimitan el uso legítimo de la plataforma y el perímetro ético del producto.",
      blocks: BUEN_USO.map(([t, d]) => [t, d]),
    },
    legal: {
      badge: "LEGAL",
      title: "Privacidad, términos B2B y SLA Zero-Disk",
      description: "Marco contractual y de tratamiento de datos de la plataforma.",
      blocks: [
        ["PRIVACIDAD POR DISEÑO", "El motor procesa payloads en memoria volátil (mlock) y los zeroiza tras la firma. La telemetría saliente es numérica y nunca contiene PII ni contenido de conversaciones."],
        ["ENCARGO DE TRATAMIENTO", "En los tramos con custodia, la evidencia almacena digests criptográficos, no contenido. El cliente conserva la condición de responsable del tratamiento."],
        ["SLA ZERO-DISK", "Ningún payload se persiste en disco en ningún modo de ejecución. Este compromiso forma parte del contrato de los tramos con custodia y Enterprise."],
        ["CONTACTO LEGAL", `${CONTACT_EMAIL} · ${CONTACT_PHONE}`],
      ],
    },
  };

  const c = content[variant] || content.empresa;

  return (
    <main>
      <PageHeader badge={c.badge} title={c.title} description={c.description} />
      <section className="max-w-4xl mx-auto px-6 py-6 mb-16 space-y-4 font-mono text-xs">
        {c.blocks.map(([t, d]) => (
          <div key={t} className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="text-sky-400 font-bold text-[10px] tracking-widest">{t}</div>
            <p className="text-slate-300 mt-3 leading-relaxed">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function LoginPage() {
  useSEO("login");
  return <Login />;
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-12 pb-8 px-6 font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white font-display">S.A.A.R.E.</span>
            <span className="text-[9px] bg-sky-500/10 border border-sky-500/30 text-sky-400 px-2 py-0.5 rounded font-bold">SGP 1.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
            Infraestructura de autorización ex-ante y gobernanza runtime L7.
            Un solo producto mental. Siete puertas comerciales. Cuatro familias
            de software. Tres modos de ejecución. Una consola. Un motor.
          </p>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 tracking-widest font-bold">PRODUCTO</div>
          <div className="mt-3 space-y-2 text-[11px]">
            <div><Link to="/producto/executive" className="hover:text-slate-300">Consola Board / Executive</Link></div>
            <div><Link to="/producto/grc" className="hover:text-slate-300">Consola GRC / Privacidad</Link></div>
            <div><Link to="/producto/cyber" className="hover:text-slate-300">Consola CISO / SecOps</Link></div>
            <div><Link to="/forense" className="hover:text-slate-300">Evidence Vault / Forense</Link></div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 tracking-widest font-bold">DESARROLLADORES</div>
          <div className="mt-3 space-y-2 text-[11px]">
            <div><Link to="/dev/sdk" className="hover:text-slate-300">SDK · LabEngine</Link></div>
            <div><Link to="/dev/proxy" className="hover:text-slate-300">Proxy · PerimeterShield</Link></div>
            <div><Link to="/dev/daemon" className="hover:text-slate-300">Daemon · Local Node</Link></div>
            <div><Link to="/#trust-anchor" className="hover:text-slate-300">Public Trust Anchor</Link></div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 tracking-widest font-bold">CONTACTO</div>
          <div className="mt-3 space-y-2 text-[11px]">
            <div><a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-slate-300">{CONTACT_EMAIL}</a></div>
            <div><a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="hover:text-slate-300">{CONTACT_PHONE}</a></div>
            <div><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-emerald-400 text-emerald-500">Propuesta Enterprise ↗</a></div>
            <div><Link to="/trial" className="hover:text-slate-300">Prueba de control</Link></div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 border-t border-slate-800/70 pt-6">
        <div>© 2026 MS3V S.A.A.R.E. SL. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <Link to="/legal" className="hover:text-slate-400">Privacidad</Link>
          <Link to="/legal" className="hover:text-slate-400">Términos B2B</Link>
          <Link to="/legal" className="hover:text-slate-400">SLA Zero-Disk</Link>
          <Link to="/buenas-practicas" className="hover:text-slate-400">Buen uso</Link>
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

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<TabAuditoriaPublica />} />
          <Route path="/producto" element={<TabAuditoriaPublica />} />
          <Route path="/producto/auditoria" element={<TabAuditoriaPublica />} />

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