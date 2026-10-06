import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Rutas base del espacio de trabajo en la Monorepo
const WORKSPACE_DIR = process.cwd();
const CORE_DIR = path.join(WORKSPACE_DIR, '01_CORE_MÁSTER');
const FABRICA_DIR = path.join(WORKSPACE_DIR, '02_FÁBRICA_LICENCIAS');
const HISTORICO_DIR = path.join(FABRICA_DIR, 'LICENCIAS CONCEDIDAS');
const CLIENTES_DIR = path.join(WORKSPACE_DIR, '03_DESPLIEGUES_CLIENTES');

/**
 * Genera el paquete de despacho estanco para el cliente
 */
async function crearDespacho(nombreCliente, esTrial = true) {
  const clienteClean = nombreCliente.trim().toUpperCase().replace(/\s+/g, '_');
  const tipo = esTrial ? 'TRIAL_7DIAS' : 'ENTERPRISE';
  const folderName = `CLIENTE_${clienteClean}_${tipo}`;
  const targetDir = path.join(CLIENTES_DIR, folderName);

  if (fs.existsSync(targetDir)) {
    console.error(`\n⚠️ La carpeta "${folderName}" ya existe en 03_DESPLIEGUES_CLIENTES. Operación cancelada para evitar sobrescrituras.`);
    return;
  }

  // 1. Crear directorios necesarios
  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(HISTORICO_DIR, { recursive: true });

  // 2. Copiar archivos inalterables del Core Máster
  const archivosCore = ['app_nodo.py', 'saare_framework.py', 'dashboard_ui.py'];
  for (const archivo of archivosCore) {
    const srcPath = path.join(CORE_DIR, archivo);
    const destPath = path.join(targetDir, archivo);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    } else {
      console.warn(`⚠️ Advertencia: No se encontró "${archivo}" en "${CORE_DIR}". Si usas la versión máster, asegúrate de haberlo creado.`);
    }
  }

  // 3. Generar config.env
  const configContent = `# S.A.A.R.E. Configuración de Nodo Cliente
SAARE_CLIENT_NAME=${clienteClean}
SAARE_NODE_MODE=${tipo}
SAARE_CONTROL_PLANE_URL=https://api.saare.es
`;
  fs.writeFileSync(path.join(targetDir, 'config.env'), configContent, 'utf-8');

  // 4. Generar Licencia saare.lic
  const fechaEmision = new Date();
  const fechaExpiracion = esTrial
    ? new Date(fechaEmision.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : 'PERPETUAL_LICENSE';

  const licenciaContent = `# S.A.A.R.E. LICENSE CERTIFICATE
Issued-To: ${clienteClean}
Type: ${tipo}
Issued-At: ${fechaEmision.toISOString().split('T')[0]}
Expires-At: ${fechaExpiracion}
Trust-Anchor: SAARE-MD-IPRES-2026
`;

  // Licencia en la carpeta del cliente
  fs.writeFileSync(path.join(targetDir, 'saare.lic'), licenciaContent, 'utf-8');

  // Copia de respaldo en el histórico
  const timeStampHist = fechaEmision.toISOString().replace(/[-T:]/g, '').slice(0, 8);
  const historicoLicPath = path.join(HISTORICO_DIR, `${clienteClean}_${tipo}_${timeStampHist}.lic`);
  fs.writeFileSync(historicoLicPath, licenciaContent, 'utf-8');

  // 5. Generar lanzador ejecutable inicializar_nodo.bat
  const batContent = `@echo off
echo ===================================================
echo Iniciando Nodo S.A.A.R.E. L7 - ${clienteClean}
echo Mode: ${tipo}
echo ===================================================
python app_nodo.py
pause
`;
  fs.writeFileSync(path.join(targetDir, 'inicializar_nodo.bat'), batContent, 'utf-8');

  // 6. Generar README.txt
  const readmeContent = `S.A.A.R.E. Client Node Deployment
----------------------------------
Cliente: ${clienteClean}
Tipo Licencia: ${tipo}
Expiración: ${fechaExpiracion}
Servidor Control Plane: https://api.saare.es

Instrucciones de Integración:
1. Asegúrese de tener Python 3.10+ instalado con las dependencias del proyecto.
2. Ejecute 'inicializar_nodo.bat' para iniciar la inspección perimetral L7.
`;
  fs.writeFileSync(path.join(targetDir, 'README.txt'), readmeContent, 'utf-8');

  console.log(`\n✅ ¡DESPACHO CREADO CON ÉXITO!`);
  console.log(` 📂 Carpeta Cliente: ${targetDir}`);
  console.log(` 🔑 Licencia Registrada: ${historicoLicPath}\n`);
}

// Ejecución interactiva desde terminal CLI
async function main() {
  const rl = readline.createInterface({ input, output });

  console.log(`\n📦 S.A.A.R.E. Enterprise — Generador Automático de Despacho Cliente`);
  console.log(`------------------------------------------------------------------`);

  try {
    const cliente = await rl.question('🏢 Nombre de la empresa cliente: ');
    if (!cliente.trim()) {
      console.log('❌ El nombre del cliente no puede estar vacío.');
      rl.close();
      return;
    }

    const esTrialAns = await rl.question('🧪 ¿Es una prueba TRIAL de 7 días? (S/n): ');
    const esTrial = esTrialAns.trim().toLowerCase() !== 'n';

    await crearDespacho(cliente, esTrial);
  } catch (err) {
    console.error('❌ Error generando despacho:', err);
  } finally {
    rl.close();
  }
}

main();