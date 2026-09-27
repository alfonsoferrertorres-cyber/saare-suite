cd C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO\saare-suite

# 1. Compilar el proyecto con Vite
pnpm run build

# 2. Desplegar a Cloudflare Pages
npx wrangler pages deploy dist --project-name=saare-suite --commit-dirty=true