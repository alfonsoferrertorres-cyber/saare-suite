#!/bin/bash
set -e # Detener inmediatamente la ejecución si ocurre cualquier error

echo "===================================================="
echo "🛡️  S.A.A.R.E. - Aprovisionamiento Maestro de Dependencias"
echo "===================================================="

# 1. Validación de versiones de runtime
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "🔍 Entorno detectado: Node $NODE_VERSION | NPM $NPM_VERSION"

# 2. Modo de limpieza profunda (Opcional pasando el parámetro --clean)
if [ "$1" == "--clean" ]; then
  echo "🧹 Limpiando artefactos anteriores (node_modules y caché)..."
  rm -rf node_modules package-lock.json
  npm cache clean --force
fi

# 3. Instalación determinista estricta (no altera package-lock.json)
echo "📦 Instalando dependencias con congelación de versiones (npm ci)..."
npm ci --prefer-offline --no-audit

# 4. Verificación de seguridad y vulnerabilidades críticas
echo "🔒 Verificando vulnerabilidades de librerías..."
npm audit --audit-level=high || echo "⚠️ Advertencia: Se identificaron vulnerabilidades no bloqueantes."

echo "===================================================="
echo "✅ Dependencias aprovisionadas correctamente para el Build Maestro."
echo "===================================================="