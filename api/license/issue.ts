import { NextApiRequest, NextApiResponse } from 'next';
import { generateEd25519Signature } from '../lib/crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Construir la estructura exacta del payload
  const licenseData = {
    issuer: "MS3V S.A.A.R.E. Protocol",
    version: "v4.2-Enterprise",
    license_id: `SAARE-${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
    client: {
      name: req.body.name || "Cliente Corporativo",
      company: req.body.company || "Empresa B2B",
      email: req.body.email || "ciso@empresa.com",
      country: "ES"
    },
    validity: {
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      trial_days: 15
    },
    entitlements: {
      modules: ["*"],
      presets: ["--preset dev-lightweight", "--preset banking-shield"]
    }
  };

  // 2. Firmar el payload con la Clave Privada Ed25519
  const signature = generateEd25519Signature(JSON.stringify(licenseData));

  // 3. Estructura final plana de la licencia
  const saareLicPayload = {
    ...licenseData,
    signature: signature
  };

  // 4. Configurar cabeceras para descarga directa del archivo saare.lic
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="saare.lic"');
  
  // Enviar el JSON directo sin envoltorios extra
  return res.status(200).send(JSON.stringify(saareLicPayload, null, 2));
}