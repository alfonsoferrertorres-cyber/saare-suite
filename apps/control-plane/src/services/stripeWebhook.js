// apps/control-plane/src/services/stripeWebhook.js
import { computeSha256 } from "./keyManager.js";
import { sanitizePlanId, getPlanEntitlements } from "../packages/entitlements.js";

async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret || !sigHeader) return false;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((item) => item.split("="))
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

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

  return expected === signature;
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
  const monthlyQuota = entitlements?.monthlyVerdicts || 50000;
  const maxSeats = entitlements?.maxSeats || 25;
  const cleanTenant = tenantId
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .slice(0, 32);

  const kv = env?.SAARE_KV_VAULT || env?.SAARE_VAULT_KV || null;
  let licenseKey = kv ? await kv.get(`license:${cleanTenant}`) : null;

  if (!licenseKey) {
    licenseKey = `sk_saare_live_${(
      await computeSha256(`${cleanTenant}:${adminEmail}:${env?.JWT_SECRET || "saare"}`)
    ).slice(0, 28)}`;
  }

  const tempPassword = `Saare${(
    await computeSha256(`${adminEmail}:${Date.now()}`)
  ).slice(0, 10)}!`;

  if (env?.DB) {
    await env.DB.batch([
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
      ),
      env.DB.prepare(`
        INSERT INTO users (email, password_hash, name, company, role, is_verified)
        VALUES (?, ?, ?, ?, 'CISO_ADMIN', 1)
        ON CONFLICT(email) DO UPDATE SET
          company = excluded.company,
          role = 'CISO_ADMIN',
          is_verified = 1
      `).bind(
        adminEmail.trim().toLowerCase(),
        tempPassword,
        `Admin ${companyName || cleanTenant}`,
        cleanTenant
      )
    ]);
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
    adminEmail: adminEmail.trim().toLowerCase(),
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

  const event = JSON.parse(rawBody || "{}");

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    const obj = event.data?.object || {};
    const meta = obj.metadata || {};
    const email = obj.customer_details?.email || obj.customer_email || meta.adminEmail;
    const company = meta.companyName || (email ? email.split("@")[1].split(".")[0].toUpperCase() : "TENANT_PRO");
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
    const tenantId = sub.metadata?.tenantId;
    if (tenantId && env?.DB) {
      await env.DB.prepare("UPDATE tenants SET status = 'SUSPENDED' WHERE tenant_id = ?")
        .bind(tenantId)
        .run();
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}