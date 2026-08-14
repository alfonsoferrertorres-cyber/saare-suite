# S.A.A.R.E. Enterprise — Operations & Emergency Runbook

## 1. Quick Verification Commands

### Full E2E Certification Suite
node e2eCertificationSuite.js

### V3.0 Enterprise Production Readiness Suite
node v3EnterpriseSuite.js

## 2. Architectural Answers for Security Audits

* **Q1: ¿Como escala el sistema?**
  Control Plane stateless + workers/inspectors L7 escalables horizontalmente en Rust + almacenamiento de evidencias desacoplado + despliegue Kubernetes nativo.

* **Q2: ¿Donde y como se custodian las claves de firma?**
  En entorno de desarrollo se usa el KeyManager local. Para produccion (V4.1), se desacopla mediante el KeyProviderInterface hacia proveedores KMS/HSM (AWS KMS, Azure Key Vault, PKCS#11).

* **Q3: ¿Que sucede si el Inspector L7 falla o se desconecta?**
  Politica Fail-Closed obligatoria: toda solicitud se rechaza automaticamente, emitiendo telemetria OpenTelemetry de la falla y registrando la evidencia auditable.
