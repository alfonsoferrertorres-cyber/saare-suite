```
========================================================================================
                          MS3V S.A.A.R.E. SL
               INDEPENDENT AI GOVERNANCE INFRASTRUCTURE
========================================================================================
DOCUMENTO: DIRECTRICES TÉCNICAS, DE CONTENIDO Y LICENCIAMIENTO PARA FRONTEND/ISV
EXPEDIENTE: MS3V-SGP1.0-DEV-DIRECTIVES-2026-V1
DESTINATARIOS: Equipo de Desarrollo Frontend/Fullstack, CTO, CISO, Dirección de Producto
CLASIFICACIÓN: DOCUMENTO TÉCNICO Y ESTRATÉGICO ENTERPRISE
ESTÁNDAR NATIVO: Saare Governance Protocol 1.0 (SGP 1.0)
MOTOR RUNTIME: Core PEP L7 C++/Rust Release v7.0 (Manual Spec V4)
FECHA DE EMISIÓN: 20 de Septiembre de 2026 (UTC)
========================================================================================

```

---

# CAPÍTULO 1: DIRECTRICES ARQUITECTÓNICAS Y NARRATIVA DE DISRUPCIÓN DE LA ISV

## 1.1. Manifiesto Narrativo ISV: De la Gobernanza Pasiva a la Ejecución Ex-Ante

El objetivo de las presentes directrices es instruir al equipo de desarrollo para que transforme el contenido de la *landing page* y aplicación web de **S.A.A.R.E. SGP 1.0** en una propuesta de valor Enterprise inexpugnable.

El desarrollador **debe mantener intacto el diseño visual existente** (paleta de colores, estructura de rejilla Tailwind, distribución de componentes React y navegación de 7 pestañas), centrando el $100\%$ de su trabajo en la **densidad técnica, estructuración del texto, modelos de datos, arquitectura de precios y la articulación del relato comercial ISV**.

### El Problema del Mercado (La Falacia del "Cloud Guardrail")

Las empresas que intentan gobernar la IA actualmente caen en dos trampas operativas:

1. **Gobernanza en Papel (Inútil):** Redacción de normativas en PDF que los empleados o los agentes de IA ignoran en tiempo de ejecución.
2. **Guardarraíles en la Nube (Ineficientes y Costosos):** Soluciones que reenvían cada *prompt* a una segunda API de IA en la nube para comprobar si es seguro. Este enfoque destruye el ROI de la empresa:
* **Doble Coste de Tokens:** La empresa paga la llamada del usuario + la llamada del guardarraíl.
* **Latencia Inaceptable:** Aumenta entre $500\text{ ms}$ y $2.000\text{ ms}$ el tiempo de respuesta.
* **Incertidumbre Probabilística:** Intenta controlar un modelo probabilístico usando otro modelo probabilístico que también puede alucinar.
* **Fuga de Privacidad:** Centraliza conversaciones confidenciales en servidores de terceros (vulnerando el RGPD Art. 32).



### La Disrupción S.A.A.R.E. SGP 1.0 (Código Empírico Nativo)

S.A.A.R.E. introduce la **Autorización Ex-Ante In-Process en RAM**. El motor compilado en C++/Rust corre embebido en la propia tubería del cliente.

* **Cero Consumo Extra de Tokens ($0\ \text{€}$):** La gobernanza es código L7 determinista, no una llamada a otro LLM.
* **Latencia Ultra-Baja ($<1.16\text{ ms}$):** Procesamiento sobre memoria RAM volátil mediante llamadas al sistema `mlock()`.
* **Certeza Matemática ($100\%$ Determinista):** Evaluación sintáctica AST y filtros *k-Anonymity* que no alucinan.
* **Principio Zero-Disk:** Cero almacenamiento de textos planos en disco; sólo se persisten hashes SHA-256 con sellado **eIDAS RFC 3161**.

---

## 1.2. Análisis Comparativo Sistemático: Soluciones Cloud vs. S.A.A.R.E. SGP 1.0

El desarrollador debe programar las tablas comparativas de la interfaz utilizando estrictamente los parámetros de esta matriz:

```
+───────────────────────────────┬──────────────────────────────────┬──────────────────────────────────+
| PARÁMETRO TÉCNICO Y COMERCIAL | GUARDARRAÍLES CLOUD (OTROS)      | PLATAFORMA S.A.A.R.E. SGP 1.0    |
+───────────────────────────────┼──────────────────────────────────┼──────────────────────────────────+
| Arquitectura de Intercepción  | Asíncrona Cloud / Post-Facto     | Ex-Ante In-Process L7 en RAM     |
| Coste Marginal de Gobernanza  | +100% en Factura de Tokens API   | 0 Tokens Adicionales (0 €)       |
| Latencia P99 de Evaluación    | +500 ms a +2.000 ms              | < 1.16 ms (RAM mlock)            |
| Naturaleza de la Decisión     | Probabilística (Riesgo Alucinación)| Determinista (Código C++/Rust)   |
| Persistencia de Datos         | Almacena conversaciones en Cloud | Zero-Disk (Solo Hashes SHA-256)  |
| Validez Probatoria Judicial   | Logs relacionales alterables     | Firma Ed25519 / eIDAS RFC 3161   |
| Financiación de Implantación  | Gasto directo no subvencionable  | 100% Subvencionable (Kit Consult.)|
+───────────────────────────────┴──────────────────────────────────┴──────────────────────────────────+

```

