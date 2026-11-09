// control-plane/stripeWebhook.js — S.A.A.R.E. Enterprise SGP 1.0 (Stripe Sync Engine)
import { PLAN_IDS, sanitizePlanId } from "@saare/entitlements";

/**
 * Verificación criptográfica constante y segura de firmas HMAC SHA-256 de Stripe Webhooks
 */
async function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const elements = signatureHeader.split(',').map(item => item.trim());
  const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
  const v1Signatures = elements.filter(e => e.startsWith('v1=')).map(e => e.split('=')[1]);

  if (!timestamp || v1Signatures.length === 0) return false;

  const TOLERANCE_SECONDS = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > TOLERANCE_SECONDS) return false;

  const encoder = new TextEncoder();
  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expectedBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(expectedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return v1Signatures.some(sig => {
    if (sig.length !== expectedHex.length) return false;
    let diff = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      diff |= expectedHex.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    return diff === 0;
  });
}

function mapTierToRole(tierOrPlan, priceId) {
  const target = (tierOrPlan || "").toLowerCase();
  if (target.includes("enterprise") || priceId === "price_1UHuuwFlwFW4ifPS66wDvS4n") {
    return "CISO_SECOPS_LEVEL_3";
  }
  if (target.includes("professional") || priceId === "price_1UHuypFlwFW4ifPSyDz1vT47") {
    return "CISO_SECOPS_LEVEL_3";
  }
  if (target.includes("compliance")) {
    return "DPO_GRC_LEVEL_2";
  }
  if (target.includes("sandbox") || target.includes("free")) {
    return "AUDITOR_GUEST_LEVEL_0";
  }
  return "BOARD_EXECUTIVE_LEVEL_1";
}

function resolvePlanId(session) {
  const metadata = session.metadata || {};
  const tier = metadata.tier || metadata.plan || metadata.planId;
  
  if (tier) {
    return sanitizePlanId(tier.toUpperCase());
  }

  const priceId = session.line_items?.data?.[0]?.price?.id || metadata.price_id || metadata.price;
  if (priceId === "price_1UHuuwFlwFW4ifPS66wDvS4n") return PLAN_IDS.ENTERPRISE_1500;
  if (priceId === "price_1UHuypFlwFW4ifPSyDz1vT47") return PLAN_IDS.PROFESSIONAL_649;

  return PLAN_IDS.COMPLIANCE_249;
}

export async function handleStripeWebhook(request, env) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  const bodyText = await request.text();
  const signature = request.headers.get("stripe-signature");

  const isValidStripeEvent = await verifyStripeSignature(bodyText, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValidStripeEvent) {
    console.error("[SAARE Stripe Webhook] Firma inválida rechazada.");
    return new Response(JSON.stringify({ error: "Firma de webhook inválida" }), { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(bodyText);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON Payload" }), { status: 400 });
  }

  if (env.SAARE_VAULT_KV && event.id) {
    const seenKey = `stripe_event:${event.id}`;
    const alreadyProcessed = await env.SAARE_VAULT_KV.get(seenKey);
    if (alreadyProcessed) {
      return new Response(JSON.stringify({ status: "ALREADY_PROCESSED", eventId: event.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.SAARE_VAULT_KV.put(seenKey, "1", { expirationTtl: 60 * 60 * 24 * 30 });
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.payment_succeeded") {
    const session = event.data.object;
    
    if (event.type === "invoice.payment_succeeded" && session.billing_reason === "subscription_cycle") {
      return new Response(JSON.stringify({ status: "CYCLE_RENEWAL_ACKNOWLEDGED" }), { status: 200 });
    }

    const customerEmail = (
      session.customer_details?.email || 
      session.customer_email || 
      session.payer?.email_address || 
      ""
    ).toLowerCase().trim();

    const customerName = session.customer_details?.name || session.metadata?.organization || "Organización Suscrita";
    const planId = resolvePlanId(session);
    const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata?.price_id || "payment_link";
    const assignedRole = mapTierToRole(session.metadata?.tier || planId, priceId);
    
    const tenantId = session.client_reference_id || session.metadata?.tenant || `tenant_${crypto.randomUUID().slice(0, 8)}`;

    if (session.payment_status && session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return new Response(JSON.stringify({ status: "PENDING_PAYMENT", sessionId: session.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!customerEmail) {
      console.error("[SAARE Stripe Webhook] Evento sin email de cliente:", session.id);
      return new Response(JSON.stringify({ status: "NO_EMAIL", sessionId: session.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const tenantRecord = {
      tenantId,
      customerEmail,
      companyName: customerName,
      status: "ACTIVE",
      plan: planId,
      planId: planId,
      priceId: priceId,
      role: assignedRole,
      updatedAt: new Date().toISOString()
    };

    if (env.SAARE_VAULT_KV) {
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
    }

    if (env.DB) {
      try {
        await env.DB.prepare(`
          INSERT INTO tenants (id, email, name, plan, status, updated_at)
          VALUES (?, ?, ?, ?, 'ACTIVE', datetime('now'))
          ON CONFLICT(email) DO UPDATE SET 
            id = excluded.id, 
            plan = excluded.plan, 
            status = 'ACTIVE', 
            updated_at = datetime('now')
        `).bind(tenantId, customerEmail, customerName, planId).run();

        await env.DB.prepare(`
          INSERT INTO users (email, password_hash, name, company, role, is_verified, created_at)
          VALUES (?, 'demo', ?, ?, ?, 1, datetime('now'))
          ON CONFLICT(email) DO UPDATE SET 
            company = excluded.company, 
            role = excluded.role, 
            is_verified = 1
        `).bind(customerEmail, customerName, tenantId, assignedRole).run();

      } catch (e) {
        console.error("[SAARE Stripe Webhook] Error sincronizando D1 Database:", e);
        return new Response(JSON.stringify({ error: "DB_SYNC_FAILED", message: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({
      status: "PROVISIONED",
      tenantId,
      user: customerEmail,
      planId: planId,
      role: assignedRole
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerEmail = subscription.metadata?.customerEmail;
    const tenantId = subscription.metadata?.tenant;

    if (customerEmail) {
      if (env.DB) {
        await env.DB.prepare(`
          UPDATE tenants SET status = 'CANCELLED', updated_at = datetime('now') WHERE email = ?
        `).bind(customerEmail).run();
      }

      if (env.SAARE_VAULT_KV) {
        const existingKv = await env.SAARE_VAULT_KV.get(`user:${customerEmail}`, "json");
        if (existingKv) {
          existingKv.status = "CANCELLED";
          existingKv.updatedAt = new Date().toISOString();
          await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(existingKv));
        }
        if (tenantId) {
          const existingTenantKv = await env.SAARE_VAULT_KV.get(`tenant:${tenantId}`, "json");
          if (existingTenantKv) {
            existingTenantKv.status = "CANCELLED";
            existingTenantKv.updatedAt = new Date().toISOString();
            await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(existingTenantKv));
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: "SUBSCRIPTION_CANCELLED" }), { status: 200 });
  }

  return new Response(JSON.stringify({ status: "IGNORED", type: event.type }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}