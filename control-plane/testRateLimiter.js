import { DistributedRateLimiter } from "./rateLimiter.js";
console.log("=== SUITE V3.1 - DISTRIBUTED RATE LIMITER & NOISY NEIGHBOR TEST ===");
const limiter = new DistributedRateLimiter(60000, 3); // M�ximo 3 peticiones por minuto
// 1. Agotar la cuota de Corp Beta (R�faga)
console.log("\n[FASE 1] Consumiendo cuota de Corp Beta...");
limiter.isAllowed("corp_beta_global");
limiter.isAllowed("corp_beta_global");
limiter.isAllowed("corp_beta_global");
const betaBlocked = limiter.isAllowed("corp_beta_global");
console.log("  -> Petici�n 4 de Corp Beta: Allowed =", betaBlocked.allowed, "| Raz�n:", betaBlocked.reason);
// 2. Verificar que Bank Alpha mantiene su cuota intacta
console.log("\n[FASE 2] Verificando aislamiento de cuota de Bank Alpha...");
const alphaCheck = limiter.isAllowed("bank_alpha_es");
console.log("  -> Petici�n 1 de Bank Alpha: Allowed =", alphaCheck.allowed, "| Remaining:", alphaCheck.remaining);
if (!betaBlocked.allowed && alphaCheck.allowed) {
  console.log("\n=== NOISY NEIGHBOR PROTECTION & RATE LIMITING VERIFIED (PASS) ===");
} else {
  console.error("\n=== FAIL EN RATE LIMITER ===");
  process.exit(1);
}
