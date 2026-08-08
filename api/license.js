import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, email, tier = 'PRESET_TIER1_GATEWAY' } = req.body;

  const payload = {
    client_id: company || 'Cliente Enterprise',
    preset_id: tier,
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    allowed_modules: ['01_perimetershield', '03_compliancesuite'],
    max_nodes: 10
  };

  // Firma simétrica de la licencia con HMAC-SHA256
  const secretKey = process.env.LICENSE_SECRET || 'SECRET_KEY_SAARE_2026';
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(JSON.stringify(payload));
  const signature = Array.from(hmac.digest());

  const licenseData = { payload, signature };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="saare.lic"');
  return res.status(200).send(JSON.stringify(licenseData, null, 2));
}
