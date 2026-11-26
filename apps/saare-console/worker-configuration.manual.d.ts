// Runtime environment types for Cloudflare Workers/Pages bindings and Vite env vars.
// Regenerate base bindings with: npx wrangler types

interface Env {
  VITE_SAARE_SPEC_VERSION: string;
  VITE_SGP_PROTOCOL_VERSION: string;
  VITE_CONTROL_PLANE_URL: string;
  VITE_API_BASE_URL: string;
  VITE_DEFAULT_ORGANISMO_ID: string;
  VITE_DEFAULT_EXPEDIENTE_ID: string;
  VITE_DEFAULT_USUARIO_EMAIL: string;
  VITE_DEFAULT_USUARIO_ROL: string;
  VITE_DEFAULT_EXPEDIENTE_TITULO: string;
  VITE_DEFAULT_EXPEDIENTE_SUBTIPO: string;
}

declare namespace Cloudflare {
  interface Env extends globalThis.Env {}
}

interface ImportMetaEnv {
  readonly VITE_SAARE_SPEC_VERSION: string;
  readonly VITE_SGP_PROTOCOL_VERSION: string;
  readonly VITE_CONTROL_PLANE_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEFAULT_ORGANISMO_ID: string;
  readonly VITE_DEFAULT_EXPEDIENTE_ID: string;
  readonly VITE_DEFAULT_USUARIO_EMAIL: string;
  readonly VITE_DEFAULT_USUARIO_ROL: string;
  readonly VITE_DEFAULT_EXPEDIENTE_TITULO: string;
  readonly VITE_DEFAULT_EXPEDIENTE_SUBTIPO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv extends globalThis.Env {}
}