---

## 1.3. Reglas de Implementación Frontend para el Desarrollador

1. **Preservar la Estructura UI/UX:** No alterar los componentes visuales (`AppShell`, `PageLayout`, `PriceCard`, `Footer`).
2. **Sustitución de Textos Genéricos:** Reemplazar cualquier texto borroso o resumido por las especificaciones detalladas expuestas en este documento.
3. **Tipado de Datos Estricto:** Utilizar las interfaces TypeScript definidas en el Capítulo 5 para alimentar dinámicamente las pestañas.
4. **Respetar la Jerarquía Nomenclatura:**
* Empresa: **MS3V S.A.A.R.E. SL**
* Estándar: **Saare Governance Protocol 1.0 (SGP 1.0)**
* Motor: **Core PEP L7 C++/Rust Release v7.0 (Manual Spec V4)**



---

# CAPÍTULO 2: ARQUITECTURA DE LICENCIAMIENTO, METROLOGÍA Y MONETIZACIÓN

El desarrollador debe reflejar en el código los **tres ejes de metrología y licenciamiento** de la plataforma ISV. La facturación se gestiona mediante el Worker de `control-plane`, que registra contadores numéricos anónimos sin almacenar texto plano.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ESQUEMA DE METROLOGÍA CONTROL-PLANE                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ SDK / PROXY / DAEMON NODO ] ──(Contadores Anónimos RAM)──► [ WORKER CONTROL-PLANE ]  │
│                                                                        │               │
│  • Peticiones Autorizadas (ALLOW)                                      ▼               │
│  • Peticiones Bloqueadas (DENY)                        [ BÓVEDA B2B BILLING & AUTH ]   │
│  • Tokens Sanitizados (Context Slicing)                • Verificación JWT Handshake    │
│  • Raíces Merkle Generadas                             • Control de Cuota / Overage    │
│                                                        • Emisión de Licencia Activa    │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

## 2.1. Métricas de Consumo (Metered Usage)

El sistema de licencias se articula bajo tres dimensiones de métrica:

1. **Licenciamiento por Flujo / Transacción (Metering por Petición L7):**
* **A qué aplica:** Módulo `LabEngine` (SDK) y `PerimeterShield` (Proxy).
* **Métrica:** Número de evaluaciones Ex-Ante procesadas en RAM por el motor.
* **Unidad de Medida:** Bloques de $100.000$ evaluaciones/mes.


2. **Licenciamiento por Nodo / Instancia (Capacity Billing):**
* **A qué aplica:** Módulo `PerimeterShield` (Proxy Docker/K8s) y `Daemon` (Servicio On-Premise).
* **Métrica:** Número de contenedores activos o servidores/VMs ejecutando el proceso `saare-daemon`.
* **Unidad de Medida:** Instancia ejecutada / año.


3. **Licenciamiento por Asiento / Usuario Corporativo (Seat & Tenant Billing):**
* **A qué aplica:** `ComplianceSuite` (`saare_console`) y `EvidenceVault`.
* **Métrica:** Número de usuarios administrativos accediendo a las 3 Vistas de la Consola o estaciones forenses realizando verificaciones eIDAS.



---

## 2.2. Estructura Granular de Precios y Overage (Excesos)

El desarrollador debe programar los siguientes valores dentro de las tarjetas de precio (`PriceCard`) y tablas comparativas:

