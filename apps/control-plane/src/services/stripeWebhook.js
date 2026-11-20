// apps/control-plane/src/services/stripeWebhook.js
import { computeSha256 } from "./keyManager.js";
import { sanitizePlanId, getPlanEntitlements } from "../packages/entitlements.js";

function normalizeTenantId(rawId) {
  if (!rawId || typeof rawId !== "string") return "DEFAULT_TENANT";
  return rawId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .slice(0, 32) || "DEFAULT_TENANT";
}

async function hashPasswordPbkdf2(password) {
  const iterations = 100000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256
  );
  const hashHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2$${iterations}$${saltHex}$${hashHex}`;
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyStripeSignature(payload, sigHeader, secret, toleranceSeconds = 300) {
  if (!secret || !sigHeader || typeof sigHeader !== "string") return false;

  let timestamp = "";
  const v1Signatures = [];

  for (const part of sigHeader.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key === "t") timestamp = val;
    if (key === "v1" && val) v1Signatures.push(val);
  }

  if (!timestamp || v1Signatures.length === 0) return false;

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum)) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsNum) > toleranceSeconds) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${payload}`)
  );
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return v1Signatures.some((sig) => timingSafeEqualHex(expected, sig));
}

export async function provisionTenantFromBilling({
  tenantId,
  companyName,
  adminEmail,
  planId,
  stripeCustomerId,
  stripeSubscriptionId,
  env
}) {
  const cleanPlan = sanitizePlanId(planId);
  const entitlements = getPlanEntitlements(cleanPlan);
  const monthlyQuota = entitlements.monthlyVerdicts;
  const maxSeats = entitlements.maxSeats;
  const cleanTenant = normalizeTenantId(tenantId);
  const cleanEmail = String(adminEmail || "").trim().toLowerCase();

  const kv = env?.SAARE_KV_VAULT || env?.SAARE_VAULT_KV || null;
  let licenseKey = kv ? await kv.get(`license:${cleanTenant}`) : null;

  if (!licenseKey) {
    licenseKey = `sk_saare_live_${(
      await computeSha256(`${cleanTenant}:${cleanEmail}:${env?.JWT_SECRET || "saare"}`)
    ).slice(0, 28)}`;
  }

  const tempPassword = `Saare${(
    await computeSha256(`${cleanEmail}:${Date.now()}`)
  ).slice(0, 10)}!`;
  const passwordHash = await hashPasswordPbkdf2(tempPassword);

  if (env?.DB) {
    const statements = [
      env.DB.prepare(`
        INSERT INTO tenants (tenant_id, name, plan_id, status, quota, expires_at, config_json)
        VALUES (?, ?, ?, 'ACTIVE', ?, datetime('now', '+35 days'), ?)
        ON CONFLICT(tenant_id) DO UPDATE SET
          plan_id = excluded.plan_id,
          status = 'ACTIVE',
          quota = excluded.quota,
          expires_at = excluded.expires_at,
          config_json = excluded.config_json
      `).bind(
        cleanTenant,
        companyName || cleanTenant,
        cleanPlan,
        monthlyQuota,
        JSON.stringify({
          stripeCustomerId: stripeCustomerId || null,
          stripeSubscriptionId: stripeSubscriptionId || null,
          maxSeats,
          isSandbox: false,
          sgpVersion: "SGP-1.0"
        })
      )
    ];

    if (cleanEmail) {
      statements.push(
        env.DB.prepare(`
          INSERT INTO users (email, password_hash, name, company, role, is_verified)
          VALUES (?, ?, ?, ?, 'CISO_ADMIN', 1)
          ON CONFLICT(email) DO UPDATE SET
            company = excluded.company,
            role = 'CISO_ADMIN',
            is_verified = 1
        `).bind(
          cleanEmail,
          passwordHash,
          `Admin ${companyName || cleanTenant}`,
          cleanTenant
        )
      );
    }

    await env.DB.batch(statements);
  }

  if (kv) {
    await kv.put(`license:${cleanTenant}`, licenseKey);
    await kv.put(`token_tenant:${licenseKey}`, cleanTenant);
    await kv.put(
      `tenant_meta:${cleanTenant}`,
      JSON.stringify({
        tenantId: cleanTenant,
        planId: cleanPlan,
        quota: monthlyQuota,
        maxSeats,
        status: "ACTIVE",
        stripeCustomerId: stripeCustomerId || null
      })
    );
  }

  return {
    tenantId: cleanTenant,
    planId: cleanPlan,
    quota: monthlyQuota,
    maxSeats,
    licenseKey,
    adminEmail: cleanEmail,
    tempPassword
  };
}

export async function handleStripeWebhook(request, env) {
  const rawBody = await request.text();
  const sigHeader = request.headers.get("stripe-signature");

  if (env?.STRIPE_WEBHOOK_SECRET) {
    const isValid = await verifyStripeSignature(
      rawBody,
      sigHeader,
      env.STRIPE_WEBHOOK_SECRET
    );
    if (!isValid) {
      return new Response(JSON.stringify({ error: "INVALID_STRIPE_SIGNATURE" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody || "{}");
  } catch {
    return new Response(JSON.stringify({ error: "INVALID_JSON_PAYLOAD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    const obj = event.data?.object || {};
    const meta = obj.metadata || {};
    const email = obj.customer_details?.email || obj.customer_email || meta.adminEmail;
    const domainPart = email && email.includes("@") ? email.split("@")[1].split(".")[0] : "TENANT_PRO";
    const company = meta.companyName || domainPart.toUpperCase();
    const tenantId = meta.tenantId || `TNT_${company}_${Date.now().toString(36).toUpperCase()}`;
    const planId = meta.planId || "PROFESSIONAL_649";

    if (email) {
      const provisioned = await provisionTenantFromBilling({
        tenantId,
        companyName: company,
        adminEmail: email,
        planId,
        stripeCustomerId: obj.customer,
        stripeSubscriptionId: obj.subscription,
        env
      });

      return new Response(
        JSON.stringify({ received: true, provisioned: true, tenantId: provisioned.tenantId }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data?.object || {};
    const rawTenantId = sub.metadata?.tenantId;
    if (rawTenantId && env?.DB) {
      const cleanTenant = normalizeTenantId(rawTenantId);
      await env.DB.prepare("UPDATE tenants SET status = 'SUSPENDED' WHERE tenant_id = ?")
        .bind(cleanTenant)
        .run();
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export default handleStripeWebhook;