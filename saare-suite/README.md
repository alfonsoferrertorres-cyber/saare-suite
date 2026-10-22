# S.A.A.R.E. v7 PRO — Control Suite

Aplicación React/Vite que integra, en una consola única, los módulos descritos por la documentación aportada:

- `ExecutiveView` — vista ejecutiva/CEO.
- `GrcAuditView` — GRC & Audit + 8 invariantes.
- `EnforcementView` — `SAARE-MD-SECU` / `/api/v1/intercept`.
- `ForensicView` — `SAARE-MD-FOR` + digest local.
- `EvidenceVerify` — `/verify/:hash` + cadena de evidencia.
- `ResilienceLab` — `Invariant Audit` / `/api/v1/resilience/check`.
- `SubsidiesHub` — paquetes de dossier para programas.
- `DossierExporter` — JSON, CSV y print/PDF.
- `GovernanceToolbar` — selector de `SAARE-MD-*` modes.

## IMPORTANTE

En este intercambio no se ha aportado el código fuente real de `App.jsx`, `control-plane`, `ExecutiveView.jsx`, etc. Por eso esta implementación conserva los nombres, contratos y modos indicados por el usuario, pero no pretende ser un patch sobre su repositorio original.

La app trae un adaptador `src/api/controlPlane.js`:

- sin `VITE_CONTROL_PLANE_URL`: usa respuestas DEMO locales;
- con `VITE_CONTROL_PLANE_URL`: intenta llamar al backend real y hace fallback DEMO si falla.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir la URL que entregue Vite (normalmente `http://localhost:5173`).

## Conectar el backend real

Crear `.env`:

```env
VITE_CONTROL_PLANE_URL=https://tu-control-plane.example.com
```

Endpoints esperados:

- `POST /api/v1/resilience/check`
- `POST /api/v1/intercept`
- `GET /verify/:hash`

## Worker / D1 de referencia

`worker/index.js` contiene un adaptador Cloudflare Worker y `worker/schema.sql` una tabla mínima para veredictos. Debe revisarse contra el esquema y criptografía reales antes de producción.

## Claims

Los estados, benchmarks, certificaciones y claims jurídicos deben distinguirse por procedencia: `DEMO`, `BENCHMARK`, `REFERENCE`, `LIVE`. Esta UI no convierte por sí sola un benchmark o una referencia documental en una certificación independiente.
