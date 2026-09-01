# S.A.A.R.E. — AI-Native Audit & Decision Layer™ (v10.0)

Infraestructura de gobernanza técnica, intercepción en Capa 7 (RAM) y emisión de veredictos normativos vinculantes (**SGP 1.0**) para inteligencia artificial.

## Arquitectura del Ecosistema

- **Control Plane (`/control-plane`):** Cloudflare Worker con el Governance Judge (`POST /api/v1/judge`), Decision Store en KV y firma Ed25519 con RFC 3161.
- **Suite Landing (`/saare-suite`):** Portal corporativo, visualizador de SAARE VERDICT™ y aprovisionamiento tokenizado.
- **Consola GRC (`/saare-console`):** Panel de auditoría, control de las 5 Bóvedas Maestras y telemetría RunLive.
- **Runtime Agent (`/runtime`):** Sensor perimetral L7 para navegadores Chromium con aislamiento de memoria volátil (`SYS_madvise`).

## Flujo de Adjudicación SGP 1.0