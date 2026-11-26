/// <reference types="vite/client" />

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