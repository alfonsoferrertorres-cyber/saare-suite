// control-plane/stripeWebhook.js — S.A.A.R.E. Enterprise SGP 1.0 (Stripe Sync Engine)
import { PLAN_IDS, sanitizePlanId } from "@saare/entitlements";

async function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const elements = signatureHeader.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
  const signature = elements.find(e => e.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !signature) return false;

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

  const expectedSignatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (expectedSignatureHex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedSignatureHex.length; i++) {
    diff |= expectedSignatureHex.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

// Map de Price IDs reales (App.jsx) a Roles RBAC de S.A.A.R.E.
function mapPriceToRole(priceId) {
  if (priceId === "price_1UHuuwFlwFW4ifPS66wDvS4n") return "CISO_SECOPS_LEVEL_3";
  if (priceId === "price_1UHuypFlwFW4ifPSyDz1vT47") return "DPO_GRC_LEVEL_2";
  return "BOARD_EXECUTIVE_LEVEL_1";
}

// Map de Price IDs / Metadata a IDs canónicos de PLAN_IDS de @saare/entitlements
function mapPriceToPlanId(priceId, metadataPlan) {
  if (metadataPlan) return sanitizePlanId(metadataPlan);
  if (priceId === "price_1UHuuwFlwFW4ifPS66wDvS4n") return PLAN_IDS.ENTERPRISE_1500;
  if (priceId === "price_1UHuypFlwFW4ifPSyDz1vT47") return PLAN_IDS.PROFESSIONAL_649;
  return sanitizePlanId(priceId);
}

export async function handleStripeWebhook(request, env) {
  const bodyText = await request.text();
  const signature = request.headers.get("stripe-signature");

  const isValidStripeEvent = await verifyStripeSignature(bodyText, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValidStripeEvent) {
    return new Response(JSON.stringify({ error: "Firma de webhook inválida" }), { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(bodyText);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // Prevenir procesamiento duplicado de webhooks (Idempotencia en KV)
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    const customerName = session.customer_details?.name || session.metadata?.organization || "Organización Suscrita";
    const priceId = session.metadata?.price_id || session.metadata?.price || "price_1UHuypFlwFW4ifPSyDz1vT47";
    const planId = mapPriceToPlanId(priceId, session.metadata?.plan || session.metadata?.planId);
    const assignedRole = mapPriceToRole(priceId);
    
    // Asignación unificada de Tenant ID
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
      createdAt: new Date().toISOString()
    };

    // 1. Sincronización e Indexación en Cloudflare KV
    if (env.SAARE_VAULT_KV) {
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
    }

    // 2. Persistencia en Base de Datos D1
    if (env.DB) {
      try {
        await env.DB.exec(`
          CREATE TABLE IF NOT EXISTS tenants (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            name TEXT,
            plan TEXT,
            status TEXT,
            updated_at TEXT
          );
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
        `);

        // Sincronizar tabla de Tenants registrando el planId normalizado
        await env.DB.prepare(`
          INSERT INTO tenants (id, email, name, plan, status, updated_at)
          VALUES (?, ?, ?, ?, 'ACTIVE', datetime('now'))
          ON CONFLICT(email) DO UPDATE SET id = excluded.id, plan = excluded.plan, status = 'ACTIVE', updated_at = datetime('now')
        `).bind(tenantId, customerEmail, customerName, planId).run();

        // Sincronizar Usuario Aprovisionado (asignando company = tenantId para coincidencia en RBAC)
        await env.DB.prepare(`
          INSERT INTO users (email, password_hash, name, company, role, is_verified, created_at)
          VALUES (?, 'demo', ?, ?, ?, 1, datetime('now'))
          ON CONFLICT(email) DO UPDATE SET company = excluded.company, role = excluded.role, is_verified = 1
        `).bind(customerEmail, customerName, tenantId, assignedRole).run();

      } catch (e) {
        console.error("[SAARE Stripe Webhook] Error actualizando D1:", e);
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

  return new Response(JSON.stringify({ status: "IGNORED", type: event.type }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}