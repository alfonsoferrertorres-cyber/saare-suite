	/* ==========================================================================
     2	   S.A.A.R.E. SGP 1.0 · APLICACIÓN PRINCIPAL CON RUTAS & LANDING PAGE
     3	   ========================================================================== */
     4	import React, { useState } from "react";
     5	import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
     6	import { saareCheckout, verifyMerkleHash, saareFetch } from "./api.js";
     7	import Login from "./Login.jsx";
     8	
     9	/* ==========================================================================
    10	   CONSTANTES GLOBALES, REGISTROS CRIPTOGRÁFICOS Y CONFIGURACIÓN SGP 1.0
    11	   ========================================================================== */
    12	const DEMO_ROOT_MERKLE_HASH =
    13	  "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";
    14	
    15	const CONTACT_EMAIL = "legal@saare.es";
    16	const CONTACT_PHONE = "+34 633 886 506";
    17	const WHATSAPP_URL =
    18	  "https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE%20SGP%201.0";
    19	
    20	const METRIC_LABELS = {
    21	  DEMO: { text: "DEMO", cls: "bg-slate-500/10 border-slate-500/40 text-slate-400" },
    22	  BENCHMARK: { text: "BENCHMARK", cls: "bg-saare-accent/10 border-saare-accent/40 text-saare-accent" },
    23	  REFERENCE: { text: "REFERENCE", cls: "bg-saare-seal/10 border-saare-seal/40 text-saare-seal" },
    24	  LIVE: { text: "LIVE", cls: "bg-saare-allow/10 border-saare-allow/40 text-saare-allow" },
    25	};
    26	
    27	const DIMENSIONS = [
    28	  ["DIM 01", "IDENTIDAD", "Quién solicita la acción. Verificación asimétrica de firmas Ed25519 del agente o token JWT del sistema originador."],
    29	  ["DIM 02", "ACCIÓN", "Qué quiere ejecutar. Inspección L7 de comandos (READ, MUTATE_DATABASE, SEND_PAYMENT, DELETE, EXECUTE_CODE)."],
    30	  ["DIM 03", "CONTEXTO", "En qué contexto ocurre. Evaluación de la variable temporal, IP de origen, geolocalización y aislamiento."],
    31	  ["DIM 04", "RECURSO", "Sobre qué recurso. Validación del URI objetivo, tabla de base de datos, servicio financiero o endpoint API receptor."],
    32	  ["DIM 05", "DATOS", "Qué datos intervienen. Inspección y sanitización in-RAM k-Anonymity para PII (DNI, NIF), PHI e IBANs en tránsito."],
    33	  ["DIM 06", "RIESGO", "Qué nivel de riesgo presenta. Scoring determinista basado en impacto económico y vector de ataque."],
    34	  ["DIM 07", "POLÍTICA", "Qué regla aplica. Verificación contra el motor de políticas firmado localmente y compilado a código nativo."],
    35	];
    36	
    37	const DECISION_PATH = [
    38	  ["01", "INTENTO DE ACCIÓN", "El agente emite un comando contra un recurso protegido.", "INTERCEPTED"],
    39	  ["02", "NORMALIZACIÓN", "NFKC, decodificación y tokenizado del payload en RAM.", "PARSED"],
    40	  ["03", "EVALUACIÓN 7D", "Las siete dimensiones se resuelven contra la política firmada.", "EVALUATED"],
    41	  ["04", "VEREDICTO", "ALLOW, DENY o REVIEW emitido por regla determinista.", "DENY"],
    42	  ["05", "PERMISO", "Si procede, se emite un Permit Token de un solo uso y corto TTL.", "NOT_ISSUED"],
    43	  ["06", "EVIDENCIA", "Digest sellado, firmado y anclado al árbol de Merkle.", "SEALED"],
    44	];
    45	
    46	const EVIDENCE_CHAIN = [
    47	  ["DIGEST", "SHA-256", "Huella del veredicto y de su contexto mínimo. El contenido sensible nunca se persiste: solo su representación criptográfica."],
    48	  ["MERKLE", "ÁRBOL DE MERKLE", "Los digests del periodo se agregan en una raíz única. Alterar un solo veredicto invalida la raíz publicada."],
    49	  ["FIRMA", "Ed25519", "La raíz se firma con la clave privada del nodo (o del HSM del cliente en Enterprise). La clave pública es verificable por terceros."],
    50	  ["TIEMPO", "RFC 3161 · eIDAS", "Una autoridad de sellado de tiempo cualificada fija el momento exacto de la firma. La evidencia gana valor procesal."],
    51	];
    52	
    53	const DEFENSE_VECTORS = [
    54	  ["LLM01 · Prompt Injection", "Manipulación directa o indirecta del modelo para alterar su comportamiento.", "Separación estricta de roles a nivel sintáctico; AST de comandos permitidos.", "0,8 ms", "BENCHMARK"],
    55	  ["LLM02 · Insecure Output Handling", "Salida del modelo consumida sin validación por sistemas posteriores.", "Validación de integridad dicotómica antes de la ejecución.", "1,4 ms", "BENCHMARK"],
    56	  ["LLM06 · Sensitive Information Disclosure", "Exfiltración de PII, PHI o secretos a través del contexto.", "Sanitización k-anónima in-RAM; política de egreso de datos.", "1,2 ms", "BENCHMARK"],
    57	  ["LLM08 · Excessive Agency", "El agente ejecuta acciones más allá de su mandato declared.", "Puerta de ejecución ex-ante; scope de acción por identidad firmada.", "0,4 ms", "BENCHMARK"],
    58	  ["LLM10 · Unbounded Consumption", "Consumo ilimitado de tokens, cómputo o presupuesto.", "Context Slicing y umbrales deterministas por política.", "1,1 ms", "BENCHMARK"],
    59	];
    60	
    61	const INTEROP = [
    62	  ["OPENAI", "GPT-4 · GPT-5 · o-series", "Intercepta las llamadas salientes hacia la API antes de que el prompt abandone su perímetro.", "PROXY / SDK"],
    63	  ["ANTHROPIC", "Claude family", "Control de herramientas (tool-use) y de acciones autónomas sobre recursos corporativos.", "PROXY / SDK"],
    64	  ["GOOGLE", "Gemini family", "Gobernanza del tráfico multimodal con la misma política declarativa.", "PROXY"],
    65	  ["MODELOS LOCALES", "Llama · Mistral · DeepSeek", "Daemon local para inferencia privada: el control vive donde vive el modelo.", "DAEMON"],
    66	];
    67	
    68	const DEPLOYMENT = [
    69	  ["VPC PRIVADA", "El nodo se despliega dentro de su nube virtual. Sus claves, sus políticas, su red.", "Business GRC / Enterprise"],
    70	  ["PRIVATE CLOUD", "Clúster Kubernetes gestionado por su equipo con Helm chart firmado.", "Business GRC / Enterprise"],
    71	  ["ON-PREMISE", "Servidor físico o virtual en su centro de datos. Systemd o servicio Windows.", "Enterprise / Legal Shield"],
    72	  ["AIR-GAPPED", "Red aislada sin salida a Internet. Actualización de políticas por paquete firmado offline.", "Enterprise / Legal Shield"],
    73	];
    74	
    75	const TELEMETRIA_SALE = [
    76	  "Contadores numéricos de veredictos (ALLOW / DENY / REVIEW)",
    77	  "Estado y versión de la política activa",
    78	  "Digest criptográfico SHA-256 de los veredictos",
    79	  "Identificador técnico del nodo desplegado",
    80	  "Métricas de latencia de aplicación del motor",
    81	];
    82	
    83	const TELEMETRIA_NO_SALE = [
    84	  "Prompts ni respuestas del modelo en texto claro",
    85	  "Datos personales (PII / PHI) ni identificadores de usuario",
    86	  "Secretos corporativos, claves de API ni credenciales",
    87	  "Contenido de conversaciones ni documentos procesados",
    88	  "Topología interna de su infraestructura",
    89	];
    90	
    91	const BUEN_USO = [
    92	  ["HUMAN-IN-THE-LOOP", "El veredicto REVIEW deriva la acción a un operador humano. Ninguna decisión de alto impacto se automatiza sin vía de escalado."],
    93	  ["GOBERNANZA VIVA", "Las políticas se versionan y firman. Cada cambio queda registrado con autoría y marca de tiempo: la gobernanza es auditable."],
    94	  ["PROPÓSITO DECLARADO", "S.A.A.R.E. es infraestructura de contención y prueba. No es una herramienta de vigilancia de personas ni de perfilado de empleados."],
    95	  ["TRANSPARENCIA RADICAL", "Todo dato mostrado declara su naturaleza (DEMO, BENCHMARK, REFERENCE, LIVE). Ningún ejemplo se presenta como promesa universal."],
    96	];
    97	
    98	const PARTNER_ENTREGABLES = [
    99	  ["ENTREGABLE 01", "Informe de gobernanza de IA", "Documento técnico que acredita la implantación del plano de control, firmado y verificable."],
   100	  ["ENTREGABLE 02", "Matriz de cumplimiento operativo", "Trazabilidad de obligaciones (EU AI Act, DORA, NIS 2, RGPD) a controles ejecutables con evidencia asociada."],
   101	  ["ENTREGABLE 03", "Expediente de evidencia sellada", "Muestra de la cadena de custodia del cliente: raíz Merkle, firma Ed25519 y sello RFC 3161."],
   102	];
   103	
   104	const CATALOGO = [
   105	  {
   106	    id: "free-explorer",
   107	    grupo: "VERIFICACIÓN",
   108	    etiqueta: "FREE / EXPLORER",
   109	    nombre: "Verificador Público (Trust Layer)",
   110	    claim: "Verificación puntual de hashes y veredictos existentes.",
   111	    precio: "0 €",
   112	    sufijo: "/gratuito",
   113	    unidad: "Acceso público ilimitado",
   114	    comprador: "Auditores, examinadores y usuarios web",
   115	    features: ["Verificación puntual de hashes", "Acceso directo al Public Trust Anchor"],
   116	    cta: "USAR VERIFICADOR PÚBLICO ↗",
   117	    actionType: "link",
   118	    href: "#trust-anchor",
   119	    featured: false,
   120	  },
   121	  {
   122	    id: "developer-pro",
   123	    grupo: "RUNTIME EDGE",
   124	    etiqueta: "DEVELOPER / PRO",
   125	    nombre: "SDK & Runtime Edge",
   126	    claim: "Control L7 con Token Binding y límites de inferencia.",
   127	    precio: "149 €",
   128	    sufijo: "/mes + consumo",
   129	    unidad: "Por nodo / SDK integrado",
   130	    comprador: "Startups y desarrolladores de agentes IA",
   131	    features: ["Sensor L7 y LabEngine SDK nativo", "Inyección de Token Binding X.509"],
   132	    cta: "SUSCRIBIR DEVELOPER ↗",
   133	    actionType: "checkout",
   134	    stripePriceId: "price_saare_dev_pro_monthly",
   135	    featured: false,
   136	  },
   137	  {
   138	    id: "business-grc",
   139	    grupo: "SAAS & GRC",
   140	    etiqueta: "BUSINESS GRC",
   141	    nombre: "Business GRC Console (Todo en Uno)",
   142	    claim: "Generación automatizada de informes EU AI Act y blindaje.",
   143	    precio: "290 €",
   144	    sufijo: "/mes",
   145	    unidad: "Por tenant / organización",
   146	    comprador: "Pymes tecnológicas y empresas con LLMs internos",
   147	    features: ["Acceso completo a SAARE Console (4 superficies RBAC)", "Generación automática de informes PDF EU AI Act"],
   148	    cta: "SUSCRIBIR BUSINESS GRC ↗",
   149	    actionType: "checkout",
   150	    stripePriceId: "price_saare_business_grc_monthly",
   151	    featured: true,
   152	  },
   153	  {
   154	    id: "enterprise-shield",
   155	    grupo: "ENTERPRISE",
   156	    etiqueta: "ENTERPRISE / LEGAL SHIELD",
   157	    nombre: "Enterprise / Legal Shield (Custom PKI)",
   158	    claim: "Inmunidad pericial, PKI propia y acuerdos SLA.",
   159	    precio: "3.500 €",
   160	    sufijo: "/mes",
   161	    unidad: "Por nodo Enterprise con HSM",
   162	    comprador: "Corporaciones, aseguradoras y despachos jurídicos",
   163	    features: ["Certificados de evidencia preconstituida", "Integración nativa con HSM / PKI corporativa propia"],
   164	    cta: "SOLICITAR PROPUESTA ENTERPRISE ↗",
   165	    actionType: "link",
   166	    href: WHATSAPP_URL,
   167	    featured: false,
   168	  },
   169	];
   170	
   171	const VISTAS_CONSOLA = [
   172	  {
   173	    id: "executive",
   174	    badge: "VISTA BOARD / EXECUTIVE",
   175	    titular: "Gobernanza cuantitativa y blindaje de responsabilidad",
   176	    pregunta: "¿Qué riesgo está asumiendo el negocio?",
   177	    rol: "BOARD_EXECUTIVE_LEVEL_1",
   178	    metricas: [
   179	      ["RIESGO ACUMULADO EX-ANTE", "0,02 %", "DEMO"],
   180	      ["TOKENS INTERCEPTADOS / MES", "142.800 €", "DEMO"],
   181	      ["AGENTES EN PRODUCCIÓN", "37 trazados", "DEMO"],
   182	      ["EXPOSICIÓN BAJO DORA", "MITIGADA", "DEMO"],
   183	    ],
   184	    matriz: [
   185	      ["EU AI Act art. 14", "Supervisión humana efectiva", "Cambio de política en vivo sin reiniciar sistemas", "Registro de cambio firmado"],
   186	      ["EU AI Act art. 15", "Precisión y robustez del sistema", "Contención fail-closed y tolerancia estructural", "Veredicto firmado con latencia"],
   187	      ["DORA art. 5", "Gobernanza y responsabilidad", "Políticas locales firmadas sin dependencia de red", "Registro de autonomía de nodo"],
   188	      ["DORA art. 9", "Protección de incidentes TIC", "Intercepción ex-ante contra vectores L7", "Registro de intercepción sellado"],
   189	      ["NIS 2 art. 20", "Responsabilidad de alta dirección", "Telemetría determinista sin contenido ni PII", "Contadores anónimos firmados"],
   190	    ],
   191	  },
   192	  {
   193	    id: "grc",
   194	    badge: "VISTA GRC / PRIVACIDAD",
   195	    titular: "La prueba llegó antes que el litigio",
   196	    pregunta: "¿Qué controles puedo demostrar?",
   197	    rol: "DPO_GRC_LEVEL_2",
   198	    metricas: [
   199	      ["ENMASCARAMIENTO PII", "DNI · IBAN · PHI", "REFERENCE"],
   200	      ["CLASIFICACIÓN AI ACT", "Inaceptable · Alto · Limitado", "REFERENCE"],
   201	      ["RGPD ART. 32", "Arquitectura Zero-Disk", "REFERENCE"],
   202	      ["REGISTRO EIPD", "Inmutable y firmado", "REFERENCE"],
   203	    ],
   204	    matriz: [
   205	      ["EU AI Act art. 10", "Gobernanza de datos", "Generalización y seudonimización ex-ante", "Registro de política aplicada"],
   206	      ["EU AI Act art. 12", "Registro automático de eventos", "Registro en memoria sin violar minimización", "Huella criptográfica"],
   207	      ["RGPD art. 5", "Minimización de datos", "Zeroización tras la firma, sin persistencia", "Digest HMAC-SHA256"],
   208	      ["RGPD art. 32", "Seguridad del tratamiento", "Sanitización en RAM y arquitectura Zero-Disk", "Registro de no exfiltración"],
   209	      ["ISO/IEC 27037", "Evidencia digital", "Cadena de Merkle y firma asimétrica", "Dossier forense offline"],
   210	      ["Arts. 281 y 326 LEC", "Prueba documental", "Sellado cualificado y cadena de custodia", "Expediente para revisión pericial"],
   211	    ],
   212	  },
   213	  {
   214	    id: "cyber",
   215	    badge: "VISTA CISO / RESILIENCIA",
   216	    titular: "Ve cada intercepción mientras ocurre",
   217	    pregunta: "¿Qué está bloqueando el motor ahora?",
   218	    rol: "CISO_SECOPS_LEVEL_3",
   219	    metricas: [
   220	      ["PROMPT INJECTION L7", "Intercepción en tiempo real", "REFERENCE"],
   221	      ["SHADOW AI", "Descubrimiento automático", "REFERENCE"],
   222	      ["ESTADO FAIL-CLOSED", "100 % activo", "REFERENCE"],
   223	      ["LATENCIA DE APLICACIÓN", "1,18 ms", "BENCHMARK"],
   224	    ],
   225	    matriz: [
   226	      ["LLM01 · Prompt Injection", "Manipulación directa del modelo", "Separación estricta de roles sintácticos", "0,8 ms · BENCHMARK"],
   227	      ["LLM02 · Insecure Output", "Salida no validada hacia sistemas", "Validación de integridad dicotómica", "1,4 ms · BENCHMARK"],
   228	      ["LLM06 · Sensitive Info", "Exfiltración de datos sensibles", "Sanitización k-anónima in-RAM", "1,2 ms · BENCHMARK"],
   229	      ["LLM08 · Excessive Agency", "Acciones fuera de política", "Puerta de ejecución ex-ante", "0,4 ms · BENCHMARK"],
   230	      ["LLM10 · Unbounded Consumption", "Consumo ilimitado de recursos", "Context Slicing y umbral determinista", "1,1 ms · BENCHMARK"],
   231	    ],
   232	  },
   233	  {
   234	    id: "forense",
   235	    badge: "VISTA FORENSE / PERICIAL",
   236	    titular: "Verifique la evidencia sin confiar en nosotros",
   237	    pregunta: "¿Puedo verificar la evidencia independientemente?",
   238	    rol: "FORENSIC_EXTERNAL_LEVEL_4",
   239	    metricas: [
   240	      ["CADENA DE CUSTODIA", "Digest · Merkle · Ed25519 · RFC 3161", "REFERENCE"],
   241	      ["VERIFICACIÓN", "Independiente, offline, por CLI", "REFERENCE"],
   242	      ["BÓVEDA", "Ciega: sin acceso al contenido", "REFERENCE"],
   243	      ["VALOR PROCESAL", "Arts. 281 / 326 LEC", "REFERENCE"],
   244	    ],
   245	    matriz: [
   246	      ["Art. 326 LEC", "Documentos privados", "Dossier firmado y sellado con marca cualificada", "Expediente exportable verificable"],
   247	      ["Art. 299 LEC", "Prueba pericial", "Verificación independiente por tercero cualificado", "Informe pericial sobre cadena"],
   248	      ["ISO/IEC 27037", "Evidencia digital", "Identificación, recolección y preservación selladas", "Cadena de custodia documentada"],
   249	      ["eIDAS (Reg. 910/2014)", "Sello cualificado", "Marcado RFC 3161 por autoridad reconocida", "Token de tiempo offline"],
   250	    ],
   251	  },
   252	];
   253	
   254	/* ==========================================================================
   255	   COMPONENTES UI AUXILIARES
   256	   ========================================================================== */
   257	function DataLabel({ type }) {
   258	  const conf = METRIC_LABELS[type] || METRIC_LABELS.DEMO;
   259	  return (
   260	    <span className={`inline-block font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border tracking-widest ${conf.cls}`}>
   261	      {conf.text}
   262	    </span>
   263	  );
   264	}
   265	
   266	function MetricCard({ label, value, tag = "DEMO" }) {
   267	  return (
   268	    <div className="bg-saare-surface border border-saare-line p-4 rounded-lg font-mono">
   269	      <div className="flex items-center justify-between gap-2">
   270	        <span className="text-[9px] text-saare-ink-faint uppercase tracking-widest">{label}</span>
   271	        <DataLabel type={tag} />
   272	      </div>
   273	      <div className="text-saare-ink font-bold text-base mt-2">{value}</div>
   274	    </div>
   275	  );
   276	}
   277	
   278	function PageHeader({ badge, title, description }) {
   279	  return (
   280	    <div className="border-b border-saare-line bg-saare-surface/60 py-12">
   281	      <div className="max-w-6xl mx-auto px-6">
   282	        <span className="font-mono text-xs font-bold text-saare-accent uppercase tracking-widest bg-saare-accent/10 border border-saare-accent/30 px-3 py-1 rounded">
   283	          {badge}
   284	        </span>
   285	        <h2 className="font-bold text-3xl sm:text-5xl text-saare-ink mt-4 tracking-tight leading-tight font-display">{title}</h2>
   286	        <p className="mt-4 text-saare-ink-dim text-sm sm:text-base max-w-4xl leading-relaxed font-sans">{description}</p>
   287	      </div>
   288	    </div>
   289	  );
   290	}
   291	
   292	function SectionTitle({ kicker, title, lead }) {
   293	  return (
   294	    <div className="mb-8">
   295	      {kicker && <span className="font-mono text-[11px] font-bold text-saare-accent uppercase tracking-widest">{kicker}</span>}
   296	      <h2 className="text-2xl sm:text-4xl font-bold text-saare-ink mt-2 font-display tracking-tight">{title}</h2>
   297	      {lead && <p className="text-xs sm:text-sm text-saare-ink-dim mt-3 font-mono leading-relaxed max-w-3xl">{lead}</p>}
   298	    </div>
   299	  );
   300	}
   301	
   302	function CodePanel({ code, title = "INTEGRACIÓN TÉCNICA · CÓDIGO NATIVO" }) {
   303	  return (
   304	    <div className="bg-saare-surface-2 border border-saare-line rounded-lg overflow-hidden shadow-xl">
   305	      <div className="bg-saare-surface border-b border-saare-line px-4 py-2 font-mono text-[10px] text-saare-accent font-bold tracking-widest">{title}</div>
   306	      <pre className="p-4 text-[11px] font-mono text-saare-allow overflow-x-auto leading-relaxed">{code}</pre>
   307	    </div>
   308	  );
   309	}
   310	
   311	function DataRow({ label, value }) {
   312	  return (
   313	    <div className="flex justify-between items-start gap-4 border-b border-saare-line/70 pb-2 text-[11px] font-mono">
   314	      <span className="text-saare-ink-faint min-w-0">{label}</span>
   315	      <span className="text-saare-ink text-right break-words min-w-0">{value}</span>
   316	    </div>
   317	  );
   318	}
   319	
   320	function VerdictChip({ verdict }) {
   321	  const map = {
   322	    ALLOW: "bg-saare-allow/15 border-saare-allow text-saare-allow",
   323	    DENY: "bg-saare-deny/15 border-saare-deny text-saare-deny",
   324	    REVIEW: "bg-saare-seal/15 border-saare-seal text-saare-seal",
   325	    VERIFIED: "bg-saare-allow/15 border-saare-allow text-saare-allow",
   326	    UNVERIFIABLE: "bg-saare-deny/15 border-saare-deny text-saare-deny",
   327	  };
   328	  return (
   329	    <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${map[verdict] || map.REVIEW}`}>
   330	      {verdict}
   331	    </span>
   332	  );
   333	}
   334	
   335	function DataTable({ headers, rows, renderLast }) {
   336	  return (
   337	    <div className="overflow-x-auto -mx-2 px-2">
   338	      <table className="w-full min-w-[720px] text-left font-mono text-xs border-collapse">
   339	        <thead>
   340	          <tr className="border-b border-saare-line text-saare-accent">
   341	            {headers.map((h, i) => (
   342	              <th key={i} className={`pb-3 pr-4 align-bottom ${i === 0 ? "whitespace-nowrap" : ""}`}>
   343	                {h}
   344	              </th>
   345	            ))}
   346	          </tr>
   347	        </thead>
   348	        <tbody className="divide-y divide-saare-line text-saare-ink-dim">
   349	          {rows.map((r, ri) => (
   350	            <tr key={ri}>
   351	              {r.map((cell, ci) => (
   352	                <td key={ci} className={`py-3 pr-4 align-top leading-relaxed ${ci === 0 ? "font-bold text-saare-ink whitespace-nowrap" : ""}`}>
   353	                  {ci === r.length - 1 && renderLast ? renderLast(cell) : cell}
   354	                </td>
   355	              ))}
   356	            </tr>
   357	          ))}
   358	        </tbody>
   359	      </table>
   360	    </div>
   361	  );
   362	}
   363	
   364	/* ==========================================================================
   365	   LANDING PAGE CONTINUA
   366	   ========================================================================== */
   367	function LandingPage() {
   368	  const [hash, setHash] = useState(DEMO_ROOT_MERKLE_HASH);
   369	  const [verifyResult, setVerifyResult] = useState(null);
   370	  const [loadingVerify, setLoadingVerify] = useState(false);
   371	  const [formSent, setFormSent] = useState(false);
   372	  const [trialForm, setTrialForm] = useState({ nombre: "", empresa: "", email: "", modo: "proxy", mensaje: "" });
   373	
   374	  async function handleVerify(e) {
   375	    e.preventDefault();
   376	    if (!hash.trim()) return;
   377	    setLoadingVerify(true);
   378	    const result = await verifyMerkleHash(hash.trim());
   379	    setVerifyResult(result);
   380	    setLoadingVerify(false);
   381	  }
   382	
   383	  async function handleTrialSubmit(e) {
   384	    e.preventDefault();
   385	    try {
   386	      await saareFetch('/v1/trial/submit', { method: 'POST', body: trialForm });
   387	    } catch {
   388	      // Continuación limpia independientemente del estado offline/demo
   389	    }
   390	    setFormSent(true);
   391	  }
   392	
   393	  return (
   394	    <div className="min-h-screen bg-saare-bg text-saare-ink font-sans selection:bg-saare-accent selection:text-black">
   395	      {/* BANNER SUPERIOR DE NAVEGACIÓN Y ACCESO CONSOLA */}
   396	      <div className="border-b border-saare-line bg-saare-surface px-4 py-2 text-center text-[10px] sm:text-xs font-mono text-saare-ink-faint flex justify-between items-center max-w-7xl mx-auto">
   397	        <div>
   398	          <span className="text-saare-accent font-bold">S.A.A.R.E. SGP 1.0</span>
   399	          <span className="mx-2 hidden sm:inline">·</span>
   400	          <span className="hidden sm:inline">Infraestructura de autorización ex-ante y gobernanza runtime L7</span>
   401	        </div>
   402	        <Link to="/login" className="text-saare-accent font-bold hover:underline bg-saare-accent/10 border border-saare-accent/30 px-2.5 py-1 rounded">
   403	          ACCEDER A CONSOLA ↗
   404	        </Link>
   405	      </div>
   406	
   407	      <main>
   408	        {/* 01 · HERO + DECISION TRACE */}
   409	        <section className="relative overflow-hidden border-b border-saare-line bg-saare-bg">
   410	          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#232E4222_1px,transparent_1px),linear-gradient(to_bottom,#232E4222_1px,transparent_1px)] bg-[size:48px_48px]" />
   411	
   412	          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
   413	            <div className="grid xl:grid-cols-[1.1fr_.9fr] gap-12 items-center">
   414	              <div>
   415	                <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-saare-accent bg-saare-accent/10 border border-saare-accent/30 px-3 py-1 rounded">
   416	                  GOBERNANZA EJECUTABLE & BLINDAJE EU AI ACT
   417	                </span>
   418	
   419	                <h1 className="font-display font-bold text-4xl sm:text-6xl text-saare-ink tracking-tight leading-[1.02] mt-6">
   420	                  Sus agentes de IA actúan.<br />
   421	                  <span className="text-saare-accent">S.A.A.R.E. decide antes.</span>
   422	                </h1>
   423	
   424	                <p className="mt-6 max-w-2xl text-base sm:text-lg text-saare-ink-dim leading-relaxed font-sans">
   425	                  Convierte las políticas de uso de IA en una decisión ejecutable
   426	                  antes de que la acción alcance el sistema, garantizando cumplimiento legal y defensa corporativa.
   427	                </p>
   428	
   429	                <div className="mt-8 flex flex-wrap items-center gap-4">
   430	                  <a href="#trial" className="px-6 py-3.5 rounded bg-saare-accent text-black font-mono text-xs font-bold hover:bg-saare-accent/80 transition">
   431	                    SOMETER UN AGENTE ↗
   432	                  </a>
   433	                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="px-6 py-3.5 rounded border border-saare-line-hi text-saare-ink font-mono text-xs font-bold hover:bg-saare-surface transition">
   434	                    SOLICITAR ARQUITECTURA ENTERPRISE ↗
   435	                  </a>
   436	                </div>
   437	
   438	                <div className="mt-8 flex items-center gap-6 font-mono text-[10px] text-saare-ink-faint">
   439	                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-saare-allow"></span> ALLOW / DENY</span>
   440	                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-saare-accent"></span> EX-ANTE</span>
   441	                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-saare-seal"></span> FAIL-CLOSED</span>
   442	                </div>
   443	              </div>
   444	
   445	              <div className="bg-saare-surface border border-saare-line rounded-xl overflow-hidden shadow-2xl">
   446	                <div className="flex items-center justify-between border-b border-saare-line px-4 py-2.5 bg-saare-surface-2">
   447	                  <span className="font-mono text-[10px] tracking-widest text-saare-ink-dim">S.A.A.R.E. / DECISION TRACE</span>
   448	                  <DataLabel type="REFERENCE" />
   449	                </div>
   450	                <div className="p-6 font-mono text-xs space-y-3">
   451	                  <DataRow label="AGENT" value="treasury-agent-04" />
   452	                  <DataRow label="ACTION" value="SEND_PAYMENT" />
   453	                  <DataRow label="RESOURCE" value="core-banking-api://transfers" />
   454	                  <DataRow label="POLICY" value="FIN-PAYMENT-042 (v17)" />
   455	                  <DataRow label="RISK" value="HIGH · OUTBOUND" />
   456	                  <div className="pt-3 flex items-center justify-between border-t border-saare-line">
   457	                    <span className="text-saare-ink-faint">VERDICT</span>
   458	                    <VerdictChip verdict="DENY" />
   459	                  </div>
   460	                  <div className="text-[9px] text-saare-ink-faint pt-2 border-t border-saare-line/40 break-all">
   461	                    MERKLE ROOT: {DEMO_ROOT_MERKLE_HASH}
   462	                  </div>
   463	                </div>
   464	              </div>
   465	            </div>
   466	          </div>
   467	        </section>
   468	
   469	        {/* 02 · PUBLIC TRUST ANCHOR */}
   470	        <section id="trust-anchor" className="border-b border-saare-line bg-black py-16">
   471	          <div className="max-w-7xl mx-auto px-6">
   472	            <div className="grid lg:grid-cols-[.85fr_1.15fr] gap-8 items-center">
   473	              <div>
   474	                <span className="font-mono text-[10px] font-bold text-saare-seal uppercase tracking-[0.2em]">FREE / EXPLORER (TRUST LAYER)</span>
   475	                <h2 className="font-display text-2xl sm:text-3xl font-bold text-saare-ink mt-2">No confíe en nosotros. Verifique.</h2>
   476	                <p className="mt-3 text-xs text-saare-ink-dim leading-relaxed font-mono">
   477	                  La consulta y verificación de veredictos unitarios (Trust Layer) es pública y gratuita.
   478	                  Valide cualquier hash SHA-256 o identificador VRD- para comprobar la fehaciencia erga omnes de la evidencia.
   479	                </p>
   480	              </div>
   481	              <div>
   482	                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
   483	                  <input
   484	                    value={hash}
   485	                    onChange={(e) => setHash(e.target.value)}
   486	                    placeholder="Merkle Root o ID de evidencia (VRD-...)"
   487	                    className="flex-1 bg-saare-surface border border-saare-line px-4 py-3 text-xs font-mono text-saare-ink rounded focus:outline-none focus:border-saare-seal"
   488	                  />
   489	                  <button type="submit" disabled={loadingVerify} className="px-5 py-3 rounded bg-saare-seal text-black font-mono text-xs font-bold hover:bg-saare-seal/80 transition cursor-pointer">
   490	                    {loadingVerify ? 'CONSULTANDO...' : 'VERIFICAR'}
   491	                  </button>
   492	                </form>
   493	                {verifyResult && (
   494	                  <div className="mt-3 rounded border p-4 bg-saare-surface font-mono border-saare-allow/50">
   495	                    <div className="flex items-center gap-2">
   496	                      <VerdictChip verdict={verifyResult.status} />
   497	                      <span className="text-xs text-saare-ink">Registro confirmado en el Trust Anchor</span>
   498	                    </div>
   499	                    <div className="mt-3 space-y-2">
   500	                      <DataRow label="ALGORITHM" value={verifyResult.algorithm} />
   501	                      <DataRow label="TIMESTAMP" value={verifyResult.standard} />
   502	                      <DataRow label="EVIDENCE" value="MERKLE ROOT" />
   503	                    </div>
   504	                    <div className="mt-2 text-[10px] text-saare-ink-faint break-all">{verifyResult.hash}</div>
   505	                  </div>
   506	                )}
   507	              </div>
   508	            </div>
   509	          </div>
   510	        </section>
   511	
   512	        {/* 03 · CUMPLIMIENTO NORMATIVO EIDAS */}
   513	        <section className="border-b border-saare-line bg-saare-surface py-20">
   514	          <div className="max-w-7xl mx-auto px-6">
   515	            <SectionTitle
   516	              kicker="CUMPLIMIENTO NORMATIVO EUROPEO"
   517	              title="Sellado eIDAS RFC 3161 por Delegación"
   518	              lead="Garantía jurídica plena sin los costes ni la fricción de operar como QTSP primario. S.A.A.R.E. ancla los árboles de Merkle mediante autoridades de certificación cualificadas de la Unión Europea."
   519	            />
   520	            <div className="grid lg:grid-cols-2 gap-8 mt-10">
   521	              <div className="bg-saare-surface-2 border border-saare-line p-6 rounded-xl font-mono text-xs space-y-4">
   522	                <div className="text-saare-accent font-bold uppercase tracking-widest text-[10px]">ARQUITECTURA DE CONFIANZA EIDAS</div>
   523	                <h3 className="text-saare-ink font-bold text-sm">Heredando la validez jurídica europea</h3>
   524	                <p className="text-saare-ink-dim leading-relaxed text-[11px]">
   525	                  En lugar de someter a la organización a costosas auditorías de hardware HSM primario (ETSI EN 319 401), S.A.A.R.E. empaqueta el Root Merkle Bound local y solicita un Time-Stamp Token (TST) a un Prestador Cualificado de Servicios de Confianza (QTSP) homologado.
   526	                </p>
   527	                <div className="space-y-2 pt-2 border-t border-saare-line">
   528	                  <DataRow label="ESTÁNDAR" value="RFC 3161 · eIDAS Reg. 910/2014" />
   529	                  <DataRow label="VALOR PROCESAL" value="Arts. 281 y 326 LEC (España / UE)" />
   530	                  <DataRow label="COSTE OPERATIVO" value="Optimizado por delegación de API" />
   531	                </div>
   532	              </div>
   533	              <CodePanel
   534	                title="ESTRUCTURA DEL SELLO EIDAS (REFERENCE JSON)"
   535	                code={`{
   536	  "expediente": "IA-2026-VAL-AUD-8842-XF",
   537	  "qtsp_provider": "Autoridad Cualificada UE (RFC 3161)",
   538	  "root_merkle_bound": "c1b681097685b75ef8e965aebd...",
   539	  "time_stamp_token": "TST-901842-EU-SECURE",
   540	  "legal_status": "PRESUNCIÓN DE INTEGRIDAD Y NO REPUDIO",
   541	  "conformity": [
   542	    "eIDAS (Reg. 910/2014)",
   543	    "EU AI Act Art. 12/15",
   544	    "LEC Art. 326"
   545	  ]
   546	}`}
   547	              />
   548	            </div>
   549	          </div>
   550	        </section>
   551	
   552	        {/* 04 · DE PAPEL A ENFORCEMENT */}
   553	        <section className="border-b border-saare-line bg-saare-bg py-20">
   554	          <div className="max-w-7xl mx-auto px-6">
   555	            <SectionTitle
   556	              kicker="DE PAPEL A ENFORCEMENT"
   557	              title="Tu política de IA no debería ser solo un documento. Debería poder ejecutarse."
   558	              lead="Un Plan de Uso de IA en papel no detiene una fuga ni evita multas del EU AI Act. La misma política, compilada a regla versionada, sí."
   559	            />
   560	            <div className="grid lg:grid-cols-2 gap-8 mt-10">
   561	              <div className="bg-saare-surface border border-saare-line rounded-xl p-6">
   562	                <div className="font-mono text-[10px] font-bold text-saare-deny tracking-widest mb-6">ANTES · GOBIERNO DOCUMENTAL</div>
   563	                <div className="space-y-4 font-mono text-xs">
   564	                  {[
   565	                    ["POLÍTICA DE USO DE IA", "Documento aprobado por dirección"],
   566	                    ["PDF", "Distribuido por correo interno"],
   567	                    ["FORMACIÓN", "Sesión anual de concienciación"],
   568	                    ["CONFIANZA EN EL USUARIO", "Sin control técnico efectivo"],
   569	                  ].map(([t, d], i, arr) => (
   570	                    <div key={t}>
   571	                      <div className="bg-saare-surface-2 border border-saare-line p-4 rounded-lg">
   572	                        <div className="text-saare-ink font-bold">{t}</div>
   573	                        <div className="text-[10px] text-saare-ink-faint mt-1">{d}</div>
   574	                      </div>
   575	                      {i < arr.length - 1 && <div className="text-center text-saare-ink-faint py-1">↓</div>}
   576	                    </div>
   577	                  ))}
   578	                </div>
   579	              </div>
   580	
   581	              <div className="bg-saare-surface border border-saare-allow/30 rounded-xl p-6">
   582	                <div className="font-mono text-[10px] font-bold text-saare-allow tracking-widest mb-6">CON S.A.A.R.E. · GOBIERNO EJECUTABLE</div>
   583	                <div className="space-y-4 font-mono text-xs">
   584	                  {[
   585	                    ["POLÍTICA", "La misma decisión de gobierno"],
   586	                    ["REGLA VERSIONADA", "Compilada a nativo y firmada"],
   587	                    ["DECISIÓN EX-ANTE", "Antes de que la acción ocurra"],
   588	                    ["ALLOW / DENY", "Veredicto binario en el punto de acción"],
   589	                    ["EVIDENCIA", "Digest sellado, firmado y anclado"],
   590	                  ].map(([t, d], i, arr) => (
   591	                    <div key={t}>
   592	                      <div className="bg-saare-surface-2 border border-saare-allow/20 p-4 rounded-lg">
   593	                        <div className="text-saare-ink font-bold">{t}</div>
   594	                        <div className="text-[10px] text-saare-ink-faint mt-1">{d}</div>
   595	                      </div>
   596	                      {i < arr.length - 1 && <div className="text-center text-saare-allow/60 py-1">↓</div>}
   597	                    </div>
   598	                  ))}
   599	                </div>
   600	              </div>
   601	            </div>
   602	          </div>
   603	        </section>
   604	
   605	        {/* 05 · SIETE DIMENSIONES */}
   606	        <section className="border-b border-saare-line bg-saare-surface py-20">
   607	          <div className="max-w-7xl mx-auto px-6">
   608	            <SectionTitle
   609	              kicker="MODELO DE EVALUACIÓN"
   610	              title="Siete dimensiones resueltas antes de cada acción"
   611	              lead="Cada intento de acción se descompone en siete preguntas. Si alguna dimensión falla contra la política firmada, el veredicto es DENY y no hay ejecución."
   612	            />
   613	            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10">
   614	              {DIMENSIONS.map(([dim, title, desc]) => (
   615	                <div key={dim} className="bg-saare-surface-2 border border-saare-line p-5 rounded-lg font-mono">
   616	                  <div className="text-[10px] text-saare-accent font-bold">{dim}</div>
   617	                  <div className="text-saare-ink font-bold text-sm mt-2">{title}</div>
   618	                  <div className="text-[11px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</div>
   619	                </div>
   620	              ))}
   621	            </div>
   622	          </div>
   623	        </section>
   624	
   625	        {/* 06 · DECISION PATH */}
   626	        <section className="border-b border-saare-line bg-saare-bg py-20">
   627	          <div className="max-w-7xl mx-auto px-6">
   628	            <SectionTitle
   629	              kicker="DECISION PATH"
   630	              title="Action → Verdict → Permit"
   631	              lead="El recorrido completo de una acción dentro del plano de control. Todo ocurre en memoria volátil del nodo; solo el digest del resultado abandona el proceso."
   632	            />
   633	            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mt-10 font-mono">
   634	              {DECISION_PATH.map(([num, title, desc, state]) => (
   635	                <div key={num} className="bg-saare-surface border border-saare-line p-4 rounded-lg">
   636	                  <div className="flex items-center justify-between">
   637	                    <span className="text-[10px] text-saare-accent font-bold">{num}</span>
   638	                    <span className="text-[8px] text-saare-ink-faint font-bold">{state}</span>
   639	                  </div>
   640	                  <div className="text-saare-ink font-bold text-xs mt-2">{title}</div>
   641	                  <div className="text-[10px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</div>
   642	                </div>
   643	              ))}
   644	            </div>
   645	          </div>
   646	        </section>
   647	
   648	        {/* 07 · CADENA DE CUSTODIA (EVIDENCE CHAIN) */}
   649	        <section className="border-b border-saare-line bg-saare-surface py-20">
   650	          <div className="max-w-7xl mx-auto px-6">
   651	            <div className="grid lg:grid-cols-2 gap-10 items-start">
   652	              <div>
   653	                <SectionTitle
   654	                  kicker="EVIDENCE CHAIN"
   655	                  title="Digest → Merkle → Ed25519 → RFC 3161"
   656	                  lead="Cada veredicto puede convertirse en una prueba verificable por un tercero, sin necesidad de confiar en S.A.A.R.E. ni en su infraestructura."
   657	                />
   658	                <div className="space-y-3 font-mono text-xs">
   659	                  {EVIDENCE_CHAIN.map(([tag, name, desc]) => (
   660	                    <div key={tag} className="bg-saare-surface-2 border border-saare-line p-4 rounded-lg">
   661	                      <div className="flex items-center gap-3">
   662	                        <span className="text-[9px] font-bold text-saare-accent bg-saare-accent/10 border border-saare-accent/30 px-2 py-0.5 rounded">{tag}</span>
   663	                        <span className="text-saare-ink font-bold">{name}</span>
   664	                      </div>
   665	                      <p className="text-[11px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</p>
   666	                    </div>
   667	                  ))}
   668	                </div>
   669	              </div>
   670	              <div className="bg-saare-surface-2 border border-saare-line rounded-xl p-6 font-mono text-xs space-y-3">
   671	                <div className="flex items-center justify-between border-b border-saare-line pb-3">
   672	                  <span className="text-saare-accent font-bold">EVIDENCE VAULT · CADENA DE CUSTODIA</span>
   673	                  <VerdictChip verdict="VERIFIED" />
   674	                </div>
   675	                <DataRow label="DIGEST" value="SHA-256 · e3b0c44298fc1c14…" />
   676	                <DataRow label="MERKLE ROOT" value="6f1b3986…c7f1a842" />
   677	                <DataRow label="SIGNATURE" value="Ed25519 · HSM_KEY_0x9F" />
   678	                <DataRow label="TIMESTAMP" value="RFC 3161 · eIDAS cualificado" />
   679	                <div className="pt-3 border-t border-saare-line text-[10px] text-saare-ink-faint leading-relaxed">
   680	                  Bóveda ciega: sin persistencia de payloads sensibles en disco. Trazabilidad completa con presunción legal de integridad.
   681	                </div>
   682	              </div>
   683	            </div>
   684	          </div>
   685	        </section>
   686	
   687	        {/* 08 · TRES MODOS DE EJECUCIÓN (SDK, PROXY, DAEMON) */}
   688	        <section className="border-b border-saare-line bg-saare-bg py-20">
   689	          <div className="max-w-7xl mx-auto px-6">
   690	            <SectionTitle
   691	              kicker="DESARROLLADORES & INFRAESTRUCTURA"
   692	              title="Tres modos de ejecución. Un mismo motor."
   693	              lead="La lógica de decisión es idéntica en los tres; cambia únicamente el punto de intercepción según su arquitectura."
   694	            />
   695	
   696	            <div className="grid lg:grid-cols-3 gap-8 mt-10">
   697	              <div className="bg-saare-surface border border-saare-line p-6 rounded-xl space-y-4">
   698	                <span className="text-[10px] font-bold text-saare-allow font-mono uppercase">LABENGINE · MODO SDK</span>
   699	                <h3 className="text-saare-ink font-bold text-xl">El control vive dentro de la aplicación</h3>
   700	                <p className="text-saare-ink-dim text-xs leading-relaxed">
   701	                  Paquete nativo que envuelve las llamadas del agente y consulta al motor en memoria compartida. Sin salida de red: la autorización ocurre in-process.
   702	                </p>
   703	                <CodePanel
   704	                  title="PYTHON (REFERENCE)"
   705	                  code={`from saare import LabEngine
   706	
   707	engine = LabEngine(node_key='HSM', policy='POL-01')
   708	@engine.guard(action='SEND_PAYMENT')
   709	def pay(amount, iban):
   710	    return api.transfer(amount, iban)`}
   711	                />
   712	              </div>
   713	
   714	              <div className="bg-saare-surface border border-saare-line p-6 rounded-xl space-y-4">
   715	                <span className="text-[10px] font-bold text-saare-allow font-mono uppercase">PERIMETERSHIELD · MODO PROXY</span>
   716	                <h3 className="text-saare-ink font-bold text-xl">El control vive en el tráfico</h3>
   717	                <p className="text-saare-ink-dim text-xs leading-relaxed">
   718	                  Pasarela L7 que intercepta cada petición hacia proveedores de IA o APIs internas antes de que salga del perímetro. Docker, Helm o Sidecar.
   719	                </p>
   720	                <CodePanel
   721	                  title="HELM / K8S (REFERENCE)"
   722	                  code={`helm install perimetershield saare/charts \\
   723	  --set node.keyRef=hsm://pkcs11/key-0x9f \\
   724	  --set policy.bundle=FIN-PAYMENT-042:v17 \\
   725	  --set failClosed=true`}
   726	                />
   727	              </div>
   728	
   729	              <div className="bg-saare-surface border border-saare-line p-6 rounded-xl space-y-4">
   730	                <span className="text-[10px] font-bold text-saare-allow font-mono uppercase">LOCAL NODE · MODO DAEMON</span>
   731	                <h3 className="text-saare-ink font-bold text-xl">El control vive en su servidor</h3>
   732	                <p className="text-saare-ink-dim text-xs leading-relaxed">
   733	                  Servicio local para redes aisladas y modelos propios. Systemd o servicio Windows, con claves en HSM del cliente y actualización offline.
   734	                </p>
   735	                <CodePanel
   736	                  title="SYSTEMD (REFERENCE)"
   737	                  code={`saare-cli verify saare-node-1.0.sgp
   738	sudo dpkg -i saare-node-1.0.sgp
   739	sudo systemctl enable --now saare-node`}
   740	                />
   741	              </div>
   742	            </div>
   743	          </div>
   744	        </section>
   745	
   746	        {/* 09 · DEFENSA ACTIVA (OWASP) */}
   747	        <section className="border-b border-saare-line bg-saare-surface py-20">
   748	          <div className="max-w-7xl mx-auto px-6">
   749	            <SectionTitle
   750	              kicker="DEFENSA ACTIVA"
   751	              title="Injection, PII, Shadow AI, Fail-Closed"
   752	              lead="Contención determinista de los vectores críticos del OWASP LLM Top 10, con la latencia medida en banco de pruebas de cada intercepción."
   753	            />
   754	            <div className="bg-saare-surface-2 border border-saare-line rounded-xl p-6 mt-8">
   755	              <DataTable
   756	                headers={["VECTOR OWASP", "MECANISMO DE EXPLOTACIÓN", "MITIGACIÓN DETERMINISTA", "LATENCIA", "ETIQUETA"]}
   757	                rows={DEFENSE_VECTORS}
   758	                renderLast={(cell) => <DataLabel type={cell} />}
   759	              />
   760	            </div>
   761	          </div>
   762	        </section>
   763	
   764	        {/* 10 · INTEROPERABILIDAD Y DESPLIEGUE SOBERANO */}
   765	        <section className="border-b border-saare-line bg-saare-bg py-20">
   766	          <div className="max-w-7xl mx-auto px-6">
   767	            <SectionTitle
   768	              kicker="INTEROPERABILIDAD Y DESPLIEGUE"
   769	              title="Agnóstico al modelo. Soberano en la infraestructura."
   770	              lead="La política se escribe una vez y se aplica igual sobre cualquier modelo, en la nube o en su propio centro de datos."
   771	            />
   772	
   773	            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 font-mono text-xs">
   774	              {INTEROP.map(([name, family, desc, mode]) => (
   775	                <div key={name} className="bg-saare-surface border border-saare-line p-5 rounded-lg">
   776	                  <div className="text-saare-ink font-bold text-sm">{name}</div>
   777	                  <div className="text-[10px] text-saare-accent mt-1">{family}</div>
   778	                  <p className="text-[11px] text-saare-ink-dim mt-3 leading-relaxed">{desc}</p>
   779	                  <div className="text-[9px] text-saare-ink-faint mt-3 font-bold">{mode}</div>
   780	                </div>
   781	              ))}
   782	            </div>
   783	
   784	            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 font-mono text-xs">
   785	              {DEPLOYMENT.map(([name, desc, tramo]) => (
   786	                <div key={name} className="bg-saare-surface border border-saare-line p-5 rounded-lg flex flex-col justify-between">
   787	                  <div>
   788	                    <div className="text-saare-ink font-bold text-sm">{name}</div>
   789	                    <p className="text-[11px] text-saare-ink-dim mt-3 leading-relaxed">{desc}</p>
   790	                  </div>
   791	                  <div className="text-[9px] text-saare-allow font-bold mt-4">{tramo}</div>
   792	                </div>
   793	              ))}
   794	            </div>
   795	          </div>
   796	        </section>
   797	
   798	        {/* 11 · CONSOLA MULTI-VISTA (SAARE_CONSOLE) */}
   799	        <section id="saare-console" className="border-b border-saare-line bg-saare-surface py-20">
   800	          <div className="max-w-7xl mx-auto px-6">
   801	            <SectionTitle
   802	              kicker="saare_console"
   803	              title="Una sola consola para cuatro lecturas del mismo sistema"
   804	              lead="Mismo motor. Mismas decisiones. Misma evidencia. Distinta interpretación según el rol de acceso RBAC."
   805	            />
   806	            <div className="space-y-12 mt-10">
   807	              {VISTAS_CONSOLA.map((v) => (
   808	                <div key={v.id} className="bg-saare-surface-2 border border-saare-line rounded-xl p-8">
   809	                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-saare-line">
   810	                    <div>
   811	                      <span className="font-mono text-xs text-saare-accent font-bold uppercase">{v.badge}</span>
   812	                      <h3 className="text-xl font-bold text-saare-ink mt-1">{v.titular}</h3>
   813	                    </div>
   814	                    <div className="font-mono text-right text-xs">
   815	                      <div className="text-saare-ink-dim">{v.pregunta}</div>
   816	                      <div className="text-saare-ink-faint text-[10px] mt-1">Rol: {v.rol}</div>
   817	                    </div>
   818	                  </div>
   819	
   820	                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
   821	                    {v.metricas.map(([label, value, tag]) => (
   822	                      <MetricCard key={label} label={label} value={value} tag={tag} />
   823	                    ))}
   824	                  </div>
   825	
   826	                  <div className="mb-6">
   827	                    <h4 className="text-xs font-mono font-bold text-saare-accent uppercase tracking-widest mb-3">MATRIZ DE CUMPLIMIENTO / VECTORES</h4>
   828	                    <DataTable
   829	                      headers={["MARCO / VECTOR", "CONTROL / REQUISITO", "MITIGACIÓN S.A.A.R.E.", "EVIDENCIA / LATENCIA"]}
   830	                      rows={v.matriz}
   831	                    />
   832	                  </div>
   833	                </div>
   834	              ))}
   835	            </div>
   836	          </div>
   837	        </section>
   838	
   839	        {/* 12 · MODELO DE MONETIZACIÓN & CATALOGO (STRIPE CHECKOUT) */}
   840	        <section id="licencias" className="border-b border-saare-line bg-saare-bg py-20">
   841	          <div className="max-w-7xl mx-auto px-6">
   842	            <SectionTitle
   843	              kicker="MODELO DE MONETIZACIÓN SAAS & GRC"
   844	              title="Los 4 Niveles de Gobierno y Cumplimiento S.A.A.R.E."
   845	              lead="Desde la verificación pública gratuita hasta la inmunidad pericial Enterprise con PKI propia y blindaje frente al EU AI Act."
   846	            />
   847	            <div className="grid md:grid-cols-4 gap-6 mt-12">
   848	              {CATALOGO.map((item) => (
   849	                <div
   850	                  key={item.id}
   851	                  className={`bg-saare-surface border p-6 rounded-lg font-mono relative flex flex-col justify-between ${
   852	                    item.featured ? "border-saare-allow/50" : "border-saare-accent/40"
   853	                  }`}
   854	                >
   855	                  <div>
   856	                    {item.featured && (
   857	                      <span className="absolute top-4 right-4 text-[9px] font-bold bg-saare-allow/15 border border-saare-allow/40 text-saare-allow px-2 py-0.5 rounded">
   858	                        RECOMENDADO
   859	                      </span>
   860	                    )}
   861	                    <span className="text-[10px] font-bold text-saare-ink-faint uppercase tracking-widest">{item.grupo}</span>
   862	                    <div className="text-xs font-bold text-saare-accent uppercase tracking-widest mt-1">{item.etiqueta}</div>
   863	                    <h3 className="text-saare-ink font-bold text-base mt-2">{item.nombre}</h3>
   864	                    <p className="text-[11px] text-saare-ink-dim leading-relaxed mt-2">{item.claim}</p>
   865	                    <div className="text-2xl font-bold text-saare-ink mt-4">
   866	                      {item.precio}
   867	                      <span className="text-xs font-normal text-saare-ink-faint"> {item.sufijo}</span>
   868	                    </div>
   869	                    <p className="text-[10px] text-saare-ink-faint mt-1">{item.unidad}</p>
   870	                    
   871	                    <ul className="mt-6 space-y-2 text-[11px] border-t border-saare-line pt-4 text-saare-ink-dim">
   872	                      {item.features.map((f, fi) => (
   873	                        <li key={fi} className="flex items-center gap-2">
   874	                          <span className="text-saare-allow">✓</span> {f}
   875	                        </li>
   876	                      ))}
   877	                    </ul>
   878	                  </div>
   879	
   880	                  {item.actionType === "checkout" ? (
   881	                    <button
   882	                      onClick={() => saareCheckout(item.stripePriceId)}
   883	                      className="block w-full text-center px-5 py-3 mt-8 bg-saare-accent text-black font-bold text-xs rounded hover:bg-saare-accent/80 transition cursor-pointer"
   884	                    >
   885	                      {item.cta}
   886	                    </button>
   887	                  ) : (
   888	                    <a
   889	                      href={item.href}
   890	                      target={item.href.startsWith("http") ? "_blank" : "_self"}
   891	                      rel="noreferrer"
   892	                      className="block w-full text-center px-5 py-3 mt-8 bg-saare-accent text-black font-bold text-xs rounded hover:bg-saare-accent/80 transition"
   893	                    >
   894	                      {item.cta}
   895	                    </a>
   896	                  )}
   897	                </div>
   898	              ))}
   899	            </div>
   900	          </div>
   901	        </section>
   902	
   903	        {/* 13 · PROGRAMA PARTNERS */}
   904	        <section className="border-b border-saare-line bg-saare-surface py-20">
   905	          <div className="max-w-7xl mx-auto px-6">
   906	            <SectionTitle
   907	              kicker="CANAL PARTNER"
   908	              title="Venda gobernanza de IA sin construirla."
   909	              lead="S.A.A.R.E. es la solución técnica. El programa Partner es el canal. Licenciamiento marca blanca para consultoras, MSPs y agentes digitalizadores."
   910	            />
   911	            <div className="grid md:grid-cols-3 gap-4 mt-8 font-mono text-xs">
   912	              {PARTNER_ENTREGABLES.map(([num, title, desc]) => (
   913	                <div key={num} className="bg-saare-surface-2 border border-saare-line p-5 rounded-lg">
   914	                  <div className="text-[10px] text-saare-accent font-bold">{num}</div>
   915	                  <div className="text-saare-ink font-bold text-sm mt-2">{title}</div>
   916	                  <p className="text-[11px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</p>
   917	                </div>
   918	              ))}
   919	            </div>
   920	          </div>
   921	        </section>
   922	
   923	        {/* 14 · FORMULARIO TRIAL / SOMETER AGENTE */}
   924	        <section id="trial" className="border-b border-saare-line bg-saare-bg py-20">
   925	          <div className="max-w-4xl mx-auto px-6">
   926	            <PageHeader
   927	              badge="PRUEBA DE CONTROL"
   928	              title="Someta un agente a control"
   929	              description="Evaluación cualificada: desplegamos un nodo de demostración sobre uno de sus agentes y le entregamos el decision trace y la evidencia sellada del ejercicio."
   930	            />
   931	            <div className="mt-8">
   932	              {formSent ? (
   933	                <div className="bg-saare-surface border border-saare-allow/40 rounded-xl p-10 text-center font-mono">
   934	                  <VerdictChip verdict="VERIFIED" />
   935	                  <h2 className="text-saare-ink font-bold text-xl mt-4">Solicitud registrada</h2>
   936	                  <p className="text-saare-ink-dim text-sm mt-3 max-w-md mx-auto leading-relaxed">
   937	                    Un arquitecto de soluciones le contactará en un plazo máximo de 48 h laborables
   938	                    para definir el alcance del ejercicio de control.
   939	                  </p>
   940	                </div>
   941	              ) : (
   942	                <form onSubmit={handleTrialSubmit} className="bg-saare-surface border border-saare-line rounded-xl p-8 font-mono text-xs space-y-5">
   943	                  <div className="grid sm:grid-cols-2 gap-5">
   944	                    <div>
   945	                      <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">NOMBRE Y CARGO</label>
   946	                      <input required value={trialForm.nombre} onChange={(e) => setTrialForm({ ...trialForm, nombre: e.target.value })}
   947	                        className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent" placeholder="Nombre · CISO / CTO / DPO" />
   948	                    </div>
   949	                    <div>
   950	                      <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">ORGANIZACIÓN</label>
   951	                      <input required value={trialForm.empresa} onChange={(e) => setTrialForm({ ...trialForm, empresa: e.target.value })}
   952	                        className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent" placeholder="Empresa o entidad" />
   953	                    </div>
   954	                  </div>
   955	                  <div>
   956	                    <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">EMAIL CORPORATIVO</label>
   957	                    <input required type="email" value={trialForm.email} onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
   958	                      className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent" placeholder="nombre@empresa.com" />
   959	                  </div>
   960	                  <div>
   961	                    <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">MODO DE EJECUCIÓN A EVALUAR</label>
   962	                    <div className="grid sm:grid-cols-3 gap-3">
   963	                      {[
   964	                        ["sdk", "SDK · LabEngine", "Dentro de la aplicación"],
   965	                        ["proxy", "PROXY · PerimeterShield", "En el tráfico de red"],
   966	                        ["daemon", "DAEMON · Local Node", "En el servidor / air-gapped"],
   967	                      ].map(([val, title, desc]) => (
   968	                        <button type="button" key={val} onClick={() => setTrialForm({ ...trialForm, modo: val })}
   969	                          className={`text-left p-4 rounded-lg border transition ${trialForm.modo === val ? "border-saare-accent/60 bg-saare-accent/10" : "border-saare-line bg-saare-surface-2 hover:border-saare-line-hi"}`}>
   970	                          <div className="text-saare-ink font-bold">{title}</div>
   971	                          <div className="text-[10px] text-saare-ink-faint mt-1">{desc}</div>
   972	                        </button>
   973	                      ))}
   974	                    </div>
   975	                  </div>
   976	                  <div>
   977	                    <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">CONTEXTO DEL AGENTE (OPCIONAL)</label>
   978	                    <textarea rows={4} value={trialForm.mensaje} onChange={(e) => setTrialForm({ ...trialForm, mensaje: e.target.value })}
   979	                      className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent resize-none"
   980	                      placeholder="Qué hace el agente, a qué sistemas accede y qué política quiere hacer ejecutable." />
   981	                  </div>
   982	                  <button type="submit" className="w-full py-4 bg-saare-allow text-black font-bold rounded hover:bg-saare-allow/80 transition cursor-pointer">
   983	                    SOMETER UN AGENTE ↗
   984	                  </button>
   985	                </form>
   986	              )}
   987	            </div>
   988	          </div>
   989	        </section>
   990	
   991	        {/* 15 · BUEN USO & TELEMETRÍA */}
   992	        <section className="border-b border-saare-line bg-saare-surface py-20">
   993	          <div className="max-w-7xl mx-auto px-6">
   994	            <SectionTitle
   995	              kicker="SEGURIDAD Y BUEN USO"
   996	              title="Contención de máquinas. No vigilancia de personas."
   997	              lead="S.A.A.R.E. es infraestructura de autorización y prueba sobre acciones de agentes de IA."
   998	            />
   999	            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 font-mono text-xs">
  1000	              {BUEN_USO.map(([title, desc]) => (
  1001	                <div key={title} className="bg-saare-surface-2 border border-saare-line p-5 rounded-lg">
  1002	                  <div className="text-saare-ink font-bold text-xs">{title}</div>
  1003	                  <p className="text-[11px] text-saare-ink-dim mt-3 leading-relaxed">{desc}</p>
  1004	                </div>
  1005	              ))}
  1006	            </div>
  1007	
  1008	            <div className="grid md:grid-cols-2 gap-6 mt-12 font-mono text-xs">
  1009	              <div className="bg-saare-surface-2/80 border border-saare-allow/30 p-6 rounded-xl">
  1010	                <div className="text-saare-allow font-bold mb-4">✓ SALE DEL NODO (TELEMETRÍA MÍNIMA)</div>
  1011	                <ul className="space-y-2 text-saare-ink-dim">
  1012	                  {TELEMETRIA_SALE.map((t) => (
  1013	                    <li key={t} className="flex items-center gap-2"><span className="text-saare-allow">›</span> {t}</li>
  1014	                  ))}
  1015	                </ul>
  1016	              </div>
  1017	              <div className="bg-saare-surface-2/80 border border-saare-deny/30 p-6 rounded-xl">
  1018	                <div className="text-saare-deny font-bold mb-4">× NO SALE DEL NODO (NUNCA PERSISTIDO)</div>
  1019	                <ul className="space-y-2 text-saare-ink-faint">
  1020	                  {TELEMETRIA_NO_SALE.map((t) => (
  1021	                    <li key={t} className="flex items-center gap-2"><span className="text-saare-deny">›</span> {t}</li>
  1022	                  ))}
  1023	                </ul>
  1024	              </div>
  1025	            </div>
  1026	          </div>
  1027	        </section>
  1028	
  1029	        {/* 16 · INFORMACIÓN CORPORATIVA & FOOTER */}
  1030	        <footer className="bg-saare-surface pt-16 pb-12 px-6 font-mono text-xs text-saare-ink-dim">
  1031	          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-saare-line">
  1032	            <div>
  1033	              <div className="flex items-center gap-2">
  1034	                <span className="font-bold text-lg text-saare-ink font-display">S.A.A.R.E.</span>
  1035	                <span className="text-[9px] bg-saare-accent/10 border border-saare-accent/30 text-saare-accent px-2 py-0.5 rounded font-bold">SGP 1.0</span>
  1036	              </div>
  1037	              <p className="text-[10px] text-saare-ink-faint mt-3 leading-relaxed">
  1038	                MS3V S.A.A.R.E. SL · Infraestructura española de autorización ex-ante y gobernanza runtime L7 para Inteligencia Artificial.
  1039	              </p>
  1040	            </div>
  1041	            <div>
  1042	              <div className="text-[10px] text-saare-ink-faint tracking-widest font-bold">CONTACTO</div>
  1043	              <div className="mt-3 space-y-2 text-[11px]">
  1044	                <div>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-saare-ink hover:underline">{CONTACT_EMAIL}</a></div>
  1045	                <div>Teléfono: <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="text-saare-ink hover:underline">{CONTACT_PHONE}</a></div>
  1046	              </div>
  1047	            </div>
  1048	            <div>
  1049	              <div className="text-[10px] text-saare-ink-faint tracking-widest font-bold">ACCESO ENTERPRISE</div>
  1050	              <div className="mt-3 text-[11px]">
  1051	                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-saare-allow font-bold hover:underline">
  1052	                  Solicitar Propuesta por WhatsApp ↗
  1053	                </a>
  1054	              </div>
  1055	            </div>
  1056	            <div>
  1057	              <div className="text-[10px] text-saare-ink-faint tracking-widest font-bold">MARCO LEGAL</div>
  1058	              <div className="mt-3 text-[10px] text-saare-ink-faint leading-relaxed">
  1059	                Procesamiento en memoria volátil Zero-Disk. Cumplimiento con RGPD, eIDAS, DORA y EU AI Act.
  1060	              </div>
  1061	            </div>
  1062	          </div>
  1063	          <div className="max-w-7xl mx-auto text-center text-[10px] text-saare-ink-faint mt-8">
  1064	            © 2026 MS3V S.A.A.R.E. SL. Todos los derechos reservados.
  1065	          </div>
  1066	        </footer>
  1067	      </main>
  1068	    </div>
  1069	  );
  1070	}
  1071	
  1072	/* ==========================================================================
  1073	   ENRUTADOR GENERAL DE LA APLICACIÓN
  1074	   ========================================================================== */
  1075	export default function App() {
  1076	  return (
  1077	    <BrowserRouter>
  1078	      <Routes>
  1079	        <Route path="/" element={<LandingPage />} />
  1080	        <Route path="/login" element={<Login />} />
  1081	        <Route path="*" element={<LandingPage />} />
  1082	      </Routes>
  1083	    </BrowserRouter>
  1084	  );
  1085	}