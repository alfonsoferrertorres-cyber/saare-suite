import { NextApiRequest, NextApiResponse } from 'next';
import { generateEd25519Signature } from './lib/crypto';

interface ClientInfo {
  name: string;
  company: string;
  email: string;
  country: string;
}

interface LicensePayload {
  issuer: string;
  version: string;
  license_id: string;
  client: ClientInfo;
  validity: {
    issued_at: string;
    expires_at: string;
    trial_days: number;
  };
  entitlements: {
    modules: string[];
    presets: string[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configuración de cabeceras CORS para peticiones desde el frontend o CLI
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extracción de datos del cliente desde Query (GET) o Body (POST)
    const {
      name = "Alfonso Ferrer Torres",
      company = "MS3V S.A.A.R.E. SL",
      email = "legal@saare.es",
      country = "ES",
      trial_days = "365"
    } = req.method === 'POST' ? req.body : req.query;

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + Number(trial_days) * 24 * 60 * 60 * 1000);

    // Estructura base de la licencia sin el campo signature
    const licensePayload: LicensePayload = {
      issuer: "MS3V S.A.A.R.E. Protocol",
      version: "v4.2-Enterprise",
      license_id: `SAARE-${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      client: {
        name: String(name),
        company: String(company),
        email: String(email),
        country: String(country)
      },
      validity: {
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        trial_days: Number(trial_days)
      },
      entitlements: {
        modules: ["*"],
        presets: [
          "--preset dev-lightweight",
          "--preset banking-shield",
          "--preset court-verifier",
          "--preset eu-ai-act-auditor",
          "--preset military-airgapped"
        ]
      }
    };

    // Generación de firma asimétrica Ed25519
    const signature = generateEd25519Signature(licensePayload);

    // Construcción del objeto final empaquetado
    const fullLicense = {
      ...licensePayload,
      signature
    };

    // Forzar la descarga del archivo plano saare.lic en UTF-8
    const jsonString = JSON.stringify(fullLicense, null, 2);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="saare.lic"');
    
    return res.status(200).send(jsonString);

  } catch (error: any) {
    return res.status(500).json({
      error: "Error interno al firmar la licencia S.A.A.R.E.",
      details: error.message
    });
  }
}