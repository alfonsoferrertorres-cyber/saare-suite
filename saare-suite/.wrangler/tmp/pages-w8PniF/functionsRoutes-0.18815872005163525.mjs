import { onRequestPost as __v1_chat_completions_js_onRequestPost } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\v1\\chat\\completions.js"
import { onRequest as __api_v1_leads_ts_onRequest } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\v1\\leads.ts"
import { onRequestOptions as __api_checkout_js_onRequestOptions } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\checkout.js"
import { onRequestPost as __api_checkout_js_onRequestPost } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\checkout.js"
import { onRequest as __api_license_ts_onRequest } from "C:\\Users\\alfon\\Desktop\\CLOUD_ISV_DESARROLLO_AGOSTO\\saare-suite\\functions\\api\\license.ts"

export const routes = [
    {
      routePath: "/v1/chat/completions",
      mountPath: "/v1/chat",
      method: "POST",
      middlewares: [],
      modules: [__v1_chat_completions_js_onRequestPost],
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
      routePath: "/api/license",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_license_ts_onRequest],
    },
  ]