```
+───────────────────┬───────────────────┬───────────────────┬──────────────────────────────────+
| MÓDULO COMERCIAL  | BASE INCLUIDA     | PRECIO BASE       | TARIFA DE EXCESO (OVERAGE)       |
+───────────────────┼───────────────────┼───────────────────┼──────────────────────────────────+
| 1. LabEngine SDK  | 1 Developer       | 99 € / mes        | +0,001 € por evaluación extra    |
|                   | 100.000 evals/mes | (o 990 € / año)   | (descuento por volumen >1M)      |
+───────────────────┼───────────────────┼───────────────────┼──────────────────────────────────+
| 2. PerimeterShield| 1 Nodo Proxy      | 350 € / mes       | +150 € / mes por nodo adicional  |
|    Proxy          | Evals Ilimitadas  | (o 3.500 € / año) | (Escalado K8s Sidecar)           |
+───────────────────┼───────────────────┼───────────────────┼──────────────────────────────────+
| 3. EvidenceVault  | 1 Estación / Perito| 290 € / mes       | +0,05 € por expediente exportado |
|    Forense        | 1.000 Firmas/mes  | (o 2.900 € / año) | con Sello eIDAS RFC 3161         |
+───────────────────┼───────────────────┼───────────────────┼──────────────────────────────────+
| 4. ComplianceSuite| Consola Unificada | 490 € / mes       | Incluido en planes Enterprise    |
|    On-Premise     | Roles Ilimitados  | (o 4.900 € / año) | VPC / Air-Gapped personalizados  |
+───────────────────┼───────────────────┼───────────────────┼──────────────────────────────────+
| 5. Canal Partners | Multi-tenant      | Revenue Share     | Margen comercial 25% a 40% según |
|    (Kit Consult.) | Clientes Ilimitad.| Suscripción Canal | volumen de volumen gestionado    |
+───────────────────┴───────────────────┴───────────────────┴──────────────────────────────────+

```

---

## 2.3. Mecanismo Técnico de Control-Plane

El desarrollador debe añadir una sección explicativa sobre cómo el `control-plane` valida licencias sin romper la privacidad Zero-Disk:

1. **Handshake JWT Inicial:**
Al iniciar el motor (SDK, Proxy o Daemon), este envía un paquete de saludo firmado con la API Key (`sk_saare_live_...`) hacia `[https://api.saare.es/v1/auth/handshake](https://api.saare.es/v1/auth/handshake)`. El `control-plane` verifica la firma contra la **Bóveda 1 (Auth Vault)** y devuelve un JWT firmado con validez de 24 horas.
2. **Telemetría de Consumo Anónima:**
Cada 15 minutos, el motor envía un ping en segundo plano conteniendo exclusivamente:
```json
{
  "node_id": "node-madrid-proxy-01",
  "timestamp": 1787268000,
  "metrics": {
    "evaluations_total": 45210,
    "verdicts_allow": 44100,
    "verdicts_deny": 1110,
    "bytes_sanitized_ram": 18452090
  },
  "integrity_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}

```


**Instrucción al desarrollador:** Enfatizar en la interfaz que en este proceso **JAMÁS se envía el contenido del prompt ni datos personales (PII)**.

---

# CAPÍTULO 3: ESPECIFICACIÓN DETALLADA Y CONTENIDO DE LAS 7 PESTAÑAS PRINCIPALES

---

## 3.1. PESTAÑA 1: Auditoría Pública & Motor de Referencia

* **Identificador de Ruta:** `/` (Página de Inicio / Landing Principal)
* **Objetivo Comercial:** Establecer la superioridad tecnológica de S.A.A.R.E., posicionándolo como el Motor de Referencia de la industria y proporcionando un verificador público de firmas eIDAS.
* **Perfil Objetivo:** Inversores, CISO, DPO, Auditores, CTOs y visitantes generales.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ESTRUCTURA DE CONTENIDO - PESTAÑA 1                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ HERO EMPÍRICO ] ─────────────────────────────────────────────────────────┐          │
│   • Titular: Gobernanza Empírica Nativa sin Consumo de Tokens               │          │
│   • Subtítulo: Intercepción C++/Rust en RAM (<1.16ms) con Cero Coste Extra  │          │
│   • Vídeo Hero Conceptual (Fondo loop)                                      │          │
│                                                                             │          │
│  [ DEMOSTRADOR EN VIVO: PARADIGMA EMPÍRICO VS PROBABILÍSTICO ] ─────────────┤          │
│   • Tabla interactiva de comparación de latencia, coste y fiabilidad.        │          │
│                                                                             │          │
│  [ PUBLIC TRUST ANCHOR / VERIFICADOR EIDAS ] ───────────────────────────────┘          │
│   • Campo de entrada para consultar Hashes de Merkle Root o Permit IDs.                │
│   • Muestra de respuesta con validación RFC 3161 y Art. 326 LEC.                       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

### Contenido Textual Obligatorio para el Desarrollador:

* **Titular Principal (H1):** Gobernanza Empírica Nativa sin Consumo de Tokens.
* **Subtítulo:** El primer motor de infraestructura que ejecuta la contención de Inteligencia Artificial dentro de la tubería de aplicación. Intercepción C++/Rust en memoria RAM volátil (`mlock`) a $<1.16\text{ ms}$, eliminando el sobrecoste de tokens y el riesgo de alucinaciones en la seguridad.
* **Cuerpo Explicativo del Paradigma Empírico:**
> "Las soluciones tradicionales de seguridad en la nube reenvían cada interacción a un segundo modelo de IA para comprobar su validez. Este enfoque destruye la eficiencia de la empresa: duplica la factura de APIs, añade más de $500\text{ ms}$ de latencia y utiliza lógica probabilística que puede ser engañada. S.A.A.R.E. SGP 1.0 sustituye la opinión de la nube por **código determinista in-process**. La validación sintáctica AST, la anonimización *k-Anonymity* y el control de límites se ejecutan mediante matemática dura en memoria RAM. Cero tokens gastados. Cero texto escrito en disco."


