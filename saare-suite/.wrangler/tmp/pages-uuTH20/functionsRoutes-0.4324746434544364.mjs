import { onRequestPost as __v1_chat_completions_js_onRequestPost } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\v1\\chat\\completions.js"
import { onRequest as __api_engineer_config_js_onRequest } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\engineer\\config.js"
import { onRequest as __api_v1_leads_ts_onRequest } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\v1\\leads.ts"
import { onRequestOptions as __api_checkout_js_onRequestOptions } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\checkout.js"
import { onRequestPost as __api_checkout_js_onRequestPost } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\checkout.js"
import { onRequestGet as __api_deployments_js_onRequestGet } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\deployments.js"
import { onRequestPost as __api_deployments_js_onRequestPost } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\deployments.js"
import { onRequestOptions as __api_lead_js_onRequestOptions } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\lead.js"
import { onRequestPost as __api_lead_js_onRequestPost } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\lead.js"
import { onRequest as __api_license_ts_onRequest } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\license.ts"
import { onRequest as __api_middleware_js_onRequest } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\middleware.js"
import { onRequest as ___middleware_js_onRequest } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/v1/chat/completions",
      mountPath: "/v1/chat",
      method: "POST",
      middlewares: [],
      modules: [__v1_chat_completions_js_onRequestPost],
    },
  {
      routePath: "/api/engineer/config",
      mountPath: "/api/engineer",
      method: "",
      middlewares: [],
      modules: [__api_engineer_config_js_onRequest],
    },
  {
      routePath: "/api/v1/leads",
      mountPath: "/api/v1",
      method: "",
      middlewares: [],
      modules: [__api_v1_leads_ts_onRequest],
    },
  {
      routePath: "/api/checkout",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_checkout_js_onRequestOptions],
    },
  {
      routePath: "/api/checkout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_js_onRequestPost],
    },
  {
      routePath: "/api/deployments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_deployments_js_onRequestGet],
    },
  {
      routePath: "/api/deployments",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_deployments_js_onRequestPost],
    },
  {
      routePath: "/api/lead",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_lead_js_onRequestOptions],
    },
  {
      routePath: "/api/lead",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_lead_js_onRequestPost],
    },
  {
      routePath: "/api/license",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_license_ts_onRequest],
    },
  {
      routePath: "/api/middleware",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_middleware_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]