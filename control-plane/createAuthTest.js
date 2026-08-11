import fs from "fs";
const code = `import { AuthMiddleware } from "./authMiddleware.js";
console.log("=== SUITE V3.3 - ENTERPRISE OIDC & RBAC ENFORCEMENT TEST ===");
const auth = new AuthMiddleware();
// Helper para construir un JWT MOCK firmado en base64
function createMockJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = Buffer.from("mock_signature_bytes").toString("base64");
  return \`Bearer \${header}.\${body}.\${signature}\`;
}
// 1. Probar usuario del equipo de Ingeniería
console.log("\\n[FASE 1] Autenticando usuario OIDC de Ingeniería...");
const engToken = createMockJWT({
  sub: "usr_eng_99",
  email: "dev@empresa.com",
  tenant_id: "bank_alpha_es",
  groups: ["saare-eng-group"],
  exp: Math.floor(Date.now() / 1000) + 3600
});
const engUser = auth.verifyAndDecodeToken(engToken);
console.log("  -> Usuario:", engUser.email, "| Rol Mapeado:", engUser.role, "| Tenant:", engUser.tenantId);
// 2. Probar usuario de Auditoría/CISO (Mínimo Privilegio)
console.log("\\n[FASE 2] Autenticando usuario OIDC de Auditoría...");
const cisoToken = createMockJWT({
  sub: "usr_ciso_01",
  email: "ciso@empresa.com",
  tenant_id: "bank_alpha_es",
  groups: ["saare-ciso-group"],
  exp: Math.floor(Date.now() / 1000) + 3600
});
const cisoUser = auth.verifyAndDecodeToken(cisoToken);
console.log("  -> Usuario:", cisoUser.email, "| Rol Mapeado:", cisoUser.role, "| Tenant:", cisoUser.tenantId);
// 3. Probar intento de acceso con Token Expirado
console.log("\\n[FASE 3] Verificando rechazo de Token Expirado...");
const expiredToken = createMockJWT({
  sub: "usr_expired",
  email: "old@empresa.com",
  groups: ["saare-eng-group"],
  exp: Math.floor(Date.now() / 1000) - 3600
});
let expiredRejected = false;
try {
  auth.verifyAndDecodeToken(expiredToken);
} catch (err) {
  expiredRejected = true;
  console.log("  -> SUCCESS: Token rechazado ->", err.message);
}
if (engUser.role === "Engineer" && cisoUser.role === "Business" && expiredRejected) {
  console.log("\\n=== OIDC IDENTITY & SERVER-SIDE RBAC ENFORCEMENT VERIFIED (PASS) ===");
} else {
  console.error("\\n=== FAIL EN AUTHENTICATION ENFORCEMENT ===");
  process.exit(1);
}
`;
fs.writeFileSync("testAuth.js", code);
console.log("=== testAuth.js generado exitosamente ===");