* **Especificación del Verificador Público (Public Trust Anchor):**
* El desarrollador debe incluir una caja interactiva donde el usuario puede probar la clave hash demo (`6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842`).
* Al hacer clic en **"Verificar Sello eIDAS"**, la pantalla debe renderizar el siguiente bloque de evidencia:
```
[✓ STATUS: VERIFIED BY PUBLIC TRUST ANCHOR]
• Raíz de Árbol de Merkle: 6f1b3986a4221147...
• Sellado de Tiempo: eIDAS RFC 3161 Qualified Timestamp
• Validez Legal: Art. 326 Ley 1/2000 Enjuiciamiento Civil (LEC)
• Integridad de Payload: Inalterada desde origen (RAM mlock)

```





---

## 3.2. PESTAÑA 2: Consola Cumplimiento L7 (`saare_console`)

* **Identificador de Ruta:** `/cumplimiento`
* **Objetivo Comercial:** Explicar el concepto de **Consola Unificada de 3 Vistas (RBAC)** para que el cliente entienda que un solo software responde a las necesidades del CEO, DPO y CISO.
* **Perfil Objetivo:** CEO, Chief Risk Officer, DPO, CISO, Directores de Cumplimiento.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ESTRUCTURA DE CONTENIDO - PESTAÑA 2                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ INTRODUCCIÓN DE LA CONSOLA UNIFICADA ] ────────────────────────────────┐            │
│   • Explicación de la arquitectura RBAC (Single Pane of Glass).           │            │
│                                                                           │            │
│  [ DESGLOSE DE LAS 3 VISTAS OPERATIVAS ] ─────────────────────────────────┤            │
│   • Vista 1: Plano Ejecutivo (Board / CEO) ── ROI & Ahorro de Tokens      │            │
│   • Vista 2: Plano Privacidad (DPO / Legal) ─ Toggles PII & EU AI Act     │            │
│   • Vista 3: Plano Ciberseguridad (CISO) ─── Reglas L7 & Fail-Closed      │            │
│                                                                           │            │
│  [ TARJETA DE PRECIO: TIER CUMPLIMIENTO SGP 1.0 ] ────────────────────────┘            │
│   • Desde 490 € / mes (Suscripción Anual On-Premise / VPC).                            │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

### Contenido Textual Obligatorio para el Desarrollador:

* **Titular Principal (H1):** Una Única Consola, Tres Vistas Especializadas (`saare_console`).
* **Subtítulo:** Gestión de gobierno de IA mediante control de acceso basado en roles (RBAC). Una misma plataforma traduce los eventos criptográficos del motor en la interfaz nativa que requiere cada departamento.
* **Desarrollo de las 3 Vistas Operativas:**
1. **Plano Ejecutivo (Board / CEO / CFO):**
* **Métricas Renderizadas:** Cuadro de mando de ROI con cálculo directo del dinero ahorrado por compresión de *prompts* (*Context Slicing*), Índice de Exposición Global al Riesgo y Semáforo de Cumplimiento Corporativo.
* **Propósito:** Ofrecer a la alta dirección visibilidad del impacto económico de la IA sin tecnicismos.


2. **Plano de Privacidad y GRC (DPO / Legal):**
* **Métricas Renderizadas:** Volumen de datos PII/PHI sanitizados en vuelo, matriz de clasificación de riesgos según la **EU AI Act** (Inaceptable, Alto, Limitado) y verificación de arquitectura Zero-Disk para el RGPD (Art. 32).
* **Capacidad Interactiva:** Interruptores (*toggles*) gráficos para activar o desactivar enmascaramiento de DNIs, IBANs, tarjetas de crédito e historias clínicas en tiempo real.


3. **Plano de Ciberseguridad y Redes (CISO / SecOps):**
* **Métricas Renderizadas:** Inventario unificado de nodos (SDKs, Proxies y Daemons), mapas de calor de ataques de *Prompt Injection* y *Jailbreak*, detección de tráfico no autorizado (*Shadow AI*) y estado de política *Fail-Closed*.
* **Capacidad Interactiva:** Editor visual de reglas deterministas L7 (`ALLOW`, `REVIEW`, `DENY`) y revocación inmediata de llaves API.




* **Datos de Tarjeta de Precios (`PriceCard`):**
* **Nombre Tier:** TIER CUMPLIMIENTO SGP 1.0
* **Precio:** 490 € / mes (o 4.900 € / año)
* **Modelo:** Suscripción por Consola Corporativa On-Premise / VPC Privada.
* **Incluye:** Acceso ilimitado para roles Board, DPO y CISO; despliegue local sin envío de telemetría a nubes de terceros; sincronización ilimitada con nodos interceptores.



---

## 3.3. PESTAÑA 3: Consola Legal-Forense (`EvidenceVault`)

* **Identificador de Ruta:** `/forense`
* **Objetivo Comercial:** Presentar el módulo especializado de generación de pruebas digitales inmutables con validez procesal en tribunales.
* **Perfil Objetivo:** Peritos Ciberinformáticos, Analistas SOC/CSIRT, Abogados Tecnológicos, Departamentos de Fraude.

### Contenido Textual Obligatorio para el Desarrollador:

* **Titular Principal (H1):** EvidenceVault: Evidencia Criptográfica Inalterable.
* **Subtítulo:** Bóveda de auditoría forense aislada para la generación de prueba digital preconstituida respaldada por firma Ed25519 y sellado cualificado eIDAS RFC 3161.
* **Puntos de Profundidad Técnica:**
* **Firma Digital en Memoria RAM:** Cada veredicto emitido por el motor interceptor se firma digitalmente en nanosegundos utilizando curvas elípticas **Ed25519** sobre la memoria RAM volátil.
* **Estructura en Árboles de Merkle:** Las firmas se agrupan en estructuras hash inmutables vinculadas a una Autoridad de Sellado de Tiempo cualificada (*TSA*) conforme al reglamento europeo **eIDAS**.
* **Validez Procesal Judicial:** Generación automatizada de expedientes de prueba digital que cumplen de forma estricta los requisitos del **Art. 326 de la Ley 1/2000 de Enjuiciamiento Civil (LEC)** para procedimientos judiciales y arbitrajes.
* **Verificador Offline Independiente:** Incluye la herramienta ejecutable `saare-evidence-cli` para que peritos y auditores puedan comprobar la cadena de custodia sin conexión a internet.


* **Datos de Tarjeta de Precios (`PriceCard`):**
* **Nombre Tier:** TIER EVIDENCEVAULT LEDGER
* **Precio:** 290 € / mes (o 2.900 € / año)
* **Modelo:** Licencia por Estación Forense / Paquete de 1.000 Expedientes Certificados.
* **Incluye:** Cliente ejecutable de escritorio y CLI; motor de firma Ed25519 eIDAS RFC 3161; exportación de paquetes ZIP forenses con certificado de cadena de custodia para tribunales.



---

## 3.4. PESTAÑA 4: Agentes de Venta & Canal (Kit Consulting)

* **Identificador de Ruta:** `/ventas`
* **Objetivo Comercial:** Convertir a consultoras GRC, Agentes Digitalizadores y despachos en un canal indirecto de distribución masiva mediante la justificación de subvenciones públicas.
* **Perfil Objetivo:** Agentes Digitalizadores, Consultoras de Transformación Digital, Partners Integradores.

### Contenido Textual Obligatorio para el Desarrollador:

* **Titular Principal (H1):** Programa de Partners & Financiación Pública (Kit Consulting).
* **Subtítulo:** Permita a sus clientes PYME financiar el $100\%$ de la implantación de gobernanza de IA mediante el programa Kit Consulting y ayudas de ciberseguridad, justificando los entregables con tecnología real homologada.
* **Desglose del Modelo de Canal:**
* **El Problema del Consultor:** Las firmas de asesoría venden planes de uso de IA en PDF. Sin embargo, los inspectores de las ayudas públicas exigen evidencias de adopción técnica real para evitar el reintegro de la subvención.
* **La Solución S.A.A.R.E.:** El partner despliega la plataforma S.A.A.R.E. SGP 1.0 en la PYME cliente. El módulo `EvidenceVault` emite automáticamente el **Certificado de Ejecución eIDAS RFC 3161**, garantizando la justificación inexpugnable del $100\%$ de las horas del Kit Consulting.


* **Entregables Homologados Incluidos:**
1. *Entregable 1:* Informe de Diagnóstico y Auditoría de *Shadow AI* en la empresa.
2. *Entregable 2:* Despliegue de políticas activas en RAM mediante la consola S.A.A.R.E. SGP 1.0.
3. *Entregable 3:* Expediente de cumplimiento certificado con firma eIDAS para cobro de la ayuda.


* **Datos de Tarjeta de Precios (`PriceCard`):**
* **Nombre Tier:** TIER PARTNER & AGENTE DIGITALIZADOR
* **Precio:** Comisión de Canal del 25% al 40% (Revenue Share)
* **Modelo:** Licenciamiento Multi-tenant para Partners Comercializadores.
* **Incluye:** Panel de gestión centralizada de clientes (*Multi-Tenant Dashboard*); plantillas de memoria de justificación para Kit Consulting; soporte técnico prioritario en licitaciones públicas.



---

## 3.5. PESTAÑA 5: Modo SDK (`LabEngine`)

* **Identificador de Ruta:** `/sdk`
* **Objetivo Comercial:** Captar al público de ingenieros y desarrolladores vendiendo el SDK nativo que optimiza el consumo de tokens y erradica alucinaciones.
* **Perfil Objetivo:** CTOs, Arquitectos de Software, Desarrolladores Fullstack, DevSecOps.

### Contenido Textual Obligatorio para el Desarrollador:

* **Titular Principal (H1):** Modo SDK (LabEngine): Gobernanza Embebida en Código.
* **Subtítulo:** Librería runtime nativa para integración en tiempo de ejecución mediante `pip install saare-sdk` o `npm install @saare/sdk`.
* **Profundidad Técnica de las Funciones:**
* **Context Slicing (Ahorro del 40% en Tokens):** Algoritmo de compresión determinista in-memory que elimina redundancias sintácticas antes de enviar el *prompt* a OpenAI/Anthropic, reduciendo de forma directa la factura API del cliente.
* **Validación Sintáctica AST (Cero Alucinaciones):** Evaluación in-memory de esquemas JSON y bloques de código generados por la IA. Si la respuesta de la IA no cumple exactamente el esquema AST esperado, el SDK la rechaza antes de que toque la base de datos de la empresa.
* **Soporte Nativo MCP (Model Context Protocol):** Proxy de validación ex-ante para herramientas y agentes autónomos basados en el protocolo MCP.


* **Bloque de Código de Ejemplo (TypeScript):**
```typescript
import { SaareLabEngine } from '@saare/sdk';

const saare = new SaareLabEngine({
  apiKey: process.env.SAARE_API_KEY,
  failPolicy: 'FAIL_CLOSED' // Bloqueo de seguridad si cae la conexión
});

// Intercepción Ex-Ante en RAM antes de llamar al LLM
const permit = await saare.authorize({
  agentId: 'treasury-agent-01',
  action: 'MUTATE_DATABASE',
  resource: 'https://core-banking.empresa.local/v1/transfers',
  payload: userPrompt
});

if (permit.verdict === 'ALLOW') {
  // El payload incluye la sanitización k-Anonymity de PII
  const response = await callExternalLLM(permit.sanitizedPayload);
}

```


* **Datos de Tarjeta de Precios (`PriceCard`):**
* **Nombre Tier:** TIER SDK LABENGINE
* **Precio:** 99 € / mes (o 990 € / año)
* **Modelo:** Licencia por Desarrollador / Bloque de 100.000 evaluaciones API al mes (+0,001 € por evaluación extra).
* **Incluye:** Algoritmo Context Slicing; validador AST in-memory; soporte MCP; claves API de desarrollo y producción.



---

## 3.6. PESTAÑA 6: Modo Proxy (`PerimeterShield`)

* **Identificador de Ruta:** `/proxy`
* **Objetivo Comercial:** Vender la pasarela perimetral L7 que filtra todo el tráfico de la red corporativa sin modificar una sola línea de código fuente.
* **Perfil Objetivo:** CISO, Administradores de Red, Ingenieros de Ciberseguridad, SecOps.

### Contenido Textual Obligatorio para el Desarrollador:

* **Titular Principal (H1):** Modo Proxy (PerimeterShield): Gateway Perimetral L7.
* **Subtítulo:** Contenedor Docker / Sidecar de Kubernetes de ultra-alto rendimiento para la intercepción y sanitización del tráfico HTTP/gRPC/WebSocket saliente a servicios de IA.
* **Profundidad Técnica de las Funciones:**
* **Intercepción Ex-Ante a <1.16ms:** Captura física del paquete L7 antes de alcanzar la interfaz de red de salida, procesando la decisión en memoria RAM (`mlock`).
* **Sanitización k-Anonymity Activa:** Sustitución automática e in-memory de datos sensibles (DNI, IBAN, tarjetas de crédito, expedientes) por tokens neutros antes de enviar el paquete a internet.
* **Defensa Perimetral Activa:** Bloqueo automático en el borde contra ataques de *Prompt Injection*, *Jailbreaks* y el consumo de herramientas no autorizadas (*Shadow AI*).


* **Comando de Despliegue Docker:**
```bash
docker run -d \
  --name saare-perimeter-shield \
  -p 8080:8080 \
  -e SAARE_NODE_KEY="sk_saare_live_9981..." \
  --memory-swappiness=0 \
  registry.saare.es/saare/perimeter-shield:sgp-1.0

```


* **Datos de Tarjeta de Precios (`PriceCard`):**
* **Nombre Tier:** TIER PERIMETERSHIELD PROXY
* **Precio:** 350 € / mes (o 3.500 € / año)
* **Modelo:** Licencia por Nodo Proxy / Clúster Kubernetes (+150 €/mes por nodo extra de escalado).
* **Incluye:** Intercepción L7 ultra-rápida en RAM; arquitectura Zero-Disk; sincronización en tiempo real de políticas desde `saare_console`.



---

## 3.7. PESTAÑA 7: Modo Daemon (Servicio Local On-Premise)

* **Identificador de Ruta:** `/daemon`
* **Objetivo Comercial:** Responder a los requerimientos de empresas con infraestructuras tradicionales, servidores aislados o modelos de IA locales (Ollama/vLLM).
* **Perfil Objetivo:** Administradores de Sistemas, Arquitectos On-Premise, Responsables de Infraestructura Aislada.

### Contenido Textual Obligatorio para el Desarrollador:

* **Titular Principal (H1):** Modo Daemon: Servicio Nativo para Infraestructura On-Premise.
* **Subtítulo:** Demonio de sistema operativo (`systemd` en Linux / Servicio de Windows) para la protección de servidores locales y entornos en red privada.
* **Casos de Uso On-Premise:**
* **Protección de LLMs Locales:** Se sitúa como aduana delante de servidores privados de IA (Ollama, vLLM, HuggingFace) alojados en las propias GPUs de la empresa.
* **Sistemas Heredados (Legacy):** Intercepción de *sockets* locales en aplicaciones corporativas donde no es posible modificar el código fuente ni desplegar Docker.
* **Entornos Air-Gapped (Aislamiento Total):** Operación en redes 100% desconectadas de internet, validando políticas locales firmadas mediante módulos HSM corporativos.


* **Comando de Instalación de Servicio:**
```bash
# Instalación en servidores Linux (Debian/Ubuntu)
curl -sSL https://get.saare.es/daemon.sh | sudo bash
sudo systemctl status saare-daemon

```


* **Datos de Tarjeta de Precios (`PriceCard`):**
* **Nombre Tier:** TIER DAEMON ON-PREMISE
* **Precio:** 590 € / mes (o 5.900 € / año)
* **Modelo:** Licencia por Servidor Físico o Máquina Virtual On-Premise.
* **Incluye:** Paquetes instaladores `.deb`, `.rpm` y ejecutable Servicio Windows; filtrado de LLMs locales (Ollama/vLLM); soporte para licencias locales en entornos Air-Gapped.



---

# CAPÍTULO 4: ESPECIFICACIÓN DETALLADA Y CONTENIDO DE LAS 3 PESTAÑAS DEL PIE DE PÁGINA (FOOTER)

El desarrollador debe programar las tres páginas corporativas vinculadas desde el pie de página, asegurando la solvencia institucional y legal exigida por las grandes empresas.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ESTRUCTURA DE RUTAS DEL PIE DE PÁGINA                           │
├───────────────────────────┬───────────────────────────┬────────────────────────────────┤
│ PÁGINA 1: SOBRE NOSOTROS  │ PÁGINA 2: BUEN USO DE IA  │ PÁGINA 3: CENTRO LEGAL B2B     │
│ (Ruta: /empresa)          │ (Ruta: /buenas-practicas) │ (Ruta: /legal)                 │
├───────────────────────────┼───────────────────────────┼────────────────────────────────┤
│ • Identidad MS3V S.A.A.R.E.│ • Principios Uso Aceptable│ • Aviso Legal & LSSI-CE        │
│ • NIF B-ESB12345678       │ • Guía EU AI Act & Riesgos│ • Política Privacidad Zero-Disk│
│ • HQ Madrid (Soberanía EU)│ • Protocolo Human-Loop    │ • Acuerdo SLA & Garantía RAM   │
└───────────────────────────┴───────────────────────────┴────────────────────────────────┘

```

## 4.1. Sección 1: Sobre Nosotros (`/empresa`)

* **Objetivo:** Proporcionar la información societaria y el compromiso de soberanía tecnológica europea de la ISV.
* **Contenido Textual Obligatorio:**
* **Razón Social:** MS3V S.A.A.R.E. SL
* **Registro:** NIF B-ESB12345678 | Inscrita en el Registro Mercantil de Madrid.
* **Sede Central:** Calle Velázquez 45, 28001 Madrid, España.
* **Manifiesto de Soberanía:** *"MS3V S.A.A.R.E. SL es un proveedor de software independiente (ISV) 100% europeo. Desarrollamos infraestructura de ciberseguridad y gobernanza para la Inteligencia Artificial sin dependencia de nubes extra-comunitarias, garantizando la soberanía de los datos de nuestros clientes en estricta conformidad con el marco regulatorio de la Unión Europea."*



---

## 4.2. Sección 2: Código de Buen Uso de la IA & Ética (`/buenas-practicas`)

* **Objetivo:** Servir como guía de referencia corporativa para que los clientes adopten la IA de forma responsable.
* **Contenido Textual Obligatorio:**
1. **Principio de Contención Preventiva:** Ningún agente autónomo debe tener permisos irrestricto de mutación sobre bases de datos de producción sin una regla determinista de control.
2. **Clasificación de Riesgos EU AI Act:** Guía práctica para categorizar los sistemas de la empresa (Sistemas de Riesgo Inaceptable -prohibidos-, Sistemas de Alto Riesgo -requieren auditoría S.A.A.R.E.-, y Sistemas de Riesgo Limitado).
3. **Supervisión Humana (*Human-in-the-Loop*):** Definición de umbrales donde el motor S.A.A.R.E. debe suspender la ejecución (`REVIEW`) y requerir la firma de un operador humano.



---

## 4.3. Sección 3: Centro Legal B2B & Privacidad Zero-Disk (`/legal`)

* **Objetivo:** Garantizar la cobertura legal y contractual de la licencia de software Enterprise.
* **Contenido Textual Obligatorio:**
* **Garantía Cero-Persistencia (Zero-Disk SLA):** Certificación formal de que la plataforma S.A.A.R.E. SGP 1.0 no almacena, procesa para entrenamiento ni escribe en medio magnético no volátil los contenidos de los *prompts* o respuestas de los usuarios.
* **Conformidad RGPD Art. 32:** Documentación técnica que acredita que la sanitización *k-Anonymity* realizada en memoria RAM volátil satisface las exigencias de seguridad desde el diseño y por defecto.
* **Acuerdo de Nivel de Servicio (SLA):** Garantía de disponibilidad del $99.99\%$ para la consola de gestión `control-plane` y latencia garantizada P99 $<2\text{ ms}$ para los motores de decisión L7.



---

# CAPÍTULO 5: GUÍA DE IMPLEMENTACIÓN PARA EL DESARROLLADOR FRONTEND

El desarrollador debe utilizar estos modelos de datos TypeScript para estructurar el contenido dinámico de la aplicación React.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     MODELO DE DATOS TYPESCRIPT PARA EL FRONTEND                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

```typescript
// src/types/saare.ts

export type TierId = 'sdk' | 'proxy' | 'forensic' | 'compliance' | 'partner';

export interface PricingTier {
  id: TierId;
  name: string;
  badge: string;
  priceMonthly: number;
  priceAnnual: number;
  billingModel: string;
  overageRate?: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
}

export interface NavTab {
  id: string;
  label: string;
  desc: string;
  path: string;
  badgeText: string;
}

export interface VerificationResult {
  status: 'VERIFIED' | 'UNVERIFIED';
  hash: string;
  timestamp: string;
  legalStandard: string;
  merkleRoot: string;
  algorithm: string;
}

```

---

## Data Model para las 7 Pestañas Comerciales (`src/data/tabsData.ts`)

```typescript
export const TABS_CONFIG: NavTab[] = [
  { id: "auditoria", label: "1. AUDITORÍA PÚBLICA", desc: "Motor de Referencia Empírico", path: "/", badgeText: "PUBLIC TRUST ANCHOR" },
  { id: "cumplimiento", label: "2. CUMPLIMIENTO L7", desc: "Consola 3 Vistas RBAC", path: "/cumplimiento", badgeText: "CONSOLA UNIFICADA" },
  { id: "forense", label: "3. LEGAL-FORENSE", desc: "EvidenceVault & eIDAS", path: "/forense", badgeText: "PRUEBA JUDICIAL ART. 326 LEC" },
  { id: "ventas", label: "4. AGENTES VENTA", desc: "Kit Consulting & Canal", path: "/ventas", badgeText: "CANAL & SUBVENCIONES" },
  { id: "sdk", label: "5. MODO SDK", desc: "LabEngine & Code AST", path: "/sdk", badgeText: "DESARROLLADORES" },
  { id: "proxy", label: "6. MODO PROXY", desc: "PerimeterShield L7", path: "/proxy", badgeText: "CIBERSEGURIDAD PERIMETRAL" },
  { id: "daemon", label: "7. MODO DAEMON", desc: "Servicio Local On-Premise", path: "/daemon", badgeText: "INFRAESTRUCTURA LOCAL" }
];

```

---

## Checklist de QA para la Verificación del Desarrollador

Antes de dar por finalizada la tarea, el desarrollador debe verificar:

* [ ] **Cero Alteración de UI:** El diseño visual, fuentes, espacios y rejillas Tailwind de la versión previa se mantienen al $100\%$.
* [ ] **7 Pestañas Funcionando:** La barra de navegación superior permite alternar fluidamente entre las 7 rutas sin recargar la página.
* [ ] **Pie de Página Completo:** El pie de página incluye las tres columnas corporativas con los enlaces hacia `/empresa`, `/buenas-practicas` y `/legal`.
* [ ] **Precios y Licencias Coherentes:** Todas las tarjetas de precio reflejan los importes exactos en euros, modelos de facturación por flujo/nodo y overage definidos en el Capítulo 2.
* [ ] **Verificador Funcional:** El componente de la Pestaña 1 responde a la búsqueda de la firma demo renderizando el bloque de validación eIDAS RFC 3161.