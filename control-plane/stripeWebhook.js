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

  // Tolerancia de 5 minutos para evitar ataques de réplica (Replay Attacks)
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

  // Comparación en tiempo constante para evitar Timing Attacks
  return v1Signatures.some(sig => {
    if (sig.length !== expectedHex.length) return false;
    let diff = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      diff |= expectedHex.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    return diff === 0;
  });
}

/**
 * Mapeo de Nivel (Tier) o Price ID a Rol RBAC de S.A.A.R.E.
 */
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

/**
 * Normalización del ID de Plan canónico según metadatos de Stripe o Price ID
 */
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

  // 1. Validación de Seguridad de la Firma
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

  // 2. Control de Idempotencia (Prevención de duplicación mediante KV)
  if (env.SAARE_VAULT_KV && event.id) {
    const seenKey = `stripe_event:${event.id}`;
    const alreadyProcessed = await env.SAARE_VAULT_KV.get(seenKey);
    if (alreadyProcessed) {
      return new Response(JSON.stringify({ status: "ALREADY_PROCESSED", eventId: event.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    // Marcar como procesado por 30 días
    await env.SAARE_VAULT_KV.put(seenKey, "1", { expirationTtl: 60 * 60 * 24 * 30 });
  }

  // 3. Procesamiento de Eventos de Checkout Completo y Pago
  if (event.type === "checkout.session.completed" || event.type === "invoice.payment_succeeded") {
    const session = event.data.object;
    
    // Ignorar facturas que no correspondan a suscripciones o ventas directas
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
      console.error("[SAARE Stripe Webhook] checkout.session.completed sin email de cliente:", session.id);
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

    // A. Sincronización en Cloudflare KV (Lecturas ultrarrápidas de sesión)
    if (env.SAARE_VAULT_KV) {
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
    }

    // B. Persistencia y Aprovisionamiento en D1 Database
    if (env.DB) {
      try {
        // Garantizar existencia de esquemas
        await env.DB.batch([
          env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS tenants (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE,
              name TEXT,
              plan TEXT,
              status TEXT,
              updated_at TEXT
            );
          `),
          env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE,
              password_hash TEXT,
              name TEXT,
              company TEXT,
              role TEXT,
              verification_token TEXT,
              verification_expires_at TEXT,
              is_verified INTEGER DEFAULT 0,
              created_at TEXT
            );
          `)
        ]);

        // Actualizar/Insertar Tenant
        await env.DB.prepare(`
          INSERT INTO tenants (id, email, name, plan, status, updated_at)
          VALUES (?, ?, ?, ?, 'ACTIVE', datetime('now'))
          ON CONFLICT(email) DO UPDATE SET 
            id = excluded.id, 
            plan = excluded.plan, 
            status = 'ACTIVE', 
            updated_at = datetime('now')
        `).bind(tenantId, customerEmail, customerName, planId).run();

        // Actualizar/Insertar Usuario Aprovisionado
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

  // 4. Gestión de Bajas y Cancelaciones de Suscripción
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerEmail = subscription.metadata?.customerEmail;

    if (customerEmail && env.DB) {
      await env.DB.prepare(`
        UPDATE tenants SET status = 'CANCELLED', updated_at = datetime('now') WHERE email = ?
      `).bind(customerEmail).run();
    }

    return new Response(JSON.stringify({ status: "SUBSCRIPTION_CANCELLED" }), { status: 200 });
  }

  return new Response(JSON.stringify({ status: "IGNORED", type: event.type }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}