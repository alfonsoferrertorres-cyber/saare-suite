import { sign } from 'tweetnacl';

export async function generateEnterpriseLicense(payload) {
  const privateKeyBase64 = process.env.SAARE_PRIVATE_KEY_ED25519;
  if (!privateKeyBase64) {
    throw new Error("SECURITY_ALERT: Private signing key is missing on backend.");
  }

  const secretKey = Buffer.from(privateKeyBase64, 'base64');
  const licenseData = {
    tenant_id: payload.tenantId,
    company: payload.companyName,
    tier: payload.tier || 'Enterprise',
    max_nodes: payload.maxNodes || 100,
    features: payload.features || ['runtime_l7', 'circuit_breaker', 'ram_masking'],
    issued_at: new Date().toISOString(),
    expires_at: payload.expiresAt
  };

  const messageUint8 = new TextEncoder().encode(JSON.stringify(licenseData));
  const signatureUint8 = sign.detached(messageUint8, secretKey);

  return {
    license_payload: licenseData,
    signature_ed25519: Buffer.from(signatureUint8).toString('base64')
  };
}