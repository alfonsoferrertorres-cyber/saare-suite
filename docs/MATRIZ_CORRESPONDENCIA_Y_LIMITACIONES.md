# MATRIZ DE CORRESPONDENCIA TÉCNICA Y LIMITACIONES DE ALCANCE (NIVEL V4)
Expediente: MS3V-RECON-VALID-2026-ALF-0521
Referencia de Versionado: Repositorio Maestro (Rama main)
Digest Raíz Canónico (hashes.sha256): 195cd0b59b7fb67b5d17d27e588def368ded68c15f54f2c891b049c7e0fbb019

## 1. MATRIZ DE CORRESPONDENCIA DE CONTROLES TÉCNICOS
| Marco Normativo / Referencia | Control / Requisito | Evidencia Aportada | Artefacto Vinculado | Estado de Correspondencia |
| :--- | :--- | :--- | :--- | :--- |
| **EU AI Act (Reglamento UE 2024/1689)** | Art. 12 (Conservación de logs y registros) | Generación ex-ante de registros de eventos en L7 | `saare-suite/src/App.jsx` / `control-plane` | Correspondencia técnica demostrada en entorno de prueba. |
| **EU AI Act (Reglamento UE 2024/1689)** | Art. 15 (Robustez y ciberseguridad) | Interceptación y bloqueo de cargas reguladas en RAM | `audit_harness/benchmark_engine.js` | Correspondencia técnica demostrada en entorno de prueba. |
| **RGPD (Reglamento UE 2016/679)** | Art. 5 (Minimización de datos) | Supresión de PII previa a la transmisión externa | `inject.js` / `audit_harness` | Correspondencia técnica demostrada en entorno de prueba. |
| **RGPD (Reglamento UE 2016/679)** | Art. 25 (Protección desde el diseño) | Desacople de red a nivel aplicación en capa 7 | `audit_artifacts/04_REGISTROS_PROPIEDAD` | Correspondencia técnica demostrada en entorno de prueba. |
| **DORA (Reglamento UE 2022/2554)** | Art. 28 (Gestión de riesgo TIC de terceros) | Filtrado perimetral previo a salida a modelos terceros | `control-plane/src/index.js` | Correspondencia técnica demostrada en entorno de prueba. |
| **ISO/IEC 42001:2023** | Objetivos de gobernanza y control AIMS | Inventario criptográfico, dataset y manifiesto raíz | `hashes.sha256` / `ROOT_MANIFEST_SEAL.json` | Correspondencia técnica con el marco de gobernanza. |
| **UNE-EN ISO/IEC 17025 (Principios)** | Requisitos técnicos de ensayo y calibración | Trazabilidad del dataset (10k), recálculo determinista y especificaciones de entorno | `audit_harness/` / `verificar_tercero.js` | Compatibilidad metodológica con principios de ensayo; no implica acreditación formal de laboratorio. |

## 2. REGISTRO FORMAL DE LIMITACIONES DEL ALCANCE PROBATORIO
1. **Identidad, Integridad y Versionado:** El commit Git identifica un estado concreto del código en el repositorio, permitiendo verificar la integridad de sus archivos mediante SHA-256; no constituye por sí solo acreditación de autoría material sin el cotejo de los certificados registrales de Safe Creative (Nº 2607076315021 / 2607076314949).
2. **Reproducibilidad Estadística:** Los valores de media (0.017637 ms), varianza, desviación estándar (sigma = 0.026074 ms) y percentiles (p95 = 0.032600 ms, p99 = 0.058800 ms) son directamente recalculables de forma determinista a partir de las 10.000 muestras numéricas conservadas en `raw_samples_dataset.json`. La replicación del benchmark en hardware distinto evalúa la estabilidad del protocolo bajo las condiciones de dicho entorno, pudiendo presentar variaciones operativas derivadas de la CPU, sistema operativo o motor V8.
3. **Alcance del Saneamiento de Memoria:** La verificación mediante `Buffer.fill(0x00)` sobre el buffer sintético de 64 bytes acredita que el 100% de los bytes accesibles en el espacio de memoria del proceso fueron sobrescritos. No constituye una declaración sobre regiones no gestionadas por el runtime, memoria swap del sistema operativo o copias transitorias en capas inferiores de hardware.
4. **Naturaleza Regulatoria y Pericial:** La correspondencia con artículos del EU AI Act, RGPD, DORA, ISO/IEC 42001 o principios de ISO/IEC 17025 refleja la existencia de controles técnicos alineados, sin constituir por sí misma una certificación oficial ni sustituir las evaluaciones de conformidad exigibles por las autoridades de control.