import JSZip from 'jszip';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Cabeceras CORS globales para permitir conexiones desde tu consola frontend
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Endpoint: Descarga de la Extensión Tokenizada (.zip)
    if (path === "/v1/download-extension" || path.includes("download-extension")) {
      const token = url.searchParams.get("token") || "SAARE-EXT-7789-X892-L7";
      const user = url.searchParams.get("user") || "alfonsoterritoriohostil@gmail.com";
      const tenant = url.searchParams.get("tenant") || "GMAIL";

      try {
        const zip = new JSZip();

        // Manifest V3
        const manifest = {
          "manifest_version": 3,
          "name": "SAARE Execution Authorization Sensor",
          "version": "10.0.5",
          "description": "AI Execution Authorization Infrastructure (SGP 1.0) · SAARE VERDICT™ & Bóveda KV",
          "background": {
            "service_worker": "background.js",
            "type": "module"
          },
          "action": {
            "default_title": "SAARE Execution Guard Node (Bóveda KV Active)",
            "default_popup": "popup.html"
          },
          "content_scripts": [
            {
              "matches": [
                "https://gemini.google.com/*",
                "https://chatgpt.com/*",
                "https://chat.openai.com/*",
                "https://claude.ai/*",
                "https://copilot.microsoft.com/*",
                "https://chat.deepseek.com/*",
                "https://www.perplexity.ai/*"
              ],
              "js": ["content.js"],
              "run_at": "document_start"
            }
          ],
          "web_accessible_resources": [
            {
              "resources": ["inject.js"],
              "matches": [
                "https://gemini.google.com/*",
                "https://chatgpt.com/*",
                "https://chat.openai.com/*",
                "https://claude.ai/*",
                "https://copilot.microsoft.com/*",
                "https://chat.deepseek.com/*",
                "https://www.perplexity.ai/*"
              ]
            }
          ],
          "permissions": ["storage", "alarms", "action", "downloads"]
        };

        // Ficheros inyectados con el token del usuario
        const configJs = `// SAARE Token & User Configuration\nwindow.SAARE_CONFIG = {\n  TOKEN: "${token}",\n  USER_EMAIL: "${user}",\n  TENANT: "${tenant}",\n  ENDPOINT: "https://api.saare.es/v1/telemetry"\n};`;

        const backgroundJs = `importScripts('config.js');\nconsole.log('[SAARE Sensor] Initialized with token:', window.SAARE_CONFIG?.TOKEN);`;

        const contentJs = `console.log('[SAARE L7 Hook] Extension active for user:', '${user}');`;
        
        const popupHtml = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <style>\n    body { font-family: sans-serif; background: #030712; color: #fff; width: 280px; padding: 12px; }\n    .status { color: #10b981; font-weight: bold; }\n    .token { font-family: monospace; color: #38bdf8; word-break: break-all; }\n  </style>\n</head>\n<body>\n  <h3>SAARE Execution Guard</h3>\n  <p>Estado: <span class="status">PROTEGIDO</span></p>\n  <p>Token: <br><span class="token">${token}</span></p>\n  <p>Usuario: <br><span>${user}</span></p>\n</body>\n</html>`;

        zip.file("manifest.json", JSON.stringify(manifest, null, 2));
        zip.file("config.js", configJs);
        zip.file("background.js", backgroundJs);
        zip.file("content.js", contentJs);
        zip.file("inject.js", "// SAARE Inject L7 Hook Script\n");
        zip.file("popup.html", popupHtml);

        const zipContent = await zip.generateAsync({ type: "uint8array" });

        return new Response(zipContent, {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="saare-agente-tokenizado-${token}.zip"`
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 2. Endpoint: Telemetría de la Extensión
    if (path === "/v1/telemetry") {
      const user = url.searchParams.get("user") || "alfonsoterritoriohostil@gmail.com";
      const telemetryData = {
        status: "ONLINE",
        vault: "VERIFIED_TAMPER_EVIDENT",
        user: user,
        timestamp: new Date().toISOString(),
        evidences: [
          {
            id: "EV-L7-201",
            time: new Date().toLocaleTimeString(),
            cat: "PII_DETECTED",
            sub: "LOPDGDD / AI Act",
            prompt: "\"Monitoreo activo de Cloudflare Worker\"",
            dictamen: "RECHAZADO",
            type: "PRIVACIDAD"
          }
        ]
      };
      return new Response(JSON.stringify(telemetryData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Respuesta por defecto del Worker
    return new Response("S.A.A.R.E. Cloudflare Worker Gateway Operational", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" }
    });
  }
};