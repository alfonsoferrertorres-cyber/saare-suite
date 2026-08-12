var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// v1/chat/completions.js
async function onRequestPost(context) {
  const scenario = context.request.headers.get("X-SAARE-Scenario") || "eu_ai_act_es";
  return new Response(JSON.stringify({
    id: "chatcmpl-saare-l7",
    object: "chat.completion",
    created: Math.floor(Date.now() / 1e3),
    model: "saare-engine-rust",
    choices: [{ index: 0, message: { role: "assistant", content: "[S.A.A.R.E. L7 Edge] DNI Anonimizado en RAM." } }]
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-SAARE-Node": "saare-edge-eu-west",
      "X-SAARE-Scenario-Active": scenario,
      "X-SAARE-Action": "ANONIMIZED_IN_RAM",
      "X-SAARE-DualVault-Sync": "LOCAL_AND_CLOUD",
      "X-SAARE-Receipt-Ed25519": "e2f589a1c9d811e4f32a0"
    }
  });
}
var init_completions = __esm({
  "v1/chat/completions.js"() {
    init_functionsRoutes_0_35428525275895484();
    __name(onRequestPost, "onRequestPost");
  }
});

// api/engineer/config.js
async function onRequest(context) {
  return new Response(
    JSON.stringify({
      status: "SUCCESS",
      system: "S.A.A.R.E. Engine",
      mode: "ENGINEERING_ACTIVE",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
var init_config = __esm({
  "api/engineer/config.js"() {
    init_functionsRoutes_0_35428525275895484();
    __name(onRequest, "onRequest");
  }
});

// api/v1/leads.ts
async function onRequest2(context) {
  const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = await context.request.json();
    const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${context.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "SAARE Platform <onboarding@saare.es>", to: ["alfonsosb1@gmail.com"], subject: `[Discovery Request] ${body.name || body.company || "Nuevo Lead"}`, html: `<p><strong>Nombre:</strong> ${body.name || body.fullName}</p><p><strong>Email de contacto:</strong> ${body.email || body.corporateEmail}</p><p><strong>Empresa:</strong> ${body.company}</p>` }) });
    const resData = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: resData }), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ success: true, resendResponse: resData }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
var init_leads = __esm({
  "api/v1/leads.ts"() {
    init_functionsRoutes_0_35428525275895484();
    __name(onRequest2, "onRequest");
  }
});

// ../node_modules/stripe/esm/net/HttpClient.js
var HttpClient, HttpClientResponse;
var init_HttpClient = __esm({
  "../node_modules/stripe/esm/net/HttpClient.js"() {
    init_functionsRoutes_0_35428525275895484();
    HttpClient = class _HttpClient {
      static {
        __name(this, "HttpClient");
      }
      /** The client name used for diagnostics. */
      getClientName() {
        throw new Error("getClientName not implemented.");
      }
      makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
        throw new Error("makeRequest not implemented.");
      }
      /** Helper to make a consistent timeout error across implementations. */
      static makeTimeoutError() {
        const timeoutErr = new TypeError(_HttpClient.TIMEOUT_ERROR_CODE);
        timeoutErr.code = _HttpClient.TIMEOUT_ERROR_CODE;
        return timeoutErr;
      }
    };
    HttpClient.CONNECTION_CLOSED_ERROR_CODES = ["ECONNRESET", "EPIPE"];
    HttpClient.TIMEOUT_ERROR_CODE = "ETIMEDOUT";
    HttpClientResponse = class {
      static {
        __name(this, "HttpClientResponse");
      }
      constructor(statusCode, headers) {
        this._statusCode = statusCode;
        this._headers = headers;
      }
      getStatusCode() {
        return this._statusCode;
      }
      getHeaders() {
        return this._headers;
      }
      getRawResponse() {
        throw new Error("getRawResponse not implemented.");
      }
      toStream(streamCompleteCallback) {
        throw new Error("toStream not implemented.");
      }
      toJSON() {
        throw new Error("toJSON not implemented.");
      }
    };
  }
});

// ../node_modules/stripe/esm/net/FetchHttpClient.js
var FetchHttpClient, FetchHttpClientResponse;
var init_FetchHttpClient = __esm({
  "../node_modules/stripe/esm/net/FetchHttpClient.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_HttpClient();
    FetchHttpClient = class _FetchHttpClient extends HttpClient {
      static {
        __name(this, "FetchHttpClient");
      }
      constructor(fetchFn) {
        super();
        if (!fetchFn) {
          if (!globalThis.fetch) {
            throw new Error("fetch() function not provided and is not defined in the global scope. You must provide a fetch implementation.");
          }
          fetchFn = globalThis.fetch;
        }
        if (globalThis.AbortController) {
          this._fetchFn = _FetchHttpClient.makeFetchWithAbortTimeout(fetchFn);
        } else {
          this._fetchFn = _FetchHttpClient.makeFetchWithRaceTimeout(fetchFn);
        }
      }
      static makeFetchWithRaceTimeout(fetchFn) {
        return (url, init, timeout) => {
          let pendingTimeoutId;
          const timeoutPromise = new Promise((_, reject) => {
            pendingTimeoutId = setTimeout(() => {
              pendingTimeoutId = null;
              reject(HttpClient.makeTimeoutError());
            }, timeout);
          });
          const fetchPromise = fetchFn(url, init);
          return Promise.race([fetchPromise, timeoutPromise]).finally(() => {
            if (pendingTimeoutId) {
              clearTimeout(pendingTimeoutId);
            }
          });
        };
      }
      static makeFetchWithAbortTimeout(fetchFn) {
        return async (url, init, timeout) => {
          const abort = new AbortController();
          let timeoutId = setTimeout(() => {
            timeoutId = null;
            abort.abort(HttpClient.makeTimeoutError());
          }, timeout);
          try {
            return await fetchFn(url, Object.assign(Object.assign({}, init), { signal: abort.signal }));
          } catch (err) {
            if (err.name === "AbortError") {
              throw HttpClient.makeTimeoutError();
            } else {
              throw err;
            }
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
        };
      }
      /** @override. */
      getClientName() {
        return "fetch";
      }
      async makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
        const isInsecureConnection = protocol === "http";
        const url = new URL(path, `${isInsecureConnection ? "http" : "https"}://${host}`);
        url.port = port;
        const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
        const body = requestData || (methodHasPayload ? "" : void 0);
        const res = await this._fetchFn(url.toString(), {
          method,
          // @ts-ignore
          headers,
          // @ts-ignore
          body
        }, timeout);
        return new FetchHttpClientResponse(res);
      }
    };
    FetchHttpClientResponse = class _FetchHttpClientResponse extends HttpClientResponse {
      static {
        __name(this, "FetchHttpClientResponse");
      }
      constructor(res) {
        super(res.status, _FetchHttpClientResponse._transformHeadersToObject(res.headers));
        this._res = res;
      }
      getRawResponse() {
        return this._res;
      }
      toStream(streamCompleteCallback) {
        streamCompleteCallback();
        return this._res.body;
      }
      toJSON() {
        return this._res.json();
      }
      static _transformHeadersToObject(headers) {
        const headersObj = {};
        for (const entry of headers) {
          if (!Array.isArray(entry) || entry.length != 2) {
            throw new Error("Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.");
          }
          headersObj[entry[0]] = entry[1];
        }
        return headersObj;
      }
    };
  }
});

// ../node_modules/stripe/esm/crypto/CryptoProvider.js
var CryptoProvider, CryptoProviderOnlySupportsAsyncError;
var init_CryptoProvider = __esm({
  "../node_modules/stripe/esm/crypto/CryptoProvider.js"() {
    init_functionsRoutes_0_35428525275895484();
    CryptoProvider = class {
      static {
        __name(this, "CryptoProvider");
      }
      /**
       * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
       * The output HMAC should be encoded in hexadecimal.
       *
       * Sample values for implementations:
       * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
       * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
       */
      computeHMACSignature(payload, secret) {
        throw new Error("computeHMACSignature not implemented.");
      }
      /**
       * Asynchronous version of `computeHMACSignature`. Some implementations may
       * only allow support async signature computation.
       *
       * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
       * The output HMAC should be encoded in hexadecimal.
       *
       * Sample values for implementations:
       * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
       * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
       */
      computeHMACSignatureAsync(payload, secret) {
        throw new Error("computeHMACSignatureAsync not implemented.");
      }
    };
    CryptoProviderOnlySupportsAsyncError = class extends Error {
      static {
        __name(this, "CryptoProviderOnlySupportsAsyncError");
      }
    };
  }
});

// ../node_modules/stripe/esm/crypto/SubtleCryptoProvider.js
var SubtleCryptoProvider, byteHexMapping;
var init_SubtleCryptoProvider = __esm({
  "../node_modules/stripe/esm/crypto/SubtleCryptoProvider.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_CryptoProvider();
    SubtleCryptoProvider = class extends CryptoProvider {
      static {
        __name(this, "SubtleCryptoProvider");
      }
      constructor(subtleCrypto) {
        super();
        this.subtleCrypto = subtleCrypto || crypto.subtle;
      }
      /** @override */
      computeHMACSignature(payload, secret) {
        throw new CryptoProviderOnlySupportsAsyncError("SubtleCryptoProvider cannot be used in a synchronous context.");
      }
      /** @override */
      async computeHMACSignatureAsync(payload, secret) {
        const encoder = new TextEncoder();
        const key = await this.subtleCrypto.importKey("raw", encoder.encode(secret), {
          name: "HMAC",
          hash: { name: "SHA-256" }
        }, false, ["sign"]);
        const signatureBuffer = await this.subtleCrypto.sign("hmac", key, encoder.encode(payload));
        const signatureBytes = new Uint8Array(signatureBuffer);
        const signatureHexCodes = new Array(signatureBytes.length);
        for (let i = 0; i < signatureBytes.length; i++) {
          signatureHexCodes[i] = byteHexMapping[signatureBytes[i]];
        }
        return signatureHexCodes.join("");
      }
    };
    byteHexMapping = new Array(256);
    for (let i = 0; i < byteHexMapping.length; i++) {
      byteHexMapping[i] = i.toString(16).padStart(2, "0");
    }
  }
});

// ../node_modules/stripe/esm/platform/PlatformFunctions.js
var PlatformFunctions;
var init_PlatformFunctions = __esm({
  "../node_modules/stripe/esm/platform/PlatformFunctions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_FetchHttpClient();
    init_SubtleCryptoProvider();
    PlatformFunctions = class {
      static {
        __name(this, "PlatformFunctions");
      }
      constructor() {
        this._fetchFn = null;
        this._agent = null;
      }
      /**
       * Gets uname with Node's built-in `exec` function, if available.
       */
      getUname() {
        throw new Error("getUname not implemented.");
      }
      /**
       * Generates a v4 UUID. See https://stackoverflow.com/a/2117523
       */
      uuid4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === "x" ? r : r & 3 | 8;
          return v.toString(16);
        });
      }
      /**
       * Compares strings in constant time.
       */
      secureCompare(a, b) {
        if (a.length !== b.length) {
          return false;
        }
        const len = a.length;
        let result = 0;
        for (let i = 0; i < len; ++i) {
          result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
      }
      /**
       * Creates an event emitter.
       */
      createEmitter() {
        throw new Error("createEmitter not implemented.");
      }
      /**
       * Checks if the request data is a stream. If so, read the entire stream
       * to a buffer and return the buffer.
       */
      tryBufferData(data) {
        throw new Error("tryBufferData not implemented.");
      }
      /**
       * Creates an HTTP client which uses the Node `http` and `https` packages
       * to issue requests.
       */
      createNodeHttpClient(agent) {
        throw new Error("createNodeHttpClient not implemented.");
      }
      /**
       * Creates an HTTP client for issuing Stripe API requests which uses the Web
       * Fetch API.
       *
       * A fetch function can optionally be passed in as a parameter. If none is
       * passed, will default to the default `fetch` function in the global scope.
       */
      createFetchHttpClient(fetchFn) {
        return new FetchHttpClient(fetchFn);
      }
      /**
       * Creates an HTTP client using runtime-specific APIs.
       */
      createDefaultHttpClient() {
        throw new Error("createDefaultHttpClient not implemented.");
      }
      /**
       * Creates a CryptoProvider which uses the Node `crypto` package for its computations.
       */
      createNodeCryptoProvider() {
        throw new Error("createNodeCryptoProvider not implemented.");
      }
      /**
       * Creates a CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
       */
      createSubtleCryptoProvider(subtleCrypto) {
        return new SubtleCryptoProvider(subtleCrypto);
      }
      createDefaultCryptoProvider() {
        throw new Error("createDefaultCryptoProvider not implemented.");
      }
    };
  }
});

// ../node_modules/stripe/esm/StripeEmitter.js
var _StripeEvent, StripeEmitter;
var init_StripeEmitter = __esm({
  "../node_modules/stripe/esm/StripeEmitter.js"() {
    init_functionsRoutes_0_35428525275895484();
    _StripeEvent = class extends Event {
      static {
        __name(this, "_StripeEvent");
      }
      constructor(eventName, data) {
        super(eventName);
        this.data = data;
      }
    };
    StripeEmitter = class {
      static {
        __name(this, "StripeEmitter");
      }
      constructor() {
        this.eventTarget = new EventTarget();
        this.listenerMapping = /* @__PURE__ */ new Map();
      }
      on(eventName, listener) {
        const listenerWrapper = /* @__PURE__ */ __name((event) => {
          listener(event.data);
        }, "listenerWrapper");
        this.listenerMapping.set(listener, listenerWrapper);
        return this.eventTarget.addEventListener(eventName, listenerWrapper);
      }
      removeListener(eventName, listener) {
        const listenerWrapper = this.listenerMapping.get(listener);
        this.listenerMapping.delete(listener);
        return this.eventTarget.removeEventListener(eventName, listenerWrapper);
      }
      once(eventName, listener) {
        const listenerWrapper = /* @__PURE__ */ __name((event) => {
          listener(event.data);
        }, "listenerWrapper");
        this.listenerMapping.set(listener, listenerWrapper);
        return this.eventTarget.addEventListener(eventName, listenerWrapper, {
          once: true
        });
      }
      emit(eventName, data) {
        return this.eventTarget.dispatchEvent(new _StripeEvent(eventName, data));
      }
    };
  }
});

// ../node_modules/stripe/esm/platform/WebPlatformFunctions.js
var WebPlatformFunctions;
var init_WebPlatformFunctions = __esm({
  "../node_modules/stripe/esm/platform/WebPlatformFunctions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_PlatformFunctions();
    init_StripeEmitter();
    WebPlatformFunctions = class extends PlatformFunctions {
      static {
        __name(this, "WebPlatformFunctions");
      }
      /** @override */
      getUname() {
        return Promise.resolve(null);
      }
      /** @override */
      createEmitter() {
        return new StripeEmitter();
      }
      /** @override */
      tryBufferData(data) {
        if (data.file.data instanceof ReadableStream) {
          throw new Error("Uploading a file as a stream is not supported in non-Node environments. Please open or upvote an issue at github.com/stripe/stripe-node if you use this, detailing your use-case.");
        }
        return Promise.resolve(data);
      }
      /** @override */
      createNodeHttpClient() {
        throw new Error("Stripe: `createNodeHttpClient()` is not available in non-Node environments. Please use `createFetchHttpClient()` instead.");
      }
      /** @override */
      createDefaultHttpClient() {
        return super.createFetchHttpClient();
      }
      /** @override */
      createNodeCryptoProvider() {
        throw new Error("Stripe: `createNodeCryptoProvider()` is not available in non-Node environments. Please use `createSubtleCryptoProvider()` instead.");
      }
      /** @override */
      createDefaultCryptoProvider() {
        return this.createSubtleCryptoProvider();
      }
    };
  }
});

// ../node_modules/stripe/esm/Error.js
var Error_exports = {};
__export(Error_exports, {
  StripeAPIError: () => StripeAPIError,
  StripeAuthenticationError: () => StripeAuthenticationError,
  StripeCardError: () => StripeCardError,
  StripeConnectionError: () => StripeConnectionError,
  StripeError: () => StripeError,
  StripeIdempotencyError: () => StripeIdempotencyError,
  StripeInvalidGrantError: () => StripeInvalidGrantError,
  StripeInvalidRequestError: () => StripeInvalidRequestError,
  StripePermissionError: () => StripePermissionError,
  StripeRateLimitError: () => StripeRateLimitError,
  StripeSignatureVerificationError: () => StripeSignatureVerificationError,
  StripeUnknownError: () => StripeUnknownError,
  generate: () => generate
});
var generate, StripeError, StripeCardError, StripeInvalidRequestError, StripeAPIError, StripeAuthenticationError, StripePermissionError, StripeRateLimitError, StripeConnectionError, StripeSignatureVerificationError, StripeIdempotencyError, StripeInvalidGrantError, StripeUnknownError;
var init_Error = __esm({
  "../node_modules/stripe/esm/Error.js"() {
    init_functionsRoutes_0_35428525275895484();
    generate = /* @__PURE__ */ __name((rawStripeError) => {
      switch (rawStripeError.type) {
        case "card_error":
          return new StripeCardError(rawStripeError);
        case "invalid_request_error":
          return new StripeInvalidRequestError(rawStripeError);
        case "api_error":
          return new StripeAPIError(rawStripeError);
        case "authentication_error":
          return new StripeAuthenticationError(rawStripeError);
        case "rate_limit_error":
          return new StripeRateLimitError(rawStripeError);
        case "idempotency_error":
          return new StripeIdempotencyError(rawStripeError);
        case "invalid_grant":
          return new StripeInvalidGrantError(rawStripeError);
        default:
          return new StripeUnknownError(rawStripeError);
      }
    }, "generate");
    StripeError = class extends Error {
      static {
        __name(this, "StripeError");
      }
      constructor(raw = {}, type = null) {
        super(raw.message);
        this.type = type || this.constructor.name;
        this.raw = raw;
        this.rawType = raw.type;
        this.code = raw.code;
        this.doc_url = raw.doc_url;
        this.param = raw.param;
        this.detail = raw.detail;
        this.headers = raw.headers;
        this.requestId = raw.requestId;
        this.statusCode = raw.statusCode;
        this.message = raw.message;
        this.charge = raw.charge;
        this.decline_code = raw.decline_code;
        this.payment_intent = raw.payment_intent;
        this.payment_method = raw.payment_method;
        this.payment_method_type = raw.payment_method_type;
        this.setup_intent = raw.setup_intent;
        this.source = raw.source;
      }
    };
    StripeError.generate = generate;
    StripeCardError = class extends StripeError {
      static {
        __name(this, "StripeCardError");
      }
      constructor(raw = {}) {
        super(raw, "StripeCardError");
      }
    };
    StripeInvalidRequestError = class extends StripeError {
      static {
        __name(this, "StripeInvalidRequestError");
      }
      constructor(raw = {}) {
        super(raw, "StripeInvalidRequestError");
      }
    };
    StripeAPIError = class extends StripeError {
      static {
        __name(this, "StripeAPIError");
      }
      constructor(raw = {}) {
        super(raw, "StripeAPIError");
      }
    };
    StripeAuthenticationError = class extends StripeError {
      static {
        __name(this, "StripeAuthenticationError");
      }
      constructor(raw = {}) {
        super(raw, "StripeAuthenticationError");
      }
    };
    StripePermissionError = class extends StripeError {
      static {
        __name(this, "StripePermissionError");
      }
      constructor(raw = {}) {
        super(raw, "StripePermissionError");
      }
    };
    StripeRateLimitError = class extends StripeError {
      static {
        __name(this, "StripeRateLimitError");
      }
      constructor(raw = {}) {
        super(raw, "StripeRateLimitError");
      }
    };
    StripeConnectionError = class extends StripeError {
      static {
        __name(this, "StripeConnectionError");
      }
      constructor(raw = {}) {
        super(raw, "StripeConnectionError");
      }
    };
    StripeSignatureVerificationError = class extends StripeError {
      static {
        __name(this, "StripeSignatureVerificationError");
      }
      constructor(header, payload, raw = {}) {
        super(raw, "StripeSignatureVerificationError");
        this.header = header;
        this.payload = payload;
      }
    };
    StripeIdempotencyError = class extends StripeError {
      static {
        __name(this, "StripeIdempotencyError");
      }
      constructor(raw = {}) {
        super(raw, "StripeIdempotencyError");
      }
    };
    StripeInvalidGrantError = class extends StripeError {
      static {
        __name(this, "StripeInvalidGrantError");
      }
      constructor(raw = {}) {
        super(raw, "StripeInvalidGrantError");
      }
    };
    StripeUnknownError = class extends StripeError {
      static {
        __name(this, "StripeUnknownError");
      }
      constructor(raw = {}) {
        super(raw, "StripeUnknownError");
      }
    };
  }
});

// ../node_modules/stripe/esm/apiVersion.js
var ApiVersion;
var init_apiVersion = __esm({
  "../node_modules/stripe/esm/apiVersion.js"() {
    init_functionsRoutes_0_35428525275895484();
    ApiVersion = "2023-10-16";
  }
});

// ../node_modules/stripe/esm/ResourceNamespace.js
function ResourceNamespace(stripe, resources) {
  for (const name in resources) {
    const camelCaseName = name[0].toLowerCase() + name.substring(1);
    const resource = new resources[name](stripe);
    this[camelCaseName] = resource;
  }
}
function resourceNamespace(namespace, resources) {
  return function(stripe) {
    return new ResourceNamespace(stripe, resources);
  };
}
var init_ResourceNamespace = __esm({
  "../node_modules/stripe/esm/ResourceNamespace.js"() {
    init_functionsRoutes_0_35428525275895484();
    __name(ResourceNamespace, "ResourceNamespace");
    __name(resourceNamespace, "resourceNamespace");
  }
});

// ../node_modules/es-errors/type.js
var require_type = __commonJS({
  "../node_modules/es-errors/type.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = TypeError;
  }
});

// (disabled):../node_modules/object-inspect/util.inspect
var require_util = __commonJS({
  "(disabled):../node_modules/object-inspect/util.inspect"() {
    init_functionsRoutes_0_35428525275895484();
  }
});

// ../node_modules/object-inspect/index.js
var require_object_inspect = __commonJS({
  "../node_modules/object-inspect/index.js"(exports, module) {
    init_functionsRoutes_0_35428525275895484();
    var hasMap = typeof Map === "function" && Map.prototype;
    var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
    var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
    var mapForEach = hasMap && Map.prototype.forEach;
    var hasSet = typeof Set === "function" && Set.prototype;
    var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
    var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
    var setForEach = hasSet && Set.prototype.forEach;
    var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
    var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
    var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
    var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
    var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
    var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
    var booleanValueOf = Boolean.prototype.valueOf;
    var objectToString = Object.prototype.toString;
    var functionToString = Function.prototype.toString;
    var $match = String.prototype.match;
    var $slice = String.prototype.slice;
    var $replace = String.prototype.replace;
    var $toUpperCase = String.prototype.toUpperCase;
    var $toLowerCase = String.prototype.toLowerCase;
    var $test = RegExp.prototype.test;
    var $concat = Array.prototype.concat;
    var $join = Array.prototype.join;
    var $arrSlice = Array.prototype.slice;
    var $floor = Math.floor;
    var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
    var gOPS = Object.getOwnPropertySymbols;
    var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
    var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
    var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
      return O.__proto__;
    } : null);
    function addNumericSeparator(num, str) {
      if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
        return str;
      }
      var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
      if (typeof num === "number") {
        var int = num < 0 ? -$floor(-num) : $floor(num);
        if (int !== num) {
          var intStr = String(int);
          var dec = $slice.call(str, intStr.length + 1);
          return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
        }
      }
      return $replace.call(str, sepRegex, "$&_");
    }
    __name(addNumericSeparator, "addNumericSeparator");
    var utilInspect = require_util();
    var inspectCustom = utilInspect.custom;
    var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
    var quotes = {
      __proto__: null,
      "double": '"',
      single: "'"
    };
    var quoteREs = {
      __proto__: null,
      "double": /(["\\])/g,
      single: /(['\\])/g
    };
    module.exports = /* @__PURE__ */ __name(function inspect_(obj, options, depth, seen) {
      var opts = options || {};
      if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
      }
      if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
      }
      var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
      if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
        throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
      }
      if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
      }
      if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
      }
      var numericSeparator = opts.numericSeparator;
      if (typeof obj === "undefined") {
        return "undefined";
      }
      if (obj === null) {
        return "null";
      }
      if (typeof obj === "boolean") {
        return obj ? "true" : "false";
      }
      if (typeof obj === "string") {
        return inspectString(obj, opts);
      }
      if (typeof obj === "number") {
        if (obj === 0) {
          return Infinity / obj > 0 ? "0" : "-0";
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
      }
      if (typeof obj === "bigint") {
        var bigIntStr = String(obj) + "n";
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
      }
      var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
      if (typeof depth === "undefined") {
        depth = 0;
      }
      if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
        return isArray(obj) ? "[Array]" : "[Object]";
      }
      var indent = getIndent(opts, depth);
      if (typeof seen === "undefined") {
        seen = [];
      } else if (indexOf(seen, obj) >= 0) {
        return "[Circular]";
      }
      function inspect(value, from, noIndent) {
        if (from) {
          seen = $arrSlice.call(seen);
          seen.push(from);
        }
        if (noIndent) {
          var newOpts = {
            depth: opts.depth
          };
          if (has(opts, "quoteStyle")) {
            newOpts.quoteStyle = opts.quoteStyle;
          }
          return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
      }
      __name(inspect, "inspect");
      if (typeof obj === "function" && !isRegExp(obj)) {
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
      }
      if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
        return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
      }
      if (isElement(obj)) {
        var s = "<" + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
          s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
        }
        s += ">";
        if (obj.childNodes && obj.childNodes.length) {
          s += "...";
        }
        s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
        return s;
      }
      if (isArray(obj)) {
        if (obj.length === 0) {
          return "[]";
        }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
          return "[" + indentedJoin(xs, indent) + "]";
        }
        return "[ " + $join.call(xs, ", ") + " ]";
      }
      if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
          return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
        }
        if (parts.length === 0) {
          return "[" + String(obj) + "]";
        }
        return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
      }
      if (typeof obj === "object" && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
          return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
          return obj.inspect();
        }
      }
      if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
          mapForEach.call(obj, function(value, key) {
            mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
          });
        }
        return collectionOf("Map", mapSize.call(obj), mapParts, indent);
      }
      if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
          setForEach.call(obj, function(value) {
            setParts.push(inspect(value, obj));
          });
        }
        return collectionOf("Set", setSize.call(obj), setParts, indent);
      }
      if (isWeakMap(obj)) {
        return weakCollectionOf("WeakMap");
      }
      if (isWeakSet(obj)) {
        return weakCollectionOf("WeakSet");
      }
      if (isWeakRef(obj)) {
        return weakCollectionOf("WeakRef");
      }
      if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
      }
      if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
      }
      if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
      }
      if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
      }
      if (typeof window !== "undefined" && obj === window) {
        return "{ [object Window] }";
      }
      if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) {
        return "{ [object globalThis] }";
      }
      if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? "" : "null prototype";
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
        var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
        var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
        if (ys.length === 0) {
          return tag + "{}";
        }
        if (indent) {
          return tag + "{" + indentedJoin(ys, indent) + "}";
        }
        return tag + "{ " + $join.call(ys, ", ") + " }";
      }
      return String(obj);
    }, "inspect_");
    function wrapQuotes(s, defaultStyle, opts) {
      var style = opts.quoteStyle || defaultStyle;
      var quoteChar = quotes[style];
      return quoteChar + s + quoteChar;
    }
    __name(wrapQuotes, "wrapQuotes");
    function quote(s) {
      return $replace.call(String(s), /"/g, "&quot;");
    }
    __name(quote, "quote");
    function canTrustToString(obj) {
      return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
    }
    __name(canTrustToString, "canTrustToString");
    function isArray(obj) {
      return toStr(obj) === "[object Array]" && canTrustToString(obj);
    }
    __name(isArray, "isArray");
    function isDate(obj) {
      return toStr(obj) === "[object Date]" && canTrustToString(obj);
    }
    __name(isDate, "isDate");
    function isRegExp(obj) {
      return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
    }
    __name(isRegExp, "isRegExp");
    function isError(obj) {
      return toStr(obj) === "[object Error]" && canTrustToString(obj);
    }
    __name(isError, "isError");
    function isString(obj) {
      return toStr(obj) === "[object String]" && canTrustToString(obj);
    }
    __name(isString, "isString");
    function isNumber(obj) {
      return toStr(obj) === "[object Number]" && canTrustToString(obj);
    }
    __name(isNumber, "isNumber");
    function isBoolean(obj) {
      return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
    }
    __name(isBoolean, "isBoolean");
    function isSymbol(obj) {
      if (hasShammedSymbols) {
        return obj && typeof obj === "object" && obj instanceof Symbol;
      }
      if (typeof obj === "symbol") {
        return true;
      }
      if (!obj || typeof obj !== "object" || !symToString) {
        return false;
      }
      try {
        symToString.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    __name(isSymbol, "isSymbol");
    function isBigInt(obj) {
      if (!obj || typeof obj !== "object" || !bigIntValueOf) {
        return false;
      }
      try {
        bigIntValueOf.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    __name(isBigInt, "isBigInt");
    var hasOwn = Object.prototype.hasOwnProperty || function(key) {
      return key in this;
    };
    function has(obj, key) {
      return hasOwn.call(obj, key);
    }
    __name(has, "has");
    function toStr(obj) {
      return objectToString.call(obj);
    }
    __name(toStr, "toStr");
    function nameOf(f) {
      if (f.name) {
        return f.name;
      }
      var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
      if (m) {
        return m[1];
      }
      return null;
    }
    __name(nameOf, "nameOf");
    function indexOf(xs, x) {
      if (xs.indexOf) {
        return xs.indexOf(x);
      }
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) {
          return i;
        }
      }
      return -1;
    }
    __name(indexOf, "indexOf");
    function isMap(x) {
      if (!mapSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        mapSize.call(x);
        try {
          setSize.call(x);
        } catch (s) {
          return true;
        }
        return x instanceof Map;
      } catch (e) {
      }
      return false;
    }
    __name(isMap, "isMap");
    function isWeakMap(x) {
      if (!weakMapHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakMapHas.call(x, weakMapHas);
        try {
          weakSetHas.call(x, weakSetHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakMap;
      } catch (e) {
      }
      return false;
    }
    __name(isWeakMap, "isWeakMap");
    function isWeakRef(x) {
      if (!weakRefDeref || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakRefDeref.call(x);
        return true;
      } catch (e) {
      }
      return false;
    }
    __name(isWeakRef, "isWeakRef");
    function isSet(x) {
      if (!setSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        setSize.call(x);
        try {
          mapSize.call(x);
        } catch (m) {
          return true;
        }
        return x instanceof Set;
      } catch (e) {
      }
      return false;
    }
    __name(isSet, "isSet");
    function isWeakSet(x) {
      if (!weakSetHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakSetHas.call(x, weakSetHas);
        try {
          weakMapHas.call(x, weakMapHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakSet;
      } catch (e) {
      }
      return false;
    }
    __name(isWeakSet, "isWeakSet");
    function isElement(x) {
      if (!x || typeof x !== "object") {
        return false;
      }
      if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
        return true;
      }
      return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
    }
    __name(isElement, "isElement");
    function inspectString(str, opts) {
      if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
      }
      var quoteRE = quoteREs[opts.quoteStyle || "single"];
      quoteRE.lastIndex = 0;
      var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
      return wrapQuotes(s, "single", opts);
    }
    __name(inspectString, "inspectString");
    function lowbyte(c) {
      var n = c.charCodeAt(0);
      var x = {
        8: "b",
        9: "t",
        10: "n",
        12: "f",
        13: "r"
      }[n];
      if (x) {
        return "\\" + x;
      }
      return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
    }
    __name(lowbyte, "lowbyte");
    function markBoxed(str) {
      return "Object(" + str + ")";
    }
    __name(markBoxed, "markBoxed");
    function weakCollectionOf(type) {
      return type + " { ? }";
    }
    __name(weakCollectionOf, "weakCollectionOf");
    function collectionOf(type, size, entries, indent) {
      var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
      return type + " (" + size + ") {" + joinedEntries + "}";
    }
    __name(collectionOf, "collectionOf");
    function singleLineValues(xs) {
      for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], "\n") >= 0) {
          return false;
        }
      }
      return true;
    }
    __name(singleLineValues, "singleLineValues");
    function getIndent(opts, depth) {
      var baseIndent;
      if (opts.indent === "	") {
        baseIndent = "	";
      } else if (typeof opts.indent === "number" && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), " ");
      } else {
        return null;
      }
      return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
      };
    }
    __name(getIndent, "getIndent");
    function indentedJoin(xs, indent) {
      if (xs.length === 0) {
        return "";
      }
      var lineJoiner = "\n" + indent.prev + indent.base;
      return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
    }
    __name(indentedJoin, "indentedJoin");
    function arrObjKeys(obj, inspect) {
      var isArr = isArray(obj);
      var xs = [];
      if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
          xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
        }
      }
      var syms = typeof gOPS === "function" ? gOPS(obj) : [];
      var symMap;
      if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
          symMap["$" + syms[k]] = syms[k];
        }
      }
      for (var key in obj) {
        if (!has(obj, key)) {
          continue;
        }
        if (isArr && String(Number(key)) === key && key < obj.length) {
          continue;
        }
        if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
          continue;
        } else if ($test.call(/[^\w$]/, key)) {
          xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
        } else {
          xs.push(key + ": " + inspect(obj[key], obj));
        }
      }
      if (typeof gOPS === "function") {
        for (var j = 0; j < syms.length; j++) {
          if (isEnumerable.call(obj, syms[j])) {
            xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
          }
        }
      }
      return xs;
    }
    __name(arrObjKeys, "arrObjKeys");
  }
});

// ../node_modules/side-channel-list/index.js
var require_side_channel_list = __commonJS({
  "../node_modules/side-channel-list/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var inspect = require_object_inspect();
    var $TypeError = require_type();
    var listGetNode = /* @__PURE__ */ __name(function(list, key, isDelete) {
      var prev = list;
      var curr;
      for (; (curr = prev.next) != null; prev = curr) {
        if (curr.key === key) {
          prev.next = curr.next;
          if (!isDelete) {
            curr.next = /** @type {NonNullable<typeof list.next>} */
            list.next;
            list.next = curr;
          }
          return curr;
        }
      }
    }, "listGetNode");
    var listGet = /* @__PURE__ */ __name(function(objects, key) {
      if (!objects) {
        return void 0;
      }
      var node = listGetNode(objects, key);
      return node && node.value;
    }, "listGet");
    var listSet = /* @__PURE__ */ __name(function(objects, key, value) {
      var node = listGetNode(objects, key);
      if (node) {
        node.value = value;
      } else {
        objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
        {
          // eslint-disable-line no-param-reassign, no-extra-parens
          key,
          next: objects.next,
          value
        };
      }
    }, "listSet");
    var listHas = /* @__PURE__ */ __name(function(objects, key) {
      if (!objects) {
        return false;
      }
      return !!listGetNode(objects, key);
    }, "listHas");
    var listDelete = /* @__PURE__ */ __name(function(objects, key) {
      if (objects) {
        return listGetNode(objects, key, true);
      }
    }, "listDelete");
    module.exports = /* @__PURE__ */ __name(function getSideChannelList() {
      var $o;
      var channel = {
        assert: /* @__PURE__ */ __name(function(key) {
          if (!channel.has(key)) {
            throw new $TypeError("Side channel does not contain " + inspect(key));
          }
        }, "assert"),
        "delete": /* @__PURE__ */ __name(function(key) {
          var deletedNode = listDelete($o, key);
          if (deletedNode && $o && !$o.next) {
            $o = void 0;
          }
          return !!deletedNode;
        }, "delete"),
        get: /* @__PURE__ */ __name(function(key) {
          return listGet($o, key);
        }, "get"),
        has: /* @__PURE__ */ __name(function(key) {
          return listHas($o, key);
        }, "has"),
        set: /* @__PURE__ */ __name(function(key, value) {
          if (!$o) {
            $o = {
              next: void 0
            };
          }
          listSet(
            /** @type {NonNullable<typeof $o>} */
            $o,
            key,
            value
          );
        }, "set")
      };
      return channel;
    }, "getSideChannelList");
  }
});

// ../node_modules/es-object-atoms/index.js
var require_es_object_atoms = __commonJS({
  "../node_modules/es-object-atoms/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Object;
  }
});

// ../node_modules/es-errors/index.js
var require_es_errors = __commonJS({
  "../node_modules/es-errors/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Error;
  }
});

// ../node_modules/es-errors/eval.js
var require_eval = __commonJS({
  "../node_modules/es-errors/eval.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = EvalError;
  }
});

// ../node_modules/es-errors/range.js
var require_range = __commonJS({
  "../node_modules/es-errors/range.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = RangeError;
  }
});

// ../node_modules/es-errors/ref.js
var require_ref = __commonJS({
  "../node_modules/es-errors/ref.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = ReferenceError;
  }
});

// ../node_modules/es-errors/syntax.js
var require_syntax = __commonJS({
  "../node_modules/es-errors/syntax.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = SyntaxError;
  }
});

// ../node_modules/es-errors/uri.js
var require_uri = __commonJS({
  "../node_modules/es-errors/uri.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = URIError;
  }
});

// ../node_modules/math-intrinsics/abs.js
var require_abs = __commonJS({
  "../node_modules/math-intrinsics/abs.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Math.abs;
  }
});

// ../node_modules/math-intrinsics/floor.js
var require_floor = __commonJS({
  "../node_modules/math-intrinsics/floor.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Math.floor;
  }
});

// ../node_modules/math-intrinsics/max.js
var require_max = __commonJS({
  "../node_modules/math-intrinsics/max.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Math.max;
  }
});

// ../node_modules/math-intrinsics/min.js
var require_min = __commonJS({
  "../node_modules/math-intrinsics/min.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Math.min;
  }
});

// ../node_modules/math-intrinsics/pow.js
var require_pow = __commonJS({
  "../node_modules/math-intrinsics/pow.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Math.pow;
  }
});

// ../node_modules/math-intrinsics/round.js
var require_round = __commonJS({
  "../node_modules/math-intrinsics/round.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Math.round;
  }
});

// ../node_modules/math-intrinsics/isNaN.js
var require_isNaN = __commonJS({
  "../node_modules/math-intrinsics/isNaN.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Number.isNaN || /* @__PURE__ */ __name(function isNaN2(a) {
      return a !== a;
    }, "isNaN");
  }
});

// ../node_modules/math-intrinsics/sign.js
var require_sign = __commonJS({
  "../node_modules/math-intrinsics/sign.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var $isNaN = require_isNaN();
    module.exports = /* @__PURE__ */ __name(function sign(number) {
      if ($isNaN(number) || number === 0) {
        return number;
      }
      return number < 0 ? -1 : 1;
    }, "sign");
  }
});

// ../node_modules/gopd/gOPD.js
var require_gOPD = __commonJS({
  "../node_modules/gopd/gOPD.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Object.getOwnPropertyDescriptor;
  }
});

// ../node_modules/gopd/index.js
var require_gopd = __commonJS({
  "../node_modules/gopd/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var $gOPD = require_gOPD();
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    module.exports = $gOPD;
  }
});

// ../node_modules/es-define-property/index.js
var require_es_define_property = __commonJS({
  "../node_modules/es-define-property/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var $defineProperty = Object.defineProperty || false;
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = false;
      }
    }
    module.exports = $defineProperty;
  }
});

// ../node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "../node_modules/has-symbols/shams.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = /* @__PURE__ */ __name(function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = /* @__PURE__ */ Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (var _ in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = (
          /** @type {PropertyDescriptor} */
          Object.getOwnPropertyDescriptor(obj, sym)
        );
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    }, "hasSymbols");
  }
});

// ../node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "../node_modules/has-symbols/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module.exports = /* @__PURE__ */ __name(function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    }, "hasNativeSymbols");
  }
});

// ../node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = __commonJS({
  "../node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  }
});

// ../node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = __commonJS({
  "../node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var $Object = require_es_object_atoms();
    module.exports = $Object.getPrototypeOf || null;
  }
});

// ../node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "../node_modules/function-bind/implementation.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = /* @__PURE__ */ __name(function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    }, "concatty");
    var slicy = /* @__PURE__ */ __name(function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    }, "slicy");
    var joiny = /* @__PURE__ */ __name(function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    }, "joiny");
    module.exports = /* @__PURE__ */ __name(function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = /* @__PURE__ */ __name(function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      }, "binder");
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = /* @__PURE__ */ __name(function Empty2() {
        }, "Empty");
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    }, "bind");
  }
});

// ../node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "../node_modules/function-bind/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var implementation = require_implementation();
    module.exports = Function.prototype.bind || implementation;
  }
});

// ../node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = __commonJS({
  "../node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Function.prototype.call;
  }
});

// ../node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = __commonJS({
  "../node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = Function.prototype.apply;
  }
});

// ../node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = __commonJS({
  "../node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  }
});

// ../node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = __commonJS({
  "../node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var bind = require_function_bind();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var $reflectApply = require_reflectApply();
    module.exports = $reflectApply || bind.call($call, $apply);
  }
});

// ../node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = __commonJS({
  "../node_modules/call-bind-apply-helpers/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var bind = require_function_bind();
    var $TypeError = require_type();
    var $call = require_functionCall();
    var $actualApply = require_actualApply();
    module.exports = /* @__PURE__ */ __name(function callBindBasic(args) {
      if (args.length < 1 || typeof args[0] !== "function") {
        throw new $TypeError("a function is required");
      }
      return $actualApply(bind, $call, args);
    }, "callBindBasic");
  }
});

// ../node_modules/dunder-proto/get.js
var require_get = __commonJS({
  "../node_modules/dunder-proto/get.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var callBind = require_call_bind_apply_helpers();
    var gOPD = require_gopd();
    var hasProtoAccessor;
    try {
      hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
      [].__proto__ === Array.prototype;
    } catch (e) {
      if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
        throw e;
      }
    }
    var desc = !!hasProtoAccessor && gOPD && gOPD(
      Object.prototype,
      /** @type {keyof typeof Object.prototype} */
      "__proto__"
    );
    var $Object = Object;
    var $getPrototypeOf = $Object.getPrototypeOf;
    module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
      /** @type {import('./get')} */
      /* @__PURE__ */ __name(function getDunder(value) {
        return $getPrototypeOf(value == null ? value : $Object(value));
      }, "getDunder")
    ) : false;
  }
});

// ../node_modules/get-proto/index.js
var require_get_proto = __commonJS({
  "../node_modules/get-proto/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var reflectGetProto = require_Reflect_getPrototypeOf();
    var originalGetProto = require_Object_getPrototypeOf();
    var getDunderProto = require_get();
    module.exports = reflectGetProto ? /* @__PURE__ */ __name(function getProto(O) {
      return reflectGetProto(O);
    }, "getProto") : originalGetProto ? /* @__PURE__ */ __name(function getProto(O) {
      if (!O || typeof O !== "object" && typeof O !== "function") {
        throw new TypeError("getProto: not an object");
      }
      return originalGetProto(O);
    }, "getProto") : getDunderProto ? /* @__PURE__ */ __name(function getProto(O) {
      return getDunderProto(O);
    }, "getProto") : null;
  }
});

// ../node_modules/hasown/index.js
var require_hasown = __commonJS({
  "../node_modules/hasown/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module.exports = bind.call(call, $hasOwn);
  }
});

// ../node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  "../node_modules/get-intrinsic/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var undefined2;
    var $Object = require_es_object_atoms();
    var $Error = require_es_errors();
    var $EvalError = require_eval();
    var $RangeError = require_range();
    var $ReferenceError = require_ref();
    var $SyntaxError = require_syntax();
    var $TypeError = require_type();
    var $URIError = require_uri();
    var abs = require_abs();
    var floor = require_floor();
    var max = require_max();
    var min = require_min();
    var pow = require_pow();
    var round = require_round();
    var sign = require_sign();
    var $Function = Function;
    var getEvalledConstructor = /* @__PURE__ */ __name(function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    }, "getEvalledConstructor");
    var $gOPD = require_gopd();
    var $defineProperty = require_es_define_property();
    var throwTypeError = /* @__PURE__ */ __name(function() {
      throw new $TypeError();
    }, "throwTypeError");
    var ThrowTypeError = $gOPD ? (function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    })() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var getProto = require_get_proto();
    var $ObjectGPO = require_Object_getPrototypeOf();
    var $ReflectGPO = require_Reflect_getPrototypeOf();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      __proto__: null,
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
      "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": $Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": $EvalError,
      "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": $Object,
      "%Object.getOwnPropertyDescriptor%": $gOPD,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": $RangeError,
      "%ReferenceError%": $ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": $URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
      "%Function.prototype.call%": $call,
      "%Function.prototype.apply%": $apply,
      "%Object.defineProperty%": $defineProperty,
      "%Object.getPrototypeOf%": $ObjectGPO,
      "%Math.abs%": abs,
      "%Math.floor%": floor,
      "%Math.max%": max,
      "%Math.min%": min,
      "%Math.pow%": pow,
      "%Math.round%": round,
      "%Math.sign%": sign,
      "%Reflect.getPrototypeOf%": $ReflectGPO
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var errorProto;
    var doEval = /* @__PURE__ */ __name(function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    }, "doEval");
    var LEGACY_ALIASES = {
      __proto__: null,
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = require_function_bind();
    var hasOwn = require_hasown();
    var $concat = bind.call($call, Array.prototype.concat);
    var $spliceApply = bind.call($apply, Array.prototype.splice);
    var $replace = bind.call($call, String.prototype.replace);
    var $strSlice = bind.call($call, String.prototype.slice);
    var $exec = bind.call($call, RegExp.prototype.exec);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = /* @__PURE__ */ __name(function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName, function(match2, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match2;
      });
      return result;
    }, "stringToPath");
    var getBaseIntrinsic = /* @__PURE__ */ __name(function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    }, "getBaseIntrinsic");
    module.exports = /* @__PURE__ */ __name(function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void undefined2;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    }, "GetIntrinsic");
  }
});

// ../node_modules/call-bound/index.js
var require_call_bound = __commonJS({
  "../node_modules/call-bound/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var GetIntrinsic = require_get_intrinsic();
    var callBindBasic = require_call_bind_apply_helpers();
    var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
    module.exports = /* @__PURE__ */ __name(function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = (
        /** @type {(this: unknown, ...args: unknown[]) => unknown} */
        GetIntrinsic(name, !!allowMissing)
      );
      if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
        return callBindBasic(
          /** @type {const} */
          [intrinsic]
        );
      }
      return intrinsic;
    }, "callBoundIntrinsic");
  }
});

// ../node_modules/side-channel-map/index.js
var require_side_channel_map = __commonJS({
  "../node_modules/side-channel-map/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var GetIntrinsic = require_get_intrinsic();
    var callBound = require_call_bound();
    var inspect = require_object_inspect();
    var $TypeError = require_type();
    var $Map = GetIntrinsic("%Map%", true);
    var $mapGet = callBound("Map.prototype.get", true);
    var $mapSet = callBound("Map.prototype.set", true);
    var $mapHas = callBound("Map.prototype.has", true);
    var $mapDelete = callBound("Map.prototype.delete", true);
    var $mapSize = callBound("Map.prototype.size", true);
    module.exports = !!$Map && /** @type {Exclude<import('.'), false>} */
    /* @__PURE__ */ __name(function getSideChannelMap() {
      var $m;
      var channel = {
        assert: /* @__PURE__ */ __name(function(key) {
          if (!channel.has(key)) {
            throw new $TypeError("Side channel does not contain " + inspect(key));
          }
        }, "assert"),
        "delete": /* @__PURE__ */ __name(function(key) {
          if ($m) {
            var result = $mapDelete($m, key);
            if ($mapSize($m) === 0) {
              $m = void 0;
            }
            return result;
          }
          return false;
        }, "delete"),
        get: /* @__PURE__ */ __name(function(key) {
          if ($m) {
            return $mapGet($m, key);
          }
        }, "get"),
        has: /* @__PURE__ */ __name(function(key) {
          if ($m) {
            return $mapHas($m, key);
          }
          return false;
        }, "has"),
        set: /* @__PURE__ */ __name(function(key, value) {
          if (!$m) {
            $m = new $Map();
          }
          $mapSet($m, key, value);
        }, "set")
      };
      return channel;
    }, "getSideChannelMap");
  }
});

// ../node_modules/side-channel-weakmap/index.js
var require_side_channel_weakmap = __commonJS({
  "../node_modules/side-channel-weakmap/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var GetIntrinsic = require_get_intrinsic();
    var callBound = require_call_bound();
    var inspect = require_object_inspect();
    var getSideChannelMap = require_side_channel_map();
    var $TypeError = require_type();
    var $WeakMap = GetIntrinsic("%WeakMap%", true);
    var $weakMapGet = callBound("WeakMap.prototype.get", true);
    var $weakMapSet = callBound("WeakMap.prototype.set", true);
    var $weakMapHas = callBound("WeakMap.prototype.has", true);
    var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
    module.exports = $WeakMap ? (
      /** @type {Exclude<import('.'), false>} */
      /* @__PURE__ */ __name(function getSideChannelWeakMap() {
        var $wm;
        var $m;
        var channel = {
          assert: /* @__PURE__ */ __name(function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          }, "assert"),
          "delete": /* @__PURE__ */ __name(function(key) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if ($wm) {
                return $weakMapDelete($wm, key);
              }
            } else if (getSideChannelMap) {
              if ($m) {
                return $m["delete"](key);
              }
            }
            return false;
          }, "delete"),
          get: /* @__PURE__ */ __name(function(key) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if ($wm) {
                return $weakMapGet($wm, key);
              }
            }
            return $m && $m.get(key);
          }, "get"),
          has: /* @__PURE__ */ __name(function(key) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if ($wm) {
                return $weakMapHas($wm, key);
              }
            }
            return !!$m && $m.has(key);
          }, "has"),
          set: /* @__PURE__ */ __name(function(key, value) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if (!$wm) {
                $wm = new $WeakMap();
              }
              $weakMapSet($wm, key, value);
            } else if (getSideChannelMap) {
              if (!$m) {
                $m = getSideChannelMap();
              }
              $m.set(key, value);
            }
          }, "set")
        };
        return channel;
      }, "getSideChannelWeakMap")
    ) : getSideChannelMap;
  }
});

// ../node_modules/side-channel/index.js
var require_side_channel = __commonJS({
  "../node_modules/side-channel/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var $TypeError = require_type();
    var inspect = require_object_inspect();
    var getSideChannelList = require_side_channel_list();
    var getSideChannelMap = require_side_channel_map();
    var getSideChannelWeakMap = require_side_channel_weakmap();
    var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;
    module.exports = /* @__PURE__ */ __name(function getSideChannel() {
      var $channelData;
      var channel = {
        assert: /* @__PURE__ */ __name(function(key) {
          if (!channel.has(key)) {
            var keyDesc = key && Object(key) === key ? "the given object key" : inspect(key);
            throw new $TypeError("Side channel does not contain " + keyDesc);
          }
        }, "assert"),
        "delete": /* @__PURE__ */ __name(function(key) {
          return !!$channelData && $channelData["delete"](key);
        }, "delete"),
        get: /* @__PURE__ */ __name(function(key) {
          return $channelData && $channelData.get(key);
        }, "get"),
        has: /* @__PURE__ */ __name(function(key) {
          return !!$channelData && $channelData.has(key);
        }, "has"),
        set: /* @__PURE__ */ __name(function(key, value) {
          if (!$channelData) {
            $channelData = makeChannel();
          }
          $channelData.set(key, value);
        }, "set")
      };
      return channel;
    }, "getSideChannel");
  }
});

// ../node_modules/qs/lib/formats.js
var require_formats = __commonJS({
  "../node_modules/qs/lib/formats.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var replace = String.prototype.replace;
    var percentTwenties = /%20/g;
    var Format = {
      RFC1738: "RFC1738",
      RFC3986: "RFC3986"
    };
    module.exports = {
      "default": Format.RFC3986,
      formatters: {
        RFC1738: /* @__PURE__ */ __name(function(value) {
          return replace.call(value, percentTwenties, "+");
        }, "RFC1738"),
        RFC3986: /* @__PURE__ */ __name(function(value) {
          return String(value);
        }, "RFC3986")
      },
      RFC1738: Format.RFC1738,
      RFC3986: Format.RFC3986
    };
  }
});

// ../node_modules/qs/lib/utils.js
var require_utils = __commonJS({
  "../node_modules/qs/lib/utils.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var formats = require_formats();
    var getSideChannel = require_side_channel();
    var defineProperty = require_es_define_property();
    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;
    var overflowChannel = getSideChannel();
    var markOverflow = /* @__PURE__ */ __name(function markOverflow2(obj, maxIndex) {
      overflowChannel.set(obj, maxIndex);
      return obj;
    }, "markOverflow");
    var isOverflow = /* @__PURE__ */ __name(function isOverflow2(obj) {
      return overflowChannel.has(obj);
    }, "isOverflow");
    var getMaxIndex = /* @__PURE__ */ __name(function getMaxIndex2(obj) {
      return overflowChannel.get(obj);
    }, "getMaxIndex");
    var setMaxIndex = /* @__PURE__ */ __name(function setMaxIndex2(obj, maxIndex) {
      overflowChannel.set(obj, maxIndex);
    }, "setMaxIndex");
    var hexTable = (function() {
      var array = [];
      for (var i = 0; i < 256; ++i) {
        array[array.length] = "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase();
      }
      return array;
    })();
    var compactQueue = /* @__PURE__ */ __name(function compactQueue2(queue) {
      while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];
        if (isArray(obj)) {
          var compacted = [];
          for (var j = 0; j < obj.length; ++j) {
            if (typeof obj[j] !== "undefined") {
              compacted[compacted.length] = obj[j];
            }
          }
          item.obj[item.prop] = compacted;
        }
      }
    }, "compactQueue");
    var arrayToObject = /* @__PURE__ */ __name(function arrayToObject2(source, options) {
      var obj = options && options.plainObjects ? { __proto__: null } : {};
      for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== "undefined") {
          obj[i] = source[i];
        }
      }
      return obj;
    }, "arrayToObject");
    var setProperty = /* @__PURE__ */ __name(function setProperty2(obj, key, value) {
      if (key === "__proto__" && defineProperty) {
        defineProperty(obj, key, {
          configurable: true,
          enumerable: true,
          value,
          writable: true
        });
      } else {
        obj[key] = value;
      }
    }, "setProperty");
    var merge = /* @__PURE__ */ __name(function merge2(target, source, options) {
      if (!source) {
        return target;
      }
      if (typeof source !== "object" && typeof source !== "function") {
        if (isArray(target)) {
          var nextIndex = target.length;
          if (options && typeof options.arrayLimit === "number" && nextIndex >= options.arrayLimit) {
            if (options.throwOnLimitExceeded) {
              throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
            }
            return markOverflow(arrayToObject(target.concat(source), options), nextIndex);
          }
          target[nextIndex] = source;
        } else if (target && typeof target === "object") {
          if (isOverflow(target)) {
            var newIndex = getMaxIndex(target) + 1;
            target[newIndex] = source;
            setMaxIndex(target, newIndex);
          } else if (options && options.strictMerge) {
            return [target, source];
          } else if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
            target[source] = true;
          }
        } else {
          return [target, source];
        }
        return target;
      }
      if (!target || typeof target !== "object") {
        if (isOverflow(source)) {
          var sourceKeys = Object.keys(source);
          var result = options && options.plainObjects ? { __proto__: null, 0: target } : { 0: target };
          for (var m = 0; m < sourceKeys.length; m++) {
            var oldKey = parseInt(sourceKeys[m], 10);
            result[oldKey + 1] = source[sourceKeys[m]];
          }
          return markOverflow(result, getMaxIndex(source) + 1);
        }
        var combined = [target].concat(source);
        if (options && typeof options.arrayLimit === "number" && combined.length > options.arrayLimit) {
          if (options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          }
          return markOverflow(arrayToObject(combined, options), combined.length - 1);
        }
        return combined;
      }
      var mergeTarget = target;
      if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
      }
      if (isArray(target) && isArray(source)) {
        source.forEach(function(item, i) {
          if (has.call(target, i)) {
            var targetItem = target[i];
            if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
              target[i] = merge2(targetItem, item, options);
            } else {
              target[target.length] = item;
            }
          } else {
            target[i] = item;
          }
        });
        if (options && typeof options.arrayLimit === "number" && target.length > options.arrayLimit) {
          if (options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          }
          return markOverflow(arrayToObject(target, options), target.length - 1);
        }
        return target;
      }
      return Object.keys(source).reduce(function(acc, key) {
        var value = source[key];
        if (has.call(acc, key)) {
          setProperty(acc, key, merge2(acc[key], value, options));
        } else {
          setProperty(acc, key, value);
        }
        if (isOverflow(source) && !isOverflow(acc)) {
          markOverflow(acc, getMaxIndex(source));
        }
        if (isOverflow(acc)) {
          var keyNum = parseInt(key, 10);
          if (String(keyNum) === key && keyNum >= 0 && keyNum > getMaxIndex(acc)) {
            setMaxIndex(acc, keyNum);
          }
        }
        return acc;
      }, mergeTarget);
    }, "merge");
    var assign = /* @__PURE__ */ __name(function assignSingleSource(target, source) {
      return Object.keys(source).reduce(function(acc, key) {
        setProperty(acc, key, source[key]);
        return acc;
      }, target);
    }, "assignSingleSource");
    var decode = /* @__PURE__ */ __name(function(str, defaultDecoder, charset) {
      var strWithoutPlus = str.replace(/\+/g, " ");
      if (charset === "iso-8859-1") {
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
      }
      try {
        return decodeURIComponent(strWithoutPlus);
      } catch (e) {
        return strWithoutPlus;
      }
    }, "decode");
    var limit = 1024;
    var encode = /* @__PURE__ */ __name(function encode2(str, defaultEncoder, charset, kind, format) {
      if (str.length === 0) {
        return str;
      }
      var string = str;
      if (typeof str === "symbol") {
        string = Symbol.prototype.toString.call(str);
      } else if (typeof str !== "string") {
        string = String(str);
      }
      if (charset === "iso-8859-1") {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
          return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
        });
      }
      var out = "";
      for (var j = 0; j < string.length; j += limit) {
        var segment = string.length >= limit ? string.slice(j, j + limit) : string;
        if (j + limit < string.length) {
          var last = segment.charCodeAt(segment.length - 1);
          if (last >= 55296 && last <= 56319) {
            segment = segment.slice(0, -1);
            j -= 1;
          }
        }
        var arr = [];
        for (var i = 0; i < segment.length; ++i) {
          var c = segment.charCodeAt(i);
          if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats.RFC1738 && (c === 40 || c === 41)) {
            arr[arr.length] = segment.charAt(i);
            continue;
          }
          if (c < 128) {
            arr[arr.length] = hexTable[c];
            continue;
          }
          if (c < 2048) {
            arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
            continue;
          }
          if (c < 55296 || c >= 57344) {
            arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
            continue;
          }
          i += 1;
          c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
          arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
        }
        out += arr.join("");
      }
      return out;
    }, "encode");
    var compact = /* @__PURE__ */ __name(function compact2(value) {
      var queue = [{ obj: { o: value }, prop: "o" }];
      var refs = getSideChannel();
      for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];
        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
          var key = keys[j];
          var val = obj[key];
          if (typeof val === "object" && val !== null && !refs.has(val)) {
            queue[queue.length] = { obj, prop: key };
            refs.set(val, true);
          }
        }
      }
      compactQueue(queue);
      return value;
    }, "compact");
    var isRegExp = /* @__PURE__ */ __name(function isRegExp2(obj) {
      return Object.prototype.toString.call(obj) === "[object RegExp]";
    }, "isRegExp");
    var isBuffer = /* @__PURE__ */ __name(function isBuffer2(obj) {
      if (!obj || typeof obj !== "object") {
        return false;
      }
      return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
    }, "isBuffer");
    var combine = /* @__PURE__ */ __name(function combine2(a, b, arrayLimit, plainObjects, throwOnLimitExceeded) {
      if (isOverflow(a)) {
        if (throwOnLimitExceeded) {
          throw new RangeError("Array limit exceeded. Only " + arrayLimit + " element" + (arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        var newIndex = getMaxIndex(a) + 1;
        a[newIndex] = b;
        setMaxIndex(a, newIndex);
        return a;
      }
      var result = [].concat(a, b);
      if (result.length > arrayLimit) {
        if (throwOnLimitExceeded) {
          throw new RangeError("Array limit exceeded. Only " + arrayLimit + " element" + (arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        return markOverflow(arrayToObject(result, { plainObjects }), result.length - 1);
      }
      return result;
    }, "combine");
    var maybeMap = /* @__PURE__ */ __name(function maybeMap2(val, fn) {
      if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
          mapped[mapped.length] = fn(val[i]);
        }
        return mapped;
      }
      return fn(val);
    }, "maybeMap");
    module.exports = {
      arrayToObject,
      assign,
      combine,
      compact,
      decode,
      encode,
      isBuffer,
      isOverflow,
      isRegExp,
      markOverflow,
      maybeMap,
      merge
    };
  }
});

// ../node_modules/qs/lib/stringify.js
var require_stringify = __commonJS({
  "../node_modules/qs/lib/stringify.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var getSideChannel = require_side_channel();
    var utils = require_utils();
    var formats = require_formats();
    var has = Object.prototype.hasOwnProperty;
    var arrayPrefixGenerators = {
      brackets: /* @__PURE__ */ __name(function brackets(prefix) {
        return prefix + "[]";
      }, "brackets"),
      comma: "comma",
      indices: /* @__PURE__ */ __name(function indices(prefix, key) {
        return prefix + "[" + key + "]";
      }, "indices"),
      repeat: /* @__PURE__ */ __name(function repeat(prefix) {
        return prefix;
      }, "repeat")
    };
    var isArray = Array.isArray;
    var push = Array.prototype.push;
    var pushToArray = /* @__PURE__ */ __name(function(arr, valueOrArray) {
      push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
    }, "pushToArray");
    var toISO = Date.prototype.toISOString;
    var defaultFormat = formats["default"];
    var defaults = {
      addQueryPrefix: false,
      allowDots: false,
      allowEmptyArrays: false,
      arrayFormat: "indices",
      charset: "utf-8",
      charsetSentinel: false,
      commaRoundTrip: false,
      delimiter: "&",
      encode: true,
      encodeDotInKeys: false,
      encoder: utils.encode,
      encodeValuesOnly: false,
      filter: void 0,
      format: defaultFormat,
      formatter: formats.formatters[defaultFormat],
      // deprecated
      indices: false,
      serializeDate: /* @__PURE__ */ __name(function serializeDate(date) {
        return toISO.call(date);
      }, "serializeDate"),
      skipNulls: false,
      strictNullHandling: false
    };
    var isNonNullishPrimitive = /* @__PURE__ */ __name(function isNonNullishPrimitive2(v) {
      return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
    }, "isNonNullishPrimitive");
    var sentinel = {};
    var stringify2 = /* @__PURE__ */ __name(function stringify3(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
      var obj = object;
      var tmpSc = sideChannel;
      var step = 0;
      var findFlag = false;
      while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== "undefined") {
          if (pos === step) {
            throw new RangeError("Cyclic object value");
          } else {
            findFlag = true;
          }
        }
        if (typeof tmpSc.get(sentinel) === "undefined") {
          step = 0;
        }
      }
      if (typeof filter === "function") {
        obj = filter(prefix, obj);
      } else if (obj instanceof Date) {
        obj = serializeDate(obj);
      } else if (generateArrayPrefix === "comma" && isArray(obj)) {
        obj = utils.maybeMap(obj, function(value2) {
          if (value2 instanceof Date) {
            return serializeDate(value2);
          }
          return value2;
        });
      }
      if (obj === null) {
        if (strictNullHandling) {
          return formatter(encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix);
        }
        obj = "";
      }
      if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
          var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
          return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
        }
        return [formatter(prefix) + "=" + formatter(String(obj))];
      }
      var values = [];
      if (typeof obj === "undefined") {
        return values;
      }
      var objKeys;
      if (generateArrayPrefix === "comma" && isArray(obj)) {
        if (encodeValuesOnly && encoder) {
          obj = utils.maybeMap(obj, function(v) {
            return v == null ? v : encoder(v);
          });
        }
        objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
      } else if (isArray(filter)) {
        objKeys = filter;
      } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
      }
      var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
      var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
      if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
        return adjustedPrefix + "[]";
      }
      for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === "object" && key && typeof key.value !== "undefined" ? key.value : obj[key];
        if (skipNulls && value === null) {
          continue;
        }
        var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, "%2E") : String(key);
        var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify3(
          value,
          keyPrefix,
          generateArrayPrefix,
          commaRoundTrip,
          allowEmptyArrays,
          strictNullHandling,
          skipNulls,
          encodeDotInKeys,
          generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
          filter,
          sort,
          allowDots,
          serializeDate,
          format,
          formatter,
          encodeValuesOnly,
          charset,
          valueSideChannel
        ));
      }
      return values;
    }, "stringify");
    var normalizeStringifyOptions = /* @__PURE__ */ __name(function normalizeStringifyOptions2(opts) {
      if (!opts) {
        return defaults;
      }
      if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
        throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
      }
      if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
        throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
      }
      if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
        throw new TypeError("Encoder has to be a function.");
      }
      var charset = opts.charset || defaults.charset;
      if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
        throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
      }
      var format = formats["default"];
      if (typeof opts.format !== "undefined") {
        if (!has.call(formats.formatters, opts.format)) {
          throw new TypeError("Unknown format option provided.");
        }
        format = opts.format;
      }
      var formatter = formats.formatters[format];
      var filter = defaults.filter;
      if (typeof opts.filter === "function" || isArray(opts.filter)) {
        filter = opts.filter;
      }
      var arrayFormat;
      if (opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
      } else if ("indices" in opts) {
        arrayFormat = opts.indices ? "indices" : "repeat";
      } else {
        arrayFormat = defaults.arrayFormat;
      }
      if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
        throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
      }
      var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
      return {
        addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter,
        format,
        formatter,
        serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === "function" ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
      };
    }, "normalizeStringifyOptions");
    module.exports = function(object, opts) {
      var obj = object;
      var options = normalizeStringifyOptions(opts);
      var objKeys;
      var filter;
      if (typeof options.filter === "function") {
        filter = options.filter;
        obj = filter("", obj);
      } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
      }
      var keys = [];
      if (typeof obj !== "object" || obj === null) {
        return "";
      }
      var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
      var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
      if (!objKeys) {
        objKeys = Object.keys(obj);
      }
      if (options.sort) {
        objKeys.sort(options.sort);
      }
      var sideChannel = getSideChannel();
      for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        if (typeof key === "undefined" || key === null) {
          continue;
        }
        var value = obj[key];
        if (options.skipNulls && value === null) {
          continue;
        }
        pushToArray(keys, stringify2(
          value,
          key,
          generateArrayPrefix,
          commaRoundTrip,
          options.allowEmptyArrays,
          options.strictNullHandling,
          options.skipNulls,
          options.encodeDotInKeys,
          options.encode ? options.encoder : null,
          options.filter,
          options.sort,
          options.allowDots,
          options.serializeDate,
          options.format,
          options.formatter,
          options.encodeValuesOnly,
          options.charset,
          sideChannel
        ));
      }
      var joined = keys.join(options.delimiter);
      var prefix = options.addQueryPrefix === true ? "?" : "";
      if (options.charsetSentinel) {
        if (options.charset === "iso-8859-1") {
          prefix += "utf8=%26%2310003%3B" + options.delimiter;
        } else {
          prefix += "utf8=%E2%9C%93" + options.delimiter;
        }
      }
      return joined.length > 0 ? prefix + joined : "";
    };
  }
});

// ../node_modules/qs/lib/parse.js
var require_parse = __commonJS({
  "../node_modules/qs/lib/parse.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var utils = require_utils();
    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;
    var defaults = {
      allowDots: false,
      allowEmptyArrays: false,
      allowPrototypes: false,
      allowSparse: false,
      arrayLimit: 20,
      charset: "utf-8",
      charsetSentinel: false,
      comma: false,
      decodeDotInKeys: false,
      decoder: utils.decode,
      delimiter: "&",
      depth: 5,
      duplicates: "combine",
      ignoreQueryPrefix: false,
      interpretNumericEntities: false,
      parameterLimit: 1e3,
      parseArrays: true,
      plainObjects: false,
      strictDepth: false,
      strictMerge: true,
      strictNullHandling: false,
      throwOnLimitExceeded: false
    };
    var interpretNumericEntities = /* @__PURE__ */ __name(function(str) {
      return str.replace(/&#(\d+);/g, function($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
      });
    }, "interpretNumericEntities");
    var parseArrayValue = /* @__PURE__ */ __name(function(val, options, currentArrayLength, isFlatArrayValue) {
      if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
        if (isFlatArrayValue && options.throwOnLimitExceeded) {
          var commaCount = 0;
          var commaIndex = val.indexOf(",");
          while (commaIndex > -1) {
            commaCount += 1;
            if (commaCount >= options.arrayLimit) {
              throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
            }
            commaIndex = val.indexOf(",", commaIndex + 1);
          }
        }
        return val.split(",");
      }
      if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
      }
      return val;
    }, "parseArrayValue");
    var isoSentinel = "utf8=%26%2310003%3B";
    var charsetSentinel = "utf8=%E2%9C%93";
    var parseValues = /* @__PURE__ */ __name(function parseQueryStringValues(str, options) {
      var obj = { __proto__: null };
      var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
      cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
      var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
      var parts = cleanStr.split(
        options.delimiter,
        options.throwOnLimitExceeded && typeof limit !== "undefined" ? limit + 1 : limit
      );
      if (options.throwOnLimitExceeded && typeof limit !== "undefined" && parts.length > limit) {
        throw new RangeError("Parameter limit exceeded. Only " + limit + " parameter" + (limit === 1 ? "" : "s") + " allowed.");
      }
      var skipIndex = -1;
      var i;
      var charset = options.charset;
      if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
          if (parts[i].indexOf("utf8=") === 0) {
            if (parts[i] === charsetSentinel) {
              charset = "utf-8";
            } else if (parts[i] === isoSentinel) {
              charset = "iso-8859-1";
            }
            skipIndex = i;
            i = parts.length;
          }
        }
      }
      for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
          continue;
        }
        var part = parts[i];
        var bracketEqualsPos = part.indexOf("]=");
        var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
        var key;
        var val;
        if (pos === -1) {
          key = options.decoder(part, defaults.decoder, charset, "key");
          val = options.strictNullHandling ? null : "";
        } else {
          key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
          if (key !== null) {
            val = utils.maybeMap(
              parseArrayValue(
                part.slice(pos + 1),
                options,
                isArray(obj[key]) ? obj[key].length : 0,
                part.indexOf("[]=") === -1
              ),
              function(encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, "value");
              }
            );
          }
        }
        if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
          val = interpretNumericEntities(String(val));
        }
        if (part.indexOf("[]=") > -1) {
          val = isArray(val) ? [val] : val;
        }
        if (options.comma && isArray(val) && val.length > options.arrayLimit) {
          val = utils.combine([], val, options.arrayLimit, options.plainObjects, options.throwOnLimitExceeded);
        }
        if (key !== null) {
          var existing = has.call(obj, key);
          if (existing && (options.duplicates === "combine" || part.indexOf("[]=") > -1)) {
            obj[key] = utils.combine(
              obj[key],
              val,
              options.arrayLimit,
              options.plainObjects,
              options.throwOnLimitExceeded
            );
          } else if (!existing || options.duplicates === "last") {
            obj[key] = val;
          }
        }
      }
      return obj;
    }, "parseQueryStringValues");
    var parseObject = /* @__PURE__ */ __name(function(chain, val, options, valuesParsed) {
      var currentArrayLength = 0;
      if (chain.length > 0 && chain[chain.length - 1] === "[]") {
        var parentKey = chain.slice(0, -1).join("");
        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
      }
      var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);
      for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];
        if (root === "[]" && options.parseArrays) {
          if (utils.isOverflow(leaf)) {
            obj = leaf;
          } else {
            obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : utils.combine(
              [],
              leaf,
              options.arrayLimit,
              options.plainObjects,
              options.throwOnLimitExceeded
            );
          }
        } else {
          obj = options.plainObjects ? { __proto__: null } : {};
          var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
          var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
          var index = parseInt(decodedRoot, 10);
          var isValidArrayIndex = !isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && options.parseArrays;
          if (!options.parseArrays && decodedRoot === "") {
            obj = { 0: leaf };
          } else if (isValidArrayIndex && index < options.arrayLimit) {
            obj = [];
            obj[index] = leaf;
          } else if (isValidArrayIndex && options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          } else if (isValidArrayIndex) {
            obj[index] = leaf;
            utils.markOverflow(obj, index);
          } else if (decodedRoot !== "__proto__") {
            obj[decodedRoot] = leaf;
          }
        }
        leaf = obj;
      }
      return leaf;
    }, "parseObject");
    var splitKeyIntoSegments = /* @__PURE__ */ __name(function splitKeyIntoSegments2(originalKey, options) {
      var key = options.allowDots ? originalKey.replace(/\.([^.[]+)/g, "[$1]") : originalKey;
      if (options.depth <= 0) {
        if (!options.plainObjects && has.call(Object.prototype, key)) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        return [key];
      }
      var segments = [];
      var first = key.indexOf("[");
      var parent = first >= 0 ? key.slice(0, first) : key;
      if (parent) {
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        segments[segments.length] = parent;
      }
      var n = key.length;
      var open = first;
      var collected = 0;
      while (open >= 0 && collected < options.depth) {
        var level = 1;
        var i = open + 1;
        var close = -1;
        while (i < n && close < 0) {
          var cu = key.charCodeAt(i);
          if (cu === 91) {
            level += 1;
          } else if (cu === 93) {
            level -= 1;
            if (level === 0) {
              close = i;
            }
          }
          i += 1;
        }
        if (close < 0) {
          segments[segments.length] = "[" + key.slice(open) + "]";
          return segments;
        }
        var seg = key.slice(open, close + 1);
        var content = seg.slice(1, -1);
        if (!options.plainObjects && has.call(Object.prototype, content) && !options.allowPrototypes) {
          return;
        }
        segments[segments.length] = seg;
        collected += 1;
        open = key.indexOf("[", close + 1);
      }
      if (open >= 0) {
        if (options.strictDepth === true) {
          throw new RangeError("Input depth exceeded depth option of " + options.depth + " and strictDepth is true");
        }
        segments[segments.length] = "[" + key.slice(open) + "]";
      }
      return segments;
    }, "splitKeyIntoSegments");
    var parseKeys = /* @__PURE__ */ __name(function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
      if (!givenKey) {
        return;
      }
      var keys = splitKeyIntoSegments(givenKey, options);
      if (!keys) {
        return;
      }
      return parseObject(keys, val, options, valuesParsed);
    }, "parseQueryStringKeys");
    var normalizeParseOptions = /* @__PURE__ */ __name(function normalizeParseOptions2(opts) {
      if (!opts) {
        return defaults;
      }
      if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
        throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
      }
      if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
        throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
      }
      if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
        throw new TypeError("Decoder has to be a function.");
      }
      if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
        throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
      }
      if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") {
        throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
      }
      var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
      var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
      if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
        throw new TypeError("The duplicates option must be either combine, first, or last");
      }
      var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
      return {
        allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
        duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
        strictMerge: typeof opts.strictMerge === "boolean" ? !!opts.strictMerge : defaults.strictMerge,
        strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
      };
    }, "normalizeParseOptions");
    module.exports = function(str, opts) {
      var options = normalizeParseOptions(opts);
      if (str === "" || str === null || typeof str === "undefined") {
        return options.plainObjects ? { __proto__: null } : {};
      }
      var tempObj = typeof str === "string" ? parseValues(str, options) : str;
      var obj = options.plainObjects ? { __proto__: null } : {};
      var keys = Object.keys(tempObj);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
        obj = utils.merge(obj, newObj, options);
      }
      if (options.allowSparse === true) {
        return obj;
      }
      return utils.compact(obj);
    };
  }
});

// ../node_modules/qs/lib/index.js
var require_lib = __commonJS({
  "../node_modules/qs/lib/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    var stringify2 = require_stringify();
    var parse2 = require_parse();
    var formats = require_formats();
    module.exports = {
      formats,
      parse: parse2,
      stringify: stringify2
    };
  }
});

// ../node_modules/stripe/esm/utils.js
function isOptionsHash(o) {
  return o && typeof o === "object" && OPTIONS_KEYS.some((prop) => Object.prototype.hasOwnProperty.call(o, prop));
}
function stringifyRequestData(data) {
  return qs.stringify(data, {
    serializeDate: /* @__PURE__ */ __name((d) => Math.floor(d.getTime() / 1e3).toString(), "serializeDate")
  }).replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function extractUrlParams(path) {
  const params = path.match(/\{\w+\}/g);
  if (!params) {
    return [];
  }
  return params.map((param) => param.replace(/[{}]/g, ""));
}
function getDataFromArgs(args) {
  if (!Array.isArray(args) || !args[0] || typeof args[0] !== "object") {
    return {};
  }
  if (!isOptionsHash(args[0])) {
    return args.shift();
  }
  const argKeys = Object.keys(args[0]);
  const optionKeysInArgs = argKeys.filter((key) => OPTIONS_KEYS.includes(key));
  if (optionKeysInArgs.length > 0 && optionKeysInArgs.length !== argKeys.length) {
    emitWarning(`Options found in arguments (${optionKeysInArgs.join(", ")}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options.`);
  }
  return {};
}
function getOptionsFromArgs(args) {
  const opts = {
    auth: null,
    host: null,
    headers: {},
    settings: {}
  };
  if (args.length > 0) {
    const arg = args[args.length - 1];
    if (typeof arg === "string") {
      opts.auth = args.pop();
    } else if (isOptionsHash(arg)) {
      const params = Object.assign({}, args.pop());
      const extraKeys = Object.keys(params).filter((key) => !OPTIONS_KEYS.includes(key));
      if (extraKeys.length) {
        emitWarning(`Invalid options found (${extraKeys.join(", ")}); ignoring.`);
      }
      if (params.apiKey) {
        opts.auth = params.apiKey;
      }
      if (params.idempotencyKey) {
        opts.headers["Idempotency-Key"] = params.idempotencyKey;
      }
      if (params.stripeAccount) {
        opts.headers["Stripe-Account"] = params.stripeAccount;
      }
      if (params.apiVersion) {
        opts.headers["Stripe-Version"] = params.apiVersion;
      }
      if (Number.isInteger(params.maxNetworkRetries)) {
        opts.settings.maxNetworkRetries = params.maxNetworkRetries;
      }
      if (Number.isInteger(params.timeout)) {
        opts.settings.timeout = params.timeout;
      }
      if (params.host) {
        opts.host = params.host;
      }
    }
  }
  return opts;
}
function protoExtend(sub) {
  const Super = this;
  const Constructor = Object.prototype.hasOwnProperty.call(sub, "constructor") ? sub.constructor : function(...args) {
    Super.apply(this, args);
  };
  Object.assign(Constructor, Super);
  Constructor.prototype = Object.create(Super.prototype);
  Object.assign(Constructor.prototype, sub);
  return Constructor;
}
function removeNullish(obj) {
  if (typeof obj !== "object") {
    throw new Error("Argument must be an object");
  }
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}
function normalizeHeaders(obj) {
  if (!(obj && typeof obj === "object")) {
    return obj;
  }
  return Object.keys(obj).reduce((result, header) => {
    result[normalizeHeader(header)] = obj[header];
    return result;
  }, {});
}
function normalizeHeader(header) {
  return header.split("-").map((text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()).join("-");
}
function callbackifyPromiseWithTimeout(promise, callback) {
  if (callback) {
    return promise.then((res) => {
      setTimeout(() => {
        callback(null, res);
      }, 0);
    }, (err) => {
      setTimeout(() => {
        callback(err, null);
      }, 0);
    });
  }
  return promise;
}
function pascalToCamelCase(name) {
  if (name === "OAuth") {
    return "oauth";
  } else {
    return name[0].toLowerCase() + name.substring(1);
  }
}
function emitWarning(warning) {
  if (typeof process.emitWarning !== "function") {
    return console.warn(`Stripe: ${warning}`);
  }
  return process.emitWarning(warning, "Stripe");
}
function isObject(obj) {
  const type = typeof obj;
  return (type === "function" || type === "object") && !!obj;
}
function flattenAndStringify(data) {
  const result = {};
  const step = /* @__PURE__ */ __name((obj, prevKey) => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newKey = prevKey ? `${prevKey}[${key}]` : key;
      if (isObject(value)) {
        if (!(value instanceof Uint8Array) && !Object.prototype.hasOwnProperty.call(value, "data")) {
          return step(value, newKey);
        } else {
          result[newKey] = value;
        }
      } else {
        result[newKey] = String(value);
      }
    });
  }, "step");
  step(data, null);
  return result;
}
function validateInteger(name, n, defaultVal) {
  if (!Number.isInteger(n)) {
    if (defaultVal !== void 0) {
      return defaultVal;
    } else {
      throw new Error(`${name} must be an integer`);
    }
  }
  return n;
}
function determineProcessUserAgentProperties() {
  return typeof process === "undefined" ? {} : {
    lang_version: process.version,
    platform: process.platform
  };
}
var qs, OPTIONS_KEYS, makeURLInterpolator;
var init_utils = __esm({
  "../node_modules/stripe/esm/utils.js"() {
    init_functionsRoutes_0_35428525275895484();
    qs = __toESM(require_lib(), 1);
    OPTIONS_KEYS = [
      "apiKey",
      "idempotencyKey",
      "stripeAccount",
      "apiVersion",
      "maxNetworkRetries",
      "timeout",
      "host"
    ];
    __name(isOptionsHash, "isOptionsHash");
    __name(stringifyRequestData, "stringifyRequestData");
    makeURLInterpolator = /* @__PURE__ */ (() => {
      const rc = {
        "\n": "\\n",
        '"': '\\"',
        "\u2028": "\\u2028",
        "\u2029": "\\u2029"
      };
      return (str) => {
        const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
        return (outputs) => {
          return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) => (
            // @ts-ignore
            encodeURIComponent(outputs[$1] || "")
          ));
        };
      };
    })();
    __name(extractUrlParams, "extractUrlParams");
    __name(getDataFromArgs, "getDataFromArgs");
    __name(getOptionsFromArgs, "getOptionsFromArgs");
    __name(protoExtend, "protoExtend");
    __name(removeNullish, "removeNullish");
    __name(normalizeHeaders, "normalizeHeaders");
    __name(normalizeHeader, "normalizeHeader");
    __name(callbackifyPromiseWithTimeout, "callbackifyPromiseWithTimeout");
    __name(pascalToCamelCase, "pascalToCamelCase");
    __name(emitWarning, "emitWarning");
    __name(isObject, "isObject");
    __name(flattenAndStringify, "flattenAndStringify");
    __name(validateInteger, "validateInteger");
    __name(determineProcessUserAgentProperties, "determineProcessUserAgentProperties");
  }
});

// ../node_modules/stripe/esm/autoPagination.js
function getAsyncIteratorSymbol() {
  if (typeof Symbol !== "undefined" && Symbol.asyncIterator) {
    return Symbol.asyncIterator;
  }
  return "@@asyncIterator";
}
function getDoneCallback(args) {
  if (args.length < 2) {
    return null;
  }
  const onDone = args[1];
  if (typeof onDone !== "function") {
    throw Error(`The second argument to autoPagingEach, if present, must be a callback function; received ${typeof onDone}`);
  }
  return onDone;
}
function getItemCallback(args) {
  if (args.length === 0) {
    return void 0;
  }
  const onItem = args[0];
  if (typeof onItem !== "function") {
    throw Error(`The first argument to autoPagingEach, if present, must be a callback function; received ${typeof onItem}`);
  }
  if (onItem.length === 2) {
    return onItem;
  }
  if (onItem.length > 2) {
    throw Error(`The \`onItem\` callback function passed to autoPagingEach must accept at most two arguments; got ${onItem}`);
  }
  return /* @__PURE__ */ __name(function _onItem(item, next) {
    const shouldContinue = onItem(item);
    next(shouldContinue);
  }, "_onItem");
}
function getLastId(listResult, reverseIteration) {
  const lastIdx = reverseIteration ? 0 : listResult.data.length - 1;
  const lastItem = listResult.data[lastIdx];
  const lastId = lastItem && lastItem.id;
  if (!lastId) {
    throw Error("Unexpected: No `id` found on the last item while auto-paging a list.");
  }
  return lastId;
}
function makeAutoPagingEach(asyncIteratorNext) {
  return /* @__PURE__ */ __name(function autoPagingEach() {
    const args = [].slice.call(arguments);
    const onItem = getItemCallback(args);
    const onDone = getDoneCallback(args);
    if (args.length > 2) {
      throw Error(`autoPagingEach takes up to two arguments; received ${args}`);
    }
    const autoPagePromise = wrapAsyncIteratorWithCallback(
      asyncIteratorNext,
      // @ts-ignore we might need a null check
      onItem
    );
    return callbackifyPromiseWithTimeout(autoPagePromise, onDone);
  }, "autoPagingEach");
}
function makeAutoPagingToArray(autoPagingEach) {
  return /* @__PURE__ */ __name(function autoPagingToArray(opts, onDone) {
    const limit = opts && opts.limit;
    if (!limit) {
      throw Error("You must pass a `limit` option to autoPagingToArray, e.g., `autoPagingToArray({limit: 1000});`.");
    }
    if (limit > 1e4) {
      throw Error("You cannot specify a limit of more than 10,000 items to fetch in `autoPagingToArray`; use `autoPagingEach` to iterate through longer lists.");
    }
    const promise = new Promise((resolve, reject) => {
      const items = [];
      autoPagingEach((item) => {
        items.push(item);
        if (items.length >= limit) {
          return false;
        }
      }).then(() => {
        resolve(items);
      }).catch(reject);
    });
    return callbackifyPromiseWithTimeout(promise, onDone);
  }, "autoPagingToArray");
}
function wrapAsyncIteratorWithCallback(asyncIteratorNext, onItem) {
  return new Promise((resolve, reject) => {
    function handleIteration(iterResult) {
      if (iterResult.done) {
        resolve();
        return;
      }
      const item = iterResult.value;
      return new Promise((next) => {
        onItem(item, next);
      }).then((shouldContinue) => {
        if (shouldContinue === false) {
          return handleIteration({ done: true, value: void 0 });
        } else {
          return asyncIteratorNext().then(handleIteration);
        }
      });
    }
    __name(handleIteration, "handleIteration");
    asyncIteratorNext().then(handleIteration).catch(reject);
  });
}
function isReverseIteration(requestArgs) {
  const args = [].slice.call(requestArgs);
  const dataFromArgs = getDataFromArgs(args);
  return !!dataFromArgs.ending_before;
}
var StripeIterator, ListIterator, SearchIterator, makeAutoPaginationMethods, makeAutoPaginationMethodsFromIterator;
var init_autoPagination = __esm({
  "../node_modules/stripe/esm/autoPagination.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_utils();
    StripeIterator = class {
      static {
        __name(this, "StripeIterator");
      }
      constructor(firstPagePromise, requestArgs, spec, stripeResource) {
        this.index = 0;
        this.pagePromise = firstPagePromise;
        this.promiseCache = { currentPromise: null };
        this.requestArgs = requestArgs;
        this.spec = spec;
        this.stripeResource = stripeResource;
      }
      async iterate(pageResult) {
        if (!(pageResult && pageResult.data && typeof pageResult.data.length === "number")) {
          throw Error("Unexpected: Stripe API response does not have a well-formed `data` array.");
        }
        const reverseIteration = isReverseIteration(this.requestArgs);
        if (this.index < pageResult.data.length) {
          const idx = reverseIteration ? pageResult.data.length - 1 - this.index : this.index;
          const value = pageResult.data[idx];
          this.index += 1;
          return { value, done: false };
        } else if (pageResult.has_more) {
          this.index = 0;
          this.pagePromise = this.getNextPage(pageResult);
          const nextPageResult = await this.pagePromise;
          return this.iterate(nextPageResult);
        }
        return { done: true, value: void 0 };
      }
      /** @abstract */
      getNextPage(_pageResult) {
        throw new Error("Unimplemented");
      }
      async _next() {
        return this.iterate(await this.pagePromise);
      }
      next() {
        if (this.promiseCache.currentPromise) {
          return this.promiseCache.currentPromise;
        }
        const nextPromise = (async () => {
          const ret = await this._next();
          this.promiseCache.currentPromise = null;
          return ret;
        })();
        this.promiseCache.currentPromise = nextPromise;
        return nextPromise;
      }
    };
    ListIterator = class extends StripeIterator {
      static {
        __name(this, "ListIterator");
      }
      getNextPage(pageResult) {
        const reverseIteration = isReverseIteration(this.requestArgs);
        const lastId = getLastId(pageResult, reverseIteration);
        return this.stripeResource._makeRequest(this.requestArgs, this.spec, {
          [reverseIteration ? "ending_before" : "starting_after"]: lastId
        });
      }
    };
    SearchIterator = class extends StripeIterator {
      static {
        __name(this, "SearchIterator");
      }
      getNextPage(pageResult) {
        if (!pageResult.next_page) {
          throw Error("Unexpected: Stripe API response does not have a well-formed `next_page` field, but `has_more` was true.");
        }
        return this.stripeResource._makeRequest(this.requestArgs, this.spec, {
          page: pageResult.next_page
        });
      }
    };
    makeAutoPaginationMethods = /* @__PURE__ */ __name((stripeResource, requestArgs, spec, firstPagePromise) => {
      if (spec.methodType === "search") {
        return makeAutoPaginationMethodsFromIterator(new SearchIterator(firstPagePromise, requestArgs, spec, stripeResource));
      }
      if (spec.methodType === "list") {
        return makeAutoPaginationMethodsFromIterator(new ListIterator(firstPagePromise, requestArgs, spec, stripeResource));
      }
      return null;
    }, "makeAutoPaginationMethods");
    makeAutoPaginationMethodsFromIterator = /* @__PURE__ */ __name((iterator) => {
      const autoPagingEach = makeAutoPagingEach((...args) => iterator.next(...args));
      const autoPagingToArray = makeAutoPagingToArray(autoPagingEach);
      const autoPaginationMethods = {
        autoPagingEach,
        autoPagingToArray,
        // Async iterator functions:
        next: /* @__PURE__ */ __name(() => iterator.next(), "next"),
        return: /* @__PURE__ */ __name(() => {
          return {};
        }, "return"),
        [getAsyncIteratorSymbol()]: () => {
          return autoPaginationMethods;
        }
      };
      return autoPaginationMethods;
    }, "makeAutoPaginationMethodsFromIterator");
    __name(getAsyncIteratorSymbol, "getAsyncIteratorSymbol");
    __name(getDoneCallback, "getDoneCallback");
    __name(getItemCallback, "getItemCallback");
    __name(getLastId, "getLastId");
    __name(makeAutoPagingEach, "makeAutoPagingEach");
    __name(makeAutoPagingToArray, "makeAutoPagingToArray");
    __name(wrapAsyncIteratorWithCallback, "wrapAsyncIteratorWithCallback");
    __name(isReverseIteration, "isReverseIteration");
  }
});

// ../node_modules/stripe/esm/StripeMethod.js
function stripeMethod(spec) {
  if (spec.path !== void 0 && spec.fullPath !== void 0) {
    throw new Error(`Method spec specified both a 'path' (${spec.path}) and a 'fullPath' (${spec.fullPath}).`);
  }
  return function(...args) {
    const callback = typeof args[args.length - 1] == "function" && args.pop();
    spec.urlParams = extractUrlParams(spec.fullPath || this.createResourcePathWithSymbols(spec.path || ""));
    const requestPromise = callbackifyPromiseWithTimeout(this._makeRequest(args, spec, {}), callback);
    Object.assign(requestPromise, makeAutoPaginationMethods(this, args, spec, requestPromise));
    return requestPromise;
  };
}
var init_StripeMethod = __esm({
  "../node_modules/stripe/esm/StripeMethod.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_utils();
    init_autoPagination();
    __name(stripeMethod, "stripeMethod");
  }
});

// ../node_modules/stripe/esm/StripeResource.js
function StripeResource(stripe, deprecatedUrlData) {
  this._stripe = stripe;
  if (deprecatedUrlData) {
    throw new Error("Support for curried url params was dropped in stripe-node v7.0.0. Instead, pass two ids.");
  }
  this.basePath = makeURLInterpolator(
    // @ts-ignore changing type of basePath
    this.basePath || stripe.getApiField("basePath")
  );
  this.resourcePath = this.path;
  this.path = makeURLInterpolator(this.path);
  this.initialize(...arguments);
}
var init_StripeResource = __esm({
  "../node_modules/stripe/esm/StripeResource.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_utils();
    init_StripeMethod();
    StripeResource.extend = protoExtend;
    StripeResource.method = stripeMethod;
    StripeResource.MAX_BUFFERED_REQUEST_METRICS = 100;
    __name(StripeResource, "StripeResource");
    StripeResource.prototype = {
      _stripe: null,
      // @ts-ignore the type of path changes in ctor
      path: "",
      resourcePath: "",
      // Methods that don't use the API's default '/v1' path can override it with this setting.
      basePath: null,
      initialize() {
      },
      // Function to override the default data processor. This allows full control
      // over how a StripeResource's request data will get converted into an HTTP
      // body. This is useful for non-standard HTTP requests. The function should
      // take method name, data, and headers as arguments.
      requestDataProcessor: null,
      // Function to add a validation checks before sending the request, errors should
      // be thrown, and they will be passed to the callback/promise.
      validateRequest: null,
      createFullPath(commandPath, urlData) {
        const urlParts = [this.basePath(urlData), this.path(urlData)];
        if (typeof commandPath === "function") {
          const computedCommandPath = commandPath(urlData);
          if (computedCommandPath) {
            urlParts.push(computedCommandPath);
          }
        } else {
          urlParts.push(commandPath);
        }
        return this._joinUrlParts(urlParts);
      },
      // Creates a relative resource path with symbols left in (unlike
      // createFullPath which takes some data to replace them with). For example it
      // might produce: /invoices/{id}
      createResourcePathWithSymbols(pathWithSymbols) {
        if (pathWithSymbols) {
          return `/${this._joinUrlParts([this.resourcePath, pathWithSymbols])}`;
        } else {
          return `/${this.resourcePath}`;
        }
      },
      _joinUrlParts(parts) {
        return parts.join("/").replace(/\/{2,}/g, "/");
      },
      _getRequestOpts(requestArgs, spec, overrideData) {
        const requestMethod = (spec.method || "GET").toUpperCase();
        const usage = spec.usage || [];
        const urlParams = spec.urlParams || [];
        const encode = spec.encode || ((data2) => data2);
        const isUsingFullPath = !!spec.fullPath;
        const commandPath = makeURLInterpolator(isUsingFullPath ? spec.fullPath : spec.path || "");
        const path = isUsingFullPath ? spec.fullPath : this.createResourcePathWithSymbols(spec.path);
        const args = [].slice.call(requestArgs);
        const urlData = urlParams.reduce((urlData2, param) => {
          const arg = args.shift();
          if (typeof arg !== "string") {
            throw new Error(`Stripe: Argument "${param}" must be a string, but got: ${arg} (on API request to \`${requestMethod} ${path}\`)`);
          }
          urlData2[param] = arg;
          return urlData2;
        }, {});
        const dataFromArgs = getDataFromArgs(args);
        const data = encode(Object.assign({}, dataFromArgs, overrideData));
        const options = getOptionsFromArgs(args);
        const host = options.host || spec.host;
        const streaming = !!spec.streaming;
        if (args.filter((x) => x != null).length) {
          throw new Error(`Stripe: Unknown arguments (${args}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options. (on API request to ${requestMethod} \`${path}\`)`);
        }
        const requestPath = isUsingFullPath ? commandPath(urlData) : this.createFullPath(commandPath, urlData);
        const headers = Object.assign(options.headers, spec.headers);
        if (spec.validator) {
          spec.validator(data, { headers });
        }
        const dataInQuery = spec.method === "GET" || spec.method === "DELETE";
        const bodyData = dataInQuery ? {} : data;
        const queryData = dataInQuery ? data : {};
        return {
          requestMethod,
          requestPath,
          bodyData,
          queryData,
          auth: options.auth,
          headers,
          host: host !== null && host !== void 0 ? host : null,
          streaming,
          settings: options.settings,
          usage
        };
      },
      _makeRequest(requestArgs, spec, overrideData) {
        return new Promise((resolve, reject) => {
          var _a;
          let opts;
          try {
            opts = this._getRequestOpts(requestArgs, spec, overrideData);
          } catch (err) {
            reject(err);
            return;
          }
          function requestCallback(err, response) {
            if (err) {
              reject(err);
            } else {
              resolve(spec.transformResponseData ? spec.transformResponseData(response) : response);
            }
          }
          __name(requestCallback, "requestCallback");
          const emptyQuery = Object.keys(opts.queryData).length === 0;
          const path = [
            opts.requestPath,
            emptyQuery ? "" : "?",
            stringifyRequestData(opts.queryData)
          ].join("");
          const { headers, settings } = opts;
          this._stripe._requestSender._request(opts.requestMethod, opts.host, path, opts.bodyData, opts.auth, { headers, settings, streaming: opts.streaming }, opts.usage, requestCallback, (_a = this.requestDataProcessor) === null || _a === void 0 ? void 0 : _a.bind(this));
        });
      }
    };
  }
});

// ../node_modules/stripe/esm/resources/FinancialConnections/Accounts.js
var stripeMethod2, Accounts;
var init_Accounts = __esm({
  "../node_modules/stripe/esm/resources/FinancialConnections/Accounts.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod2 = StripeResource.method;
    Accounts = StripeResource.extend({
      retrieve: stripeMethod2({
        method: "GET",
        fullPath: "/v1/financial_connections/accounts/{account}"
      }),
      list: stripeMethod2({
        method: "GET",
        fullPath: "/v1/financial_connections/accounts",
        methodType: "list"
      }),
      disconnect: stripeMethod2({
        method: "POST",
        fullPath: "/v1/financial_connections/accounts/{account}/disconnect"
      }),
      listOwners: stripeMethod2({
        method: "GET",
        fullPath: "/v1/financial_connections/accounts/{account}/owners",
        methodType: "list"
      }),
      refresh: stripeMethod2({
        method: "POST",
        fullPath: "/v1/financial_connections/accounts/{account}/refresh"
      }),
      subscribe: stripeMethod2({
        method: "POST",
        fullPath: "/v1/financial_connections/accounts/{account}/subscribe"
      }),
      unsubscribe: stripeMethod2({
        method: "POST",
        fullPath: "/v1/financial_connections/accounts/{account}/unsubscribe"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Entitlements/ActiveEntitlements.js
var stripeMethod3, ActiveEntitlements;
var init_ActiveEntitlements = __esm({
  "../node_modules/stripe/esm/resources/Entitlements/ActiveEntitlements.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod3 = StripeResource.method;
    ActiveEntitlements = StripeResource.extend({
      retrieve: stripeMethod3({
        method: "GET",
        fullPath: "/v1/entitlements/active_entitlements/{id}"
      }),
      list: stripeMethod3({
        method: "GET",
        fullPath: "/v1/entitlements/active_entitlements",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Authorizations.js
var stripeMethod4, Authorizations;
var init_Authorizations = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Issuing/Authorizations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod4 = StripeResource.method;
    Authorizations = StripeResource.extend({
      create: stripeMethod4({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/authorizations"
      }),
      capture: stripeMethod4({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/capture"
      }),
      expire: stripeMethod4({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/expire"
      }),
      increment: stripeMethod4({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/increment"
      }),
      reverse: stripeMethod4({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/reverse"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/Authorizations.js
var stripeMethod5, Authorizations2;
var init_Authorizations2 = __esm({
  "../node_modules/stripe/esm/resources/Issuing/Authorizations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod5 = StripeResource.method;
    Authorizations2 = StripeResource.extend({
      retrieve: stripeMethod5({
        method: "GET",
        fullPath: "/v1/issuing/authorizations/{authorization}"
      }),
      update: stripeMethod5({
        method: "POST",
        fullPath: "/v1/issuing/authorizations/{authorization}"
      }),
      list: stripeMethod5({
        method: "GET",
        fullPath: "/v1/issuing/authorizations",
        methodType: "list"
      }),
      approve: stripeMethod5({
        method: "POST",
        fullPath: "/v1/issuing/authorizations/{authorization}/approve"
      }),
      decline: stripeMethod5({
        method: "POST",
        fullPath: "/v1/issuing/authorizations/{authorization}/decline"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Tax/Calculations.js
var stripeMethod6, Calculations;
var init_Calculations = __esm({
  "../node_modules/stripe/esm/resources/Tax/Calculations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod6 = StripeResource.method;
    Calculations = StripeResource.extend({
      create: stripeMethod6({ method: "POST", fullPath: "/v1/tax/calculations" }),
      listLineItems: stripeMethod6({
        method: "GET",
        fullPath: "/v1/tax/calculations/{calculation}/line_items",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/Cardholders.js
var stripeMethod7, Cardholders;
var init_Cardholders = __esm({
  "../node_modules/stripe/esm/resources/Issuing/Cardholders.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod7 = StripeResource.method;
    Cardholders = StripeResource.extend({
      create: stripeMethod7({ method: "POST", fullPath: "/v1/issuing/cardholders" }),
      retrieve: stripeMethod7({
        method: "GET",
        fullPath: "/v1/issuing/cardholders/{cardholder}"
      }),
      update: stripeMethod7({
        method: "POST",
        fullPath: "/v1/issuing/cardholders/{cardholder}"
      }),
      list: stripeMethod7({
        method: "GET",
        fullPath: "/v1/issuing/cardholders",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Cards.js
var stripeMethod8, Cards;
var init_Cards = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Issuing/Cards.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod8 = StripeResource.method;
    Cards = StripeResource.extend({
      deliverCard: stripeMethod8({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/deliver"
      }),
      failCard: stripeMethod8({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/fail"
      }),
      returnCard: stripeMethod8({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/return"
      }),
      shipCard: stripeMethod8({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/ship"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/Cards.js
var stripeMethod9, Cards2;
var init_Cards2 = __esm({
  "../node_modules/stripe/esm/resources/Issuing/Cards.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod9 = StripeResource.method;
    Cards2 = StripeResource.extend({
      create: stripeMethod9({ method: "POST", fullPath: "/v1/issuing/cards" }),
      retrieve: stripeMethod9({ method: "GET", fullPath: "/v1/issuing/cards/{card}" }),
      update: stripeMethod9({ method: "POST", fullPath: "/v1/issuing/cards/{card}" }),
      list: stripeMethod9({
        method: "GET",
        fullPath: "/v1/issuing/cards",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/BillingPortal/Configurations.js
var stripeMethod10, Configurations;
var init_Configurations = __esm({
  "../node_modules/stripe/esm/resources/BillingPortal/Configurations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod10 = StripeResource.method;
    Configurations = StripeResource.extend({
      create: stripeMethod10({
        method: "POST",
        fullPath: "/v1/billing_portal/configurations"
      }),
      retrieve: stripeMethod10({
        method: "GET",
        fullPath: "/v1/billing_portal/configurations/{configuration}"
      }),
      update: stripeMethod10({
        method: "POST",
        fullPath: "/v1/billing_portal/configurations/{configuration}"
      }),
      list: stripeMethod10({
        method: "GET",
        fullPath: "/v1/billing_portal/configurations",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Terminal/Configurations.js
var stripeMethod11, Configurations2;
var init_Configurations2 = __esm({
  "../node_modules/stripe/esm/resources/Terminal/Configurations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod11 = StripeResource.method;
    Configurations2 = StripeResource.extend({
      create: stripeMethod11({
        method: "POST",
        fullPath: "/v1/terminal/configurations"
      }),
      retrieve: stripeMethod11({
        method: "GET",
        fullPath: "/v1/terminal/configurations/{configuration}"
      }),
      update: stripeMethod11({
        method: "POST",
        fullPath: "/v1/terminal/configurations/{configuration}"
      }),
      list: stripeMethod11({
        method: "GET",
        fullPath: "/v1/terminal/configurations",
        methodType: "list"
      }),
      del: stripeMethod11({
        method: "DELETE",
        fullPath: "/v1/terminal/configurations/{configuration}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/ConfirmationTokens.js
var stripeMethod12, ConfirmationTokens;
var init_ConfirmationTokens = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/ConfirmationTokens.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod12 = StripeResource.method;
    ConfirmationTokens = StripeResource.extend({
      create: stripeMethod12({
        method: "POST",
        fullPath: "/v1/test_helpers/confirmation_tokens"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Terminal/ConnectionTokens.js
var stripeMethod13, ConnectionTokens;
var init_ConnectionTokens = __esm({
  "../node_modules/stripe/esm/resources/Terminal/ConnectionTokens.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod13 = StripeResource.method;
    ConnectionTokens = StripeResource.extend({
      create: stripeMethod13({
        method: "POST",
        fullPath: "/v1/terminal/connection_tokens"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/CreditReversals.js
var stripeMethod14, CreditReversals;
var init_CreditReversals = __esm({
  "../node_modules/stripe/esm/resources/Treasury/CreditReversals.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod14 = StripeResource.method;
    CreditReversals = StripeResource.extend({
      create: stripeMethod14({
        method: "POST",
        fullPath: "/v1/treasury/credit_reversals"
      }),
      retrieve: stripeMethod14({
        method: "GET",
        fullPath: "/v1/treasury/credit_reversals/{credit_reversal}"
      }),
      list: stripeMethod14({
        method: "GET",
        fullPath: "/v1/treasury/credit_reversals",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Customers.js
var stripeMethod15, Customers;
var init_Customers = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Customers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod15 = StripeResource.method;
    Customers = StripeResource.extend({
      fundCashBalance: stripeMethod15({
        method: "POST",
        fullPath: "/v1/test_helpers/customers/{customer}/fund_cash_balance"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/DebitReversals.js
var stripeMethod16, DebitReversals;
var init_DebitReversals = __esm({
  "../node_modules/stripe/esm/resources/Treasury/DebitReversals.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod16 = StripeResource.method;
    DebitReversals = StripeResource.extend({
      create: stripeMethod16({
        method: "POST",
        fullPath: "/v1/treasury/debit_reversals"
      }),
      retrieve: stripeMethod16({
        method: "GET",
        fullPath: "/v1/treasury/debit_reversals/{debit_reversal}"
      }),
      list: stripeMethod16({
        method: "GET",
        fullPath: "/v1/treasury/debit_reversals",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/Disputes.js
var stripeMethod17, Disputes;
var init_Disputes = __esm({
  "../node_modules/stripe/esm/resources/Issuing/Disputes.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod17 = StripeResource.method;
    Disputes = StripeResource.extend({
      create: stripeMethod17({ method: "POST", fullPath: "/v1/issuing/disputes" }),
      retrieve: stripeMethod17({
        method: "GET",
        fullPath: "/v1/issuing/disputes/{dispute}"
      }),
      update: stripeMethod17({
        method: "POST",
        fullPath: "/v1/issuing/disputes/{dispute}"
      }),
      list: stripeMethod17({
        method: "GET",
        fullPath: "/v1/issuing/disputes",
        methodType: "list"
      }),
      submit: stripeMethod17({
        method: "POST",
        fullPath: "/v1/issuing/disputes/{dispute}/submit"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Radar/EarlyFraudWarnings.js
var stripeMethod18, EarlyFraudWarnings;
var init_EarlyFraudWarnings = __esm({
  "../node_modules/stripe/esm/resources/Radar/EarlyFraudWarnings.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod18 = StripeResource.method;
    EarlyFraudWarnings = StripeResource.extend({
      retrieve: stripeMethod18({
        method: "GET",
        fullPath: "/v1/radar/early_fraud_warnings/{early_fraud_warning}"
      }),
      list: stripeMethod18({
        method: "GET",
        fullPath: "/v1/radar/early_fraud_warnings",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Entitlements/Features.js
var stripeMethod19, Features;
var init_Features = __esm({
  "../node_modules/stripe/esm/resources/Entitlements/Features.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod19 = StripeResource.method;
    Features = StripeResource.extend({
      create: stripeMethod19({ method: "POST", fullPath: "/v1/entitlements/features" }),
      retrieve: stripeMethod19({
        method: "GET",
        fullPath: "/v1/entitlements/features/{id}"
      }),
      update: stripeMethod19({
        method: "POST",
        fullPath: "/v1/entitlements/features/{id}"
      }),
      list: stripeMethod19({
        method: "GET",
        fullPath: "/v1/entitlements/features",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/FinancialAccounts.js
var stripeMethod20, FinancialAccounts;
var init_FinancialAccounts = __esm({
  "../node_modules/stripe/esm/resources/Treasury/FinancialAccounts.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod20 = StripeResource.method;
    FinancialAccounts = StripeResource.extend({
      create: stripeMethod20({
        method: "POST",
        fullPath: "/v1/treasury/financial_accounts"
      }),
      retrieve: stripeMethod20({
        method: "GET",
        fullPath: "/v1/treasury/financial_accounts/{financial_account}"
      }),
      update: stripeMethod20({
        method: "POST",
        fullPath: "/v1/treasury/financial_accounts/{financial_account}"
      }),
      list: stripeMethod20({
        method: "GET",
        fullPath: "/v1/treasury/financial_accounts",
        methodType: "list"
      }),
      retrieveFeatures: stripeMethod20({
        method: "GET",
        fullPath: "/v1/treasury/financial_accounts/{financial_account}/features"
      }),
      updateFeatures: stripeMethod20({
        method: "POST",
        fullPath: "/v1/treasury/financial_accounts/{financial_account}/features"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/InboundTransfers.js
var stripeMethod21, InboundTransfers;
var init_InboundTransfers = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Treasury/InboundTransfers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod21 = StripeResource.method;
    InboundTransfers = StripeResource.extend({
      fail: stripeMethod21({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/fail"
      }),
      returnInboundTransfer: stripeMethod21({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/return"
      }),
      succeed: stripeMethod21({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/succeed"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/InboundTransfers.js
var stripeMethod22, InboundTransfers2;
var init_InboundTransfers2 = __esm({
  "../node_modules/stripe/esm/resources/Treasury/InboundTransfers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod22 = StripeResource.method;
    InboundTransfers2 = StripeResource.extend({
      create: stripeMethod22({
        method: "POST",
        fullPath: "/v1/treasury/inbound_transfers"
      }),
      retrieve: stripeMethod22({
        method: "GET",
        fullPath: "/v1/treasury/inbound_transfers/{id}"
      }),
      list: stripeMethod22({
        method: "GET",
        fullPath: "/v1/treasury/inbound_transfers",
        methodType: "list"
      }),
      cancel: stripeMethod22({
        method: "POST",
        fullPath: "/v1/treasury/inbound_transfers/{inbound_transfer}/cancel"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Terminal/Locations.js
var stripeMethod23, Locations;
var init_Locations = __esm({
  "../node_modules/stripe/esm/resources/Terminal/Locations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod23 = StripeResource.method;
    Locations = StripeResource.extend({
      create: stripeMethod23({ method: "POST", fullPath: "/v1/terminal/locations" }),
      retrieve: stripeMethod23({
        method: "GET",
        fullPath: "/v1/terminal/locations/{location}"
      }),
      update: stripeMethod23({
        method: "POST",
        fullPath: "/v1/terminal/locations/{location}"
      }),
      list: stripeMethod23({
        method: "GET",
        fullPath: "/v1/terminal/locations",
        methodType: "list"
      }),
      del: stripeMethod23({
        method: "DELETE",
        fullPath: "/v1/terminal/locations/{location}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Billing/MeterEventAdjustments.js
var stripeMethod24, MeterEventAdjustments;
var init_MeterEventAdjustments = __esm({
  "../node_modules/stripe/esm/resources/Billing/MeterEventAdjustments.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod24 = StripeResource.method;
    MeterEventAdjustments = StripeResource.extend({
      create: stripeMethod24({
        method: "POST",
        fullPath: "/v1/billing/meter_event_adjustments"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Billing/MeterEvents.js
var stripeMethod25, MeterEvents;
var init_MeterEvents = __esm({
  "../node_modules/stripe/esm/resources/Billing/MeterEvents.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod25 = StripeResource.method;
    MeterEvents = StripeResource.extend({
      create: stripeMethod25({ method: "POST", fullPath: "/v1/billing/meter_events" })
    });
  }
});

// ../node_modules/stripe/esm/resources/Billing/Meters.js
var stripeMethod26, Meters;
var init_Meters = __esm({
  "../node_modules/stripe/esm/resources/Billing/Meters.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod26 = StripeResource.method;
    Meters = StripeResource.extend({
      create: stripeMethod26({ method: "POST", fullPath: "/v1/billing/meters" }),
      retrieve: stripeMethod26({ method: "GET", fullPath: "/v1/billing/meters/{id}" }),
      update: stripeMethod26({ method: "POST", fullPath: "/v1/billing/meters/{id}" }),
      list: stripeMethod26({
        method: "GET",
        fullPath: "/v1/billing/meters",
        methodType: "list"
      }),
      deactivate: stripeMethod26({
        method: "POST",
        fullPath: "/v1/billing/meters/{id}/deactivate"
      }),
      listEventSummaries: stripeMethod26({
        method: "GET",
        fullPath: "/v1/billing/meters/{id}/event_summaries",
        methodType: "list"
      }),
      reactivate: stripeMethod26({
        method: "POST",
        fullPath: "/v1/billing/meters/{id}/reactivate"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Climate/Orders.js
var stripeMethod27, Orders;
var init_Orders = __esm({
  "../node_modules/stripe/esm/resources/Climate/Orders.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod27 = StripeResource.method;
    Orders = StripeResource.extend({
      create: stripeMethod27({ method: "POST", fullPath: "/v1/climate/orders" }),
      retrieve: stripeMethod27({
        method: "GET",
        fullPath: "/v1/climate/orders/{order}"
      }),
      update: stripeMethod27({
        method: "POST",
        fullPath: "/v1/climate/orders/{order}"
      }),
      list: stripeMethod27({
        method: "GET",
        fullPath: "/v1/climate/orders",
        methodType: "list"
      }),
      cancel: stripeMethod27({
        method: "POST",
        fullPath: "/v1/climate/orders/{order}/cancel"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundPayments.js
var stripeMethod28, OutboundPayments;
var init_OutboundPayments = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundPayments.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod28 = StripeResource.method;
    OutboundPayments = StripeResource.extend({
      fail: stripeMethod28({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/fail"
      }),
      post: stripeMethod28({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/post"
      }),
      returnOutboundPayment: stripeMethod28({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/return"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/OutboundPayments.js
var stripeMethod29, OutboundPayments2;
var init_OutboundPayments2 = __esm({
  "../node_modules/stripe/esm/resources/Treasury/OutboundPayments.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod29 = StripeResource.method;
    OutboundPayments2 = StripeResource.extend({
      create: stripeMethod29({
        method: "POST",
        fullPath: "/v1/treasury/outbound_payments"
      }),
      retrieve: stripeMethod29({
        method: "GET",
        fullPath: "/v1/treasury/outbound_payments/{id}"
      }),
      list: stripeMethod29({
        method: "GET",
        fullPath: "/v1/treasury/outbound_payments",
        methodType: "list"
      }),
      cancel: stripeMethod29({
        method: "POST",
        fullPath: "/v1/treasury/outbound_payments/{id}/cancel"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundTransfers.js
var stripeMethod30, OutboundTransfers;
var init_OutboundTransfers = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundTransfers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod30 = StripeResource.method;
    OutboundTransfers = StripeResource.extend({
      fail: stripeMethod30({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/fail"
      }),
      post: stripeMethod30({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/post"
      }),
      returnOutboundTransfer: stripeMethod30({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/return"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/OutboundTransfers.js
var stripeMethod31, OutboundTransfers2;
var init_OutboundTransfers2 = __esm({
  "../node_modules/stripe/esm/resources/Treasury/OutboundTransfers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod31 = StripeResource.method;
    OutboundTransfers2 = StripeResource.extend({
      create: stripeMethod31({
        method: "POST",
        fullPath: "/v1/treasury/outbound_transfers"
      }),
      retrieve: stripeMethod31({
        method: "GET",
        fullPath: "/v1/treasury/outbound_transfers/{outbound_transfer}"
      }),
      list: stripeMethod31({
        method: "GET",
        fullPath: "/v1/treasury/outbound_transfers",
        methodType: "list"
      }),
      cancel: stripeMethod31({
        method: "POST",
        fullPath: "/v1/treasury/outbound_transfers/{outbound_transfer}/cancel"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/PersonalizationDesigns.js
var stripeMethod32, PersonalizationDesigns;
var init_PersonalizationDesigns = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Issuing/PersonalizationDesigns.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod32 = StripeResource.method;
    PersonalizationDesigns = StripeResource.extend({
      activate: stripeMethod32({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/activate"
      }),
      deactivate: stripeMethod32({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/deactivate"
      }),
      reject: stripeMethod32({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/reject"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/PersonalizationDesigns.js
var stripeMethod33, PersonalizationDesigns2;
var init_PersonalizationDesigns2 = __esm({
  "../node_modules/stripe/esm/resources/Issuing/PersonalizationDesigns.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod33 = StripeResource.method;
    PersonalizationDesigns2 = StripeResource.extend({
      create: stripeMethod33({
        method: "POST",
        fullPath: "/v1/issuing/personalization_designs"
      }),
      retrieve: stripeMethod33({
        method: "GET",
        fullPath: "/v1/issuing/personalization_designs/{personalization_design}"
      }),
      update: stripeMethod33({
        method: "POST",
        fullPath: "/v1/issuing/personalization_designs/{personalization_design}"
      }),
      list: stripeMethod33({
        method: "GET",
        fullPath: "/v1/issuing/personalization_designs",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/PhysicalBundles.js
var stripeMethod34, PhysicalBundles;
var init_PhysicalBundles = __esm({
  "../node_modules/stripe/esm/resources/Issuing/PhysicalBundles.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod34 = StripeResource.method;
    PhysicalBundles = StripeResource.extend({
      retrieve: stripeMethod34({
        method: "GET",
        fullPath: "/v1/issuing/physical_bundles/{physical_bundle}"
      }),
      list: stripeMethod34({
        method: "GET",
        fullPath: "/v1/issuing/physical_bundles",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Climate/Products.js
var stripeMethod35, Products;
var init_Products = __esm({
  "../node_modules/stripe/esm/resources/Climate/Products.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod35 = StripeResource.method;
    Products = StripeResource.extend({
      retrieve: stripeMethod35({
        method: "GET",
        fullPath: "/v1/climate/products/{product}"
      }),
      list: stripeMethod35({
        method: "GET",
        fullPath: "/v1/climate/products",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Terminal/Readers.js
var stripeMethod36, Readers;
var init_Readers = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Terminal/Readers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod36 = StripeResource.method;
    Readers = StripeResource.extend({
      presentPaymentMethod: stripeMethod36({
        method: "POST",
        fullPath: "/v1/test_helpers/terminal/readers/{reader}/present_payment_method"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Terminal/Readers.js
var stripeMethod37, Readers2;
var init_Readers2 = __esm({
  "../node_modules/stripe/esm/resources/Terminal/Readers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod37 = StripeResource.method;
    Readers2 = StripeResource.extend({
      create: stripeMethod37({ method: "POST", fullPath: "/v1/terminal/readers" }),
      retrieve: stripeMethod37({
        method: "GET",
        fullPath: "/v1/terminal/readers/{reader}"
      }),
      update: stripeMethod37({
        method: "POST",
        fullPath: "/v1/terminal/readers/{reader}"
      }),
      list: stripeMethod37({
        method: "GET",
        fullPath: "/v1/terminal/readers",
        methodType: "list"
      }),
      del: stripeMethod37({
        method: "DELETE",
        fullPath: "/v1/terminal/readers/{reader}"
      }),
      cancelAction: stripeMethod37({
        method: "POST",
        fullPath: "/v1/terminal/readers/{reader}/cancel_action"
      }),
      processPaymentIntent: stripeMethod37({
        method: "POST",
        fullPath: "/v1/terminal/readers/{reader}/process_payment_intent"
      }),
      processSetupIntent: stripeMethod37({
        method: "POST",
        fullPath: "/v1/terminal/readers/{reader}/process_setup_intent"
      }),
      refundPayment: stripeMethod37({
        method: "POST",
        fullPath: "/v1/terminal/readers/{reader}/refund_payment"
      }),
      setReaderDisplay: stripeMethod37({
        method: "POST",
        fullPath: "/v1/terminal/readers/{reader}/set_reader_display"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedCredits.js
var stripeMethod38, ReceivedCredits;
var init_ReceivedCredits = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedCredits.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod38 = StripeResource.method;
    ReceivedCredits = StripeResource.extend({
      create: stripeMethod38({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/received_credits"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/ReceivedCredits.js
var stripeMethod39, ReceivedCredits2;
var init_ReceivedCredits2 = __esm({
  "../node_modules/stripe/esm/resources/Treasury/ReceivedCredits.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod39 = StripeResource.method;
    ReceivedCredits2 = StripeResource.extend({
      retrieve: stripeMethod39({
        method: "GET",
        fullPath: "/v1/treasury/received_credits/{id}"
      }),
      list: stripeMethod39({
        method: "GET",
        fullPath: "/v1/treasury/received_credits",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedDebits.js
var stripeMethod40, ReceivedDebits;
var init_ReceivedDebits = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedDebits.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod40 = StripeResource.method;
    ReceivedDebits = StripeResource.extend({
      create: stripeMethod40({
        method: "POST",
        fullPath: "/v1/test_helpers/treasury/received_debits"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/ReceivedDebits.js
var stripeMethod41, ReceivedDebits2;
var init_ReceivedDebits2 = __esm({
  "../node_modules/stripe/esm/resources/Treasury/ReceivedDebits.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod41 = StripeResource.method;
    ReceivedDebits2 = StripeResource.extend({
      retrieve: stripeMethod41({
        method: "GET",
        fullPath: "/v1/treasury/received_debits/{id}"
      }),
      list: stripeMethod41({
        method: "GET",
        fullPath: "/v1/treasury/received_debits",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Refunds.js
var stripeMethod42, Refunds;
var init_Refunds = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Refunds.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod42 = StripeResource.method;
    Refunds = StripeResource.extend({
      expire: stripeMethod42({
        method: "POST",
        fullPath: "/v1/test_helpers/refunds/{refund}/expire"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Tax/Registrations.js
var stripeMethod43, Registrations;
var init_Registrations = __esm({
  "../node_modules/stripe/esm/resources/Tax/Registrations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod43 = StripeResource.method;
    Registrations = StripeResource.extend({
      create: stripeMethod43({ method: "POST", fullPath: "/v1/tax/registrations" }),
      retrieve: stripeMethod43({
        method: "GET",
        fullPath: "/v1/tax/registrations/{id}"
      }),
      update: stripeMethod43({
        method: "POST",
        fullPath: "/v1/tax/registrations/{id}"
      }),
      list: stripeMethod43({
        method: "GET",
        fullPath: "/v1/tax/registrations",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Reporting/ReportRuns.js
var stripeMethod44, ReportRuns;
var init_ReportRuns = __esm({
  "../node_modules/stripe/esm/resources/Reporting/ReportRuns.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod44 = StripeResource.method;
    ReportRuns = StripeResource.extend({
      create: stripeMethod44({ method: "POST", fullPath: "/v1/reporting/report_runs" }),
      retrieve: stripeMethod44({
        method: "GET",
        fullPath: "/v1/reporting/report_runs/{report_run}"
      }),
      list: stripeMethod44({
        method: "GET",
        fullPath: "/v1/reporting/report_runs",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Reporting/ReportTypes.js
var stripeMethod45, ReportTypes;
var init_ReportTypes = __esm({
  "../node_modules/stripe/esm/resources/Reporting/ReportTypes.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod45 = StripeResource.method;
    ReportTypes = StripeResource.extend({
      retrieve: stripeMethod45({
        method: "GET",
        fullPath: "/v1/reporting/report_types/{report_type}"
      }),
      list: stripeMethod45({
        method: "GET",
        fullPath: "/v1/reporting/report_types",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Forwarding/Requests.js
var stripeMethod46, Requests;
var init_Requests = __esm({
  "../node_modules/stripe/esm/resources/Forwarding/Requests.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod46 = StripeResource.method;
    Requests = StripeResource.extend({
      create: stripeMethod46({ method: "POST", fullPath: "/v1/forwarding/requests" }),
      retrieve: stripeMethod46({
        method: "GET",
        fullPath: "/v1/forwarding/requests/{id}"
      }),
      list: stripeMethod46({
        method: "GET",
        fullPath: "/v1/forwarding/requests",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Sigma/ScheduledQueryRuns.js
var stripeMethod47, ScheduledQueryRuns;
var init_ScheduledQueryRuns = __esm({
  "../node_modules/stripe/esm/resources/Sigma/ScheduledQueryRuns.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod47 = StripeResource.method;
    ScheduledQueryRuns = StripeResource.extend({
      retrieve: stripeMethod47({
        method: "GET",
        fullPath: "/v1/sigma/scheduled_query_runs/{scheduled_query_run}"
      }),
      list: stripeMethod47({
        method: "GET",
        fullPath: "/v1/sigma/scheduled_query_runs",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Apps/Secrets.js
var stripeMethod48, Secrets;
var init_Secrets = __esm({
  "../node_modules/stripe/esm/resources/Apps/Secrets.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod48 = StripeResource.method;
    Secrets = StripeResource.extend({
      create: stripeMethod48({ method: "POST", fullPath: "/v1/apps/secrets" }),
      list: stripeMethod48({
        method: "GET",
        fullPath: "/v1/apps/secrets",
        methodType: "list"
      }),
      deleteWhere: stripeMethod48({
        method: "POST",
        fullPath: "/v1/apps/secrets/delete"
      }),
      find: stripeMethod48({ method: "GET", fullPath: "/v1/apps/secrets/find" })
    });
  }
});

// ../node_modules/stripe/esm/resources/BillingPortal/Sessions.js
var stripeMethod49, Sessions;
var init_Sessions = __esm({
  "../node_modules/stripe/esm/resources/BillingPortal/Sessions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod49 = StripeResource.method;
    Sessions = StripeResource.extend({
      create: stripeMethod49({
        method: "POST",
        fullPath: "/v1/billing_portal/sessions"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Checkout/Sessions.js
var stripeMethod50, Sessions2;
var init_Sessions2 = __esm({
  "../node_modules/stripe/esm/resources/Checkout/Sessions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod50 = StripeResource.method;
    Sessions2 = StripeResource.extend({
      create: stripeMethod50({ method: "POST", fullPath: "/v1/checkout/sessions" }),
      retrieve: stripeMethod50({
        method: "GET",
        fullPath: "/v1/checkout/sessions/{session}"
      }),
      list: stripeMethod50({
        method: "GET",
        fullPath: "/v1/checkout/sessions",
        methodType: "list"
      }),
      expire: stripeMethod50({
        method: "POST",
        fullPath: "/v1/checkout/sessions/{session}/expire"
      }),
      listLineItems: stripeMethod50({
        method: "GET",
        fullPath: "/v1/checkout/sessions/{session}/line_items",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/FinancialConnections/Sessions.js
var stripeMethod51, Sessions3;
var init_Sessions3 = __esm({
  "../node_modules/stripe/esm/resources/FinancialConnections/Sessions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod51 = StripeResource.method;
    Sessions3 = StripeResource.extend({
      create: stripeMethod51({
        method: "POST",
        fullPath: "/v1/financial_connections/sessions"
      }),
      retrieve: stripeMethod51({
        method: "GET",
        fullPath: "/v1/financial_connections/sessions/{session}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Tax/Settings.js
var stripeMethod52, Settings;
var init_Settings = __esm({
  "../node_modules/stripe/esm/resources/Tax/Settings.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod52 = StripeResource.method;
    Settings = StripeResource.extend({
      retrieve: stripeMethod52({ method: "GET", fullPath: "/v1/tax/settings" }),
      update: stripeMethod52({ method: "POST", fullPath: "/v1/tax/settings" })
    });
  }
});

// ../node_modules/stripe/esm/resources/Climate/Suppliers.js
var stripeMethod53, Suppliers;
var init_Suppliers = __esm({
  "../node_modules/stripe/esm/resources/Climate/Suppliers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod53 = StripeResource.method;
    Suppliers = StripeResource.extend({
      retrieve: stripeMethod53({
        method: "GET",
        fullPath: "/v1/climate/suppliers/{supplier}"
      }),
      list: stripeMethod53({
        method: "GET",
        fullPath: "/v1/climate/suppliers",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/TestClocks.js
var stripeMethod54, TestClocks;
var init_TestClocks = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/TestClocks.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod54 = StripeResource.method;
    TestClocks = StripeResource.extend({
      create: stripeMethod54({
        method: "POST",
        fullPath: "/v1/test_helpers/test_clocks"
      }),
      retrieve: stripeMethod54({
        method: "GET",
        fullPath: "/v1/test_helpers/test_clocks/{test_clock}"
      }),
      list: stripeMethod54({
        method: "GET",
        fullPath: "/v1/test_helpers/test_clocks",
        methodType: "list"
      }),
      del: stripeMethod54({
        method: "DELETE",
        fullPath: "/v1/test_helpers/test_clocks/{test_clock}"
      }),
      advance: stripeMethod54({
        method: "POST",
        fullPath: "/v1/test_helpers/test_clocks/{test_clock}/advance"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/Tokens.js
var stripeMethod55, Tokens;
var init_Tokens = __esm({
  "../node_modules/stripe/esm/resources/Issuing/Tokens.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod55 = StripeResource.method;
    Tokens = StripeResource.extend({
      retrieve: stripeMethod55({
        method: "GET",
        fullPath: "/v1/issuing/tokens/{token}"
      }),
      update: stripeMethod55({
        method: "POST",
        fullPath: "/v1/issuing/tokens/{token}"
      }),
      list: stripeMethod55({
        method: "GET",
        fullPath: "/v1/issuing/tokens",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/TransactionEntries.js
var stripeMethod56, TransactionEntries;
var init_TransactionEntries = __esm({
  "../node_modules/stripe/esm/resources/Treasury/TransactionEntries.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod56 = StripeResource.method;
    TransactionEntries = StripeResource.extend({
      retrieve: stripeMethod56({
        method: "GET",
        fullPath: "/v1/treasury/transaction_entries/{id}"
      }),
      list: stripeMethod56({
        method: "GET",
        fullPath: "/v1/treasury/transaction_entries",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Transactions.js
var stripeMethod57, Transactions;
var init_Transactions = __esm({
  "../node_modules/stripe/esm/resources/TestHelpers/Issuing/Transactions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod57 = StripeResource.method;
    Transactions = StripeResource.extend({
      createForceCapture: stripeMethod57({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/transactions/create_force_capture"
      }),
      createUnlinkedRefund: stripeMethod57({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/transactions/create_unlinked_refund"
      }),
      refund: stripeMethod57({
        method: "POST",
        fullPath: "/v1/test_helpers/issuing/transactions/{transaction}/refund"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/FinancialConnections/Transactions.js
var stripeMethod58, Transactions2;
var init_Transactions2 = __esm({
  "../node_modules/stripe/esm/resources/FinancialConnections/Transactions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod58 = StripeResource.method;
    Transactions2 = StripeResource.extend({
      retrieve: stripeMethod58({
        method: "GET",
        fullPath: "/v1/financial_connections/transactions/{transaction}"
      }),
      list: stripeMethod58({
        method: "GET",
        fullPath: "/v1/financial_connections/transactions",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Issuing/Transactions.js
var stripeMethod59, Transactions3;
var init_Transactions3 = __esm({
  "../node_modules/stripe/esm/resources/Issuing/Transactions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod59 = StripeResource.method;
    Transactions3 = StripeResource.extend({
      retrieve: stripeMethod59({
        method: "GET",
        fullPath: "/v1/issuing/transactions/{transaction}"
      }),
      update: stripeMethod59({
        method: "POST",
        fullPath: "/v1/issuing/transactions/{transaction}"
      }),
      list: stripeMethod59({
        method: "GET",
        fullPath: "/v1/issuing/transactions",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Tax/Transactions.js
var stripeMethod60, Transactions4;
var init_Transactions4 = __esm({
  "../node_modules/stripe/esm/resources/Tax/Transactions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod60 = StripeResource.method;
    Transactions4 = StripeResource.extend({
      retrieve: stripeMethod60({
        method: "GET",
        fullPath: "/v1/tax/transactions/{transaction}"
      }),
      createFromCalculation: stripeMethod60({
        method: "POST",
        fullPath: "/v1/tax/transactions/create_from_calculation"
      }),
      createReversal: stripeMethod60({
        method: "POST",
        fullPath: "/v1/tax/transactions/create_reversal"
      }),
      listLineItems: stripeMethod60({
        method: "GET",
        fullPath: "/v1/tax/transactions/{transaction}/line_items",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Treasury/Transactions.js
var stripeMethod61, Transactions5;
var init_Transactions5 = __esm({
  "../node_modules/stripe/esm/resources/Treasury/Transactions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod61 = StripeResource.method;
    Transactions5 = StripeResource.extend({
      retrieve: stripeMethod61({
        method: "GET",
        fullPath: "/v1/treasury/transactions/{id}"
      }),
      list: stripeMethod61({
        method: "GET",
        fullPath: "/v1/treasury/transactions",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Radar/ValueListItems.js
var stripeMethod62, ValueListItems;
var init_ValueListItems = __esm({
  "../node_modules/stripe/esm/resources/Radar/ValueListItems.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod62 = StripeResource.method;
    ValueListItems = StripeResource.extend({
      create: stripeMethod62({
        method: "POST",
        fullPath: "/v1/radar/value_list_items"
      }),
      retrieve: stripeMethod62({
        method: "GET",
        fullPath: "/v1/radar/value_list_items/{item}"
      }),
      list: stripeMethod62({
        method: "GET",
        fullPath: "/v1/radar/value_list_items",
        methodType: "list"
      }),
      del: stripeMethod62({
        method: "DELETE",
        fullPath: "/v1/radar/value_list_items/{item}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Radar/ValueLists.js
var stripeMethod63, ValueLists;
var init_ValueLists = __esm({
  "../node_modules/stripe/esm/resources/Radar/ValueLists.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod63 = StripeResource.method;
    ValueLists = StripeResource.extend({
      create: stripeMethod63({ method: "POST", fullPath: "/v1/radar/value_lists" }),
      retrieve: stripeMethod63({
        method: "GET",
        fullPath: "/v1/radar/value_lists/{value_list}"
      }),
      update: stripeMethod63({
        method: "POST",
        fullPath: "/v1/radar/value_lists/{value_list}"
      }),
      list: stripeMethod63({
        method: "GET",
        fullPath: "/v1/radar/value_lists",
        methodType: "list"
      }),
      del: stripeMethod63({
        method: "DELETE",
        fullPath: "/v1/radar/value_lists/{value_list}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Identity/VerificationReports.js
var stripeMethod64, VerificationReports;
var init_VerificationReports = __esm({
  "../node_modules/stripe/esm/resources/Identity/VerificationReports.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod64 = StripeResource.method;
    VerificationReports = StripeResource.extend({
      retrieve: stripeMethod64({
        method: "GET",
        fullPath: "/v1/identity/verification_reports/{report}"
      }),
      list: stripeMethod64({
        method: "GET",
        fullPath: "/v1/identity/verification_reports",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Identity/VerificationSessions.js
var stripeMethod65, VerificationSessions;
var init_VerificationSessions = __esm({
  "../node_modules/stripe/esm/resources/Identity/VerificationSessions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod65 = StripeResource.method;
    VerificationSessions = StripeResource.extend({
      create: stripeMethod65({
        method: "POST",
        fullPath: "/v1/identity/verification_sessions"
      }),
      retrieve: stripeMethod65({
        method: "GET",
        fullPath: "/v1/identity/verification_sessions/{session}"
      }),
      update: stripeMethod65({
        method: "POST",
        fullPath: "/v1/identity/verification_sessions/{session}"
      }),
      list: stripeMethod65({
        method: "GET",
        fullPath: "/v1/identity/verification_sessions",
        methodType: "list"
      }),
      cancel: stripeMethod65({
        method: "POST",
        fullPath: "/v1/identity/verification_sessions/{session}/cancel"
      }),
      redact: stripeMethod65({
        method: "POST",
        fullPath: "/v1/identity/verification_sessions/{session}/redact"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Accounts.js
var stripeMethod66, Accounts2;
var init_Accounts2 = __esm({
  "../node_modules/stripe/esm/resources/Accounts.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod66 = StripeResource.method;
    Accounts2 = StripeResource.extend({
      create: stripeMethod66({ method: "POST", fullPath: "/v1/accounts" }),
      retrieve(id, ...args) {
        if (typeof id === "string") {
          return stripeMethod66({
            method: "GET",
            fullPath: "/v1/accounts/{id}"
          }).apply(this, [id, ...args]);
        } else {
          if (id === null || id === void 0) {
            [].shift.apply([id, ...args]);
          }
          return stripeMethod66({
            method: "GET",
            fullPath: "/v1/account"
          }).apply(this, [id, ...args]);
        }
      },
      update: stripeMethod66({ method: "POST", fullPath: "/v1/accounts/{account}" }),
      list: stripeMethod66({
        method: "GET",
        fullPath: "/v1/accounts",
        methodType: "list"
      }),
      del: stripeMethod66({ method: "DELETE", fullPath: "/v1/accounts/{account}" }),
      createExternalAccount: stripeMethod66({
        method: "POST",
        fullPath: "/v1/accounts/{account}/external_accounts"
      }),
      createLoginLink: stripeMethod66({
        method: "POST",
        fullPath: "/v1/accounts/{account}/login_links"
      }),
      createPerson: stripeMethod66({
        method: "POST",
        fullPath: "/v1/accounts/{account}/persons"
      }),
      deleteExternalAccount: stripeMethod66({
        method: "DELETE",
        fullPath: "/v1/accounts/{account}/external_accounts/{id}"
      }),
      deletePerson: stripeMethod66({
        method: "DELETE",
        fullPath: "/v1/accounts/{account}/persons/{person}"
      }),
      listCapabilities: stripeMethod66({
        method: "GET",
        fullPath: "/v1/accounts/{account}/capabilities",
        methodType: "list"
      }),
      listExternalAccounts: stripeMethod66({
        method: "GET",
        fullPath: "/v1/accounts/{account}/external_accounts",
        methodType: "list"
      }),
      listPersons: stripeMethod66({
        method: "GET",
        fullPath: "/v1/accounts/{account}/persons",
        methodType: "list"
      }),
      reject: stripeMethod66({
        method: "POST",
        fullPath: "/v1/accounts/{account}/reject"
      }),
      retrieveCurrent: stripeMethod66({ method: "GET", fullPath: "/v1/account" }),
      retrieveCapability: stripeMethod66({
        method: "GET",
        fullPath: "/v1/accounts/{account}/capabilities/{capability}"
      }),
      retrieveExternalAccount: stripeMethod66({
        method: "GET",
        fullPath: "/v1/accounts/{account}/external_accounts/{id}"
      }),
      retrievePerson: stripeMethod66({
        method: "GET",
        fullPath: "/v1/accounts/{account}/persons/{person}"
      }),
      updateCapability: stripeMethod66({
        method: "POST",
        fullPath: "/v1/accounts/{account}/capabilities/{capability}"
      }),
      updateExternalAccount: stripeMethod66({
        method: "POST",
        fullPath: "/v1/accounts/{account}/external_accounts/{id}"
      }),
      updatePerson: stripeMethod66({
        method: "POST",
        fullPath: "/v1/accounts/{account}/persons/{person}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/AccountLinks.js
var stripeMethod67, AccountLinks;
var init_AccountLinks = __esm({
  "../node_modules/stripe/esm/resources/AccountLinks.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod67 = StripeResource.method;
    AccountLinks = StripeResource.extend({
      create: stripeMethod67({ method: "POST", fullPath: "/v1/account_links" })
    });
  }
});

// ../node_modules/stripe/esm/resources/AccountSessions.js
var stripeMethod68, AccountSessions;
var init_AccountSessions = __esm({
  "../node_modules/stripe/esm/resources/AccountSessions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod68 = StripeResource.method;
    AccountSessions = StripeResource.extend({
      create: stripeMethod68({ method: "POST", fullPath: "/v1/account_sessions" })
    });
  }
});

// ../node_modules/stripe/esm/resources/ApplePayDomains.js
var stripeMethod69, ApplePayDomains;
var init_ApplePayDomains = __esm({
  "../node_modules/stripe/esm/resources/ApplePayDomains.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod69 = StripeResource.method;
    ApplePayDomains = StripeResource.extend({
      create: stripeMethod69({ method: "POST", fullPath: "/v1/apple_pay/domains" }),
      retrieve: stripeMethod69({
        method: "GET",
        fullPath: "/v1/apple_pay/domains/{domain}"
      }),
      list: stripeMethod69({
        method: "GET",
        fullPath: "/v1/apple_pay/domains",
        methodType: "list"
      }),
      del: stripeMethod69({
        method: "DELETE",
        fullPath: "/v1/apple_pay/domains/{domain}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/ApplicationFees.js
var stripeMethod70, ApplicationFees;
var init_ApplicationFees = __esm({
  "../node_modules/stripe/esm/resources/ApplicationFees.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod70 = StripeResource.method;
    ApplicationFees = StripeResource.extend({
      retrieve: stripeMethod70({
        method: "GET",
        fullPath: "/v1/application_fees/{id}"
      }),
      list: stripeMethod70({
        method: "GET",
        fullPath: "/v1/application_fees",
        methodType: "list"
      }),
      createRefund: stripeMethod70({
        method: "POST",
        fullPath: "/v1/application_fees/{id}/refunds"
      }),
      listRefunds: stripeMethod70({
        method: "GET",
        fullPath: "/v1/application_fees/{id}/refunds",
        methodType: "list"
      }),
      retrieveRefund: stripeMethod70({
        method: "GET",
        fullPath: "/v1/application_fees/{fee}/refunds/{id}"
      }),
      updateRefund: stripeMethod70({
        method: "POST",
        fullPath: "/v1/application_fees/{fee}/refunds/{id}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Balance.js
var stripeMethod71, Balance;
var init_Balance = __esm({
  "../node_modules/stripe/esm/resources/Balance.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod71 = StripeResource.method;
    Balance = StripeResource.extend({
      retrieve: stripeMethod71({ method: "GET", fullPath: "/v1/balance" })
    });
  }
});

// ../node_modules/stripe/esm/resources/BalanceTransactions.js
var stripeMethod72, BalanceTransactions;
var init_BalanceTransactions = __esm({
  "../node_modules/stripe/esm/resources/BalanceTransactions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod72 = StripeResource.method;
    BalanceTransactions = StripeResource.extend({
      retrieve: stripeMethod72({
        method: "GET",
        fullPath: "/v1/balance_transactions/{id}"
      }),
      list: stripeMethod72({
        method: "GET",
        fullPath: "/v1/balance_transactions",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Charges.js
var stripeMethod73, Charges;
var init_Charges = __esm({
  "../node_modules/stripe/esm/resources/Charges.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod73 = StripeResource.method;
    Charges = StripeResource.extend({
      create: stripeMethod73({ method: "POST", fullPath: "/v1/charges" }),
      retrieve: stripeMethod73({ method: "GET", fullPath: "/v1/charges/{charge}" }),
      update: stripeMethod73({ method: "POST", fullPath: "/v1/charges/{charge}" }),
      list: stripeMethod73({
        method: "GET",
        fullPath: "/v1/charges",
        methodType: "list"
      }),
      capture: stripeMethod73({
        method: "POST",
        fullPath: "/v1/charges/{charge}/capture"
      }),
      search: stripeMethod73({
        method: "GET",
        fullPath: "/v1/charges/search",
        methodType: "search"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/ConfirmationTokens.js
var stripeMethod74, ConfirmationTokens2;
var init_ConfirmationTokens2 = __esm({
  "../node_modules/stripe/esm/resources/ConfirmationTokens.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod74 = StripeResource.method;
    ConfirmationTokens2 = StripeResource.extend({
      retrieve: stripeMethod74({
        method: "GET",
        fullPath: "/v1/confirmation_tokens/{confirmation_token}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/CountrySpecs.js
var stripeMethod75, CountrySpecs;
var init_CountrySpecs = __esm({
  "../node_modules/stripe/esm/resources/CountrySpecs.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod75 = StripeResource.method;
    CountrySpecs = StripeResource.extend({
      retrieve: stripeMethod75({
        method: "GET",
        fullPath: "/v1/country_specs/{country}"
      }),
      list: stripeMethod75({
        method: "GET",
        fullPath: "/v1/country_specs",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Coupons.js
var stripeMethod76, Coupons;
var init_Coupons = __esm({
  "../node_modules/stripe/esm/resources/Coupons.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod76 = StripeResource.method;
    Coupons = StripeResource.extend({
      create: stripeMethod76({ method: "POST", fullPath: "/v1/coupons" }),
      retrieve: stripeMethod76({ method: "GET", fullPath: "/v1/coupons/{coupon}" }),
      update: stripeMethod76({ method: "POST", fullPath: "/v1/coupons/{coupon}" }),
      list: stripeMethod76({
        method: "GET",
        fullPath: "/v1/coupons",
        methodType: "list"
      }),
      del: stripeMethod76({ method: "DELETE", fullPath: "/v1/coupons/{coupon}" })
    });
  }
});

// ../node_modules/stripe/esm/resources/CreditNotes.js
var stripeMethod77, CreditNotes;
var init_CreditNotes = __esm({
  "../node_modules/stripe/esm/resources/CreditNotes.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod77 = StripeResource.method;
    CreditNotes = StripeResource.extend({
      create: stripeMethod77({ method: "POST", fullPath: "/v1/credit_notes" }),
      retrieve: stripeMethod77({ method: "GET", fullPath: "/v1/credit_notes/{id}" }),
      update: stripeMethod77({ method: "POST", fullPath: "/v1/credit_notes/{id}" }),
      list: stripeMethod77({
        method: "GET",
        fullPath: "/v1/credit_notes",
        methodType: "list"
      }),
      listLineItems: stripeMethod77({
        method: "GET",
        fullPath: "/v1/credit_notes/{credit_note}/lines",
        methodType: "list"
      }),
      listPreviewLineItems: stripeMethod77({
        method: "GET",
        fullPath: "/v1/credit_notes/preview/lines",
        methodType: "list"
      }),
      preview: stripeMethod77({ method: "GET", fullPath: "/v1/credit_notes/preview" }),
      voidCreditNote: stripeMethod77({
        method: "POST",
        fullPath: "/v1/credit_notes/{id}/void"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/CustomerSessions.js
var stripeMethod78, CustomerSessions;
var init_CustomerSessions = __esm({
  "../node_modules/stripe/esm/resources/CustomerSessions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod78 = StripeResource.method;
    CustomerSessions = StripeResource.extend({
      create: stripeMethod78({ method: "POST", fullPath: "/v1/customer_sessions" })
    });
  }
});

// ../node_modules/stripe/esm/resources/Customers.js
var stripeMethod79, Customers2;
var init_Customers2 = __esm({
  "../node_modules/stripe/esm/resources/Customers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod79 = StripeResource.method;
    Customers2 = StripeResource.extend({
      create: stripeMethod79({ method: "POST", fullPath: "/v1/customers" }),
      retrieve: stripeMethod79({ method: "GET", fullPath: "/v1/customers/{customer}" }),
      update: stripeMethod79({ method: "POST", fullPath: "/v1/customers/{customer}" }),
      list: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers",
        methodType: "list"
      }),
      del: stripeMethod79({ method: "DELETE", fullPath: "/v1/customers/{customer}" }),
      createBalanceTransaction: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/balance_transactions"
      }),
      createFundingInstructions: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/funding_instructions"
      }),
      createSource: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/sources"
      }),
      createTaxId: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/tax_ids"
      }),
      deleteDiscount: stripeMethod79({
        method: "DELETE",
        fullPath: "/v1/customers/{customer}/discount"
      }),
      deleteSource: stripeMethod79({
        method: "DELETE",
        fullPath: "/v1/customers/{customer}/sources/{id}"
      }),
      deleteTaxId: stripeMethod79({
        method: "DELETE",
        fullPath: "/v1/customers/{customer}/tax_ids/{id}"
      }),
      listBalanceTransactions: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/balance_transactions",
        methodType: "list"
      }),
      listCashBalanceTransactions: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/cash_balance_transactions",
        methodType: "list"
      }),
      listPaymentMethods: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/payment_methods",
        methodType: "list"
      }),
      listSources: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/sources",
        methodType: "list"
      }),
      listTaxIds: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/tax_ids",
        methodType: "list"
      }),
      retrieveBalanceTransaction: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/balance_transactions/{transaction}"
      }),
      retrieveCashBalance: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/cash_balance"
      }),
      retrieveCashBalanceTransaction: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/cash_balance_transactions/{transaction}"
      }),
      retrievePaymentMethod: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/payment_methods/{payment_method}"
      }),
      retrieveSource: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/sources/{id}"
      }),
      retrieveTaxId: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/{customer}/tax_ids/{id}"
      }),
      search: stripeMethod79({
        method: "GET",
        fullPath: "/v1/customers/search",
        methodType: "search"
      }),
      updateBalanceTransaction: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/balance_transactions/{transaction}"
      }),
      updateCashBalance: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/cash_balance"
      }),
      updateSource: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/sources/{id}"
      }),
      verifySource: stripeMethod79({
        method: "POST",
        fullPath: "/v1/customers/{customer}/sources/{id}/verify"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Disputes.js
var stripeMethod80, Disputes2;
var init_Disputes2 = __esm({
  "../node_modules/stripe/esm/resources/Disputes.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod80 = StripeResource.method;
    Disputes2 = StripeResource.extend({
      retrieve: stripeMethod80({ method: "GET", fullPath: "/v1/disputes/{dispute}" }),
      update: stripeMethod80({ method: "POST", fullPath: "/v1/disputes/{dispute}" }),
      list: stripeMethod80({
        method: "GET",
        fullPath: "/v1/disputes",
        methodType: "list"
      }),
      close: stripeMethod80({
        method: "POST",
        fullPath: "/v1/disputes/{dispute}/close"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/EphemeralKeys.js
var stripeMethod81, EphemeralKeys;
var init_EphemeralKeys = __esm({
  "../node_modules/stripe/esm/resources/EphemeralKeys.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod81 = StripeResource.method;
    EphemeralKeys = StripeResource.extend({
      create: stripeMethod81({
        method: "POST",
        fullPath: "/v1/ephemeral_keys",
        validator: /* @__PURE__ */ __name((data, options) => {
          if (!options.headers || !options.headers["Stripe-Version"]) {
            throw new Error("Passing apiVersion in a separate options hash is required to create an ephemeral key. See https://stripe.com/docs/api/versioning?lang=node");
          }
        }, "validator")
      }),
      del: stripeMethod81({ method: "DELETE", fullPath: "/v1/ephemeral_keys/{key}" })
    });
  }
});

// ../node_modules/stripe/esm/resources/Events.js
var stripeMethod82, Events;
var init_Events = __esm({
  "../node_modules/stripe/esm/resources/Events.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod82 = StripeResource.method;
    Events = StripeResource.extend({
      retrieve: stripeMethod82({ method: "GET", fullPath: "/v1/events/{id}" }),
      list: stripeMethod82({
        method: "GET",
        fullPath: "/v1/events",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/ExchangeRates.js
var stripeMethod83, ExchangeRates;
var init_ExchangeRates = __esm({
  "../node_modules/stripe/esm/resources/ExchangeRates.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod83 = StripeResource.method;
    ExchangeRates = StripeResource.extend({
      retrieve: stripeMethod83({
        method: "GET",
        fullPath: "/v1/exchange_rates/{rate_id}"
      }),
      list: stripeMethod83({
        method: "GET",
        fullPath: "/v1/exchange_rates",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/FileLinks.js
var stripeMethod84, FileLinks;
var init_FileLinks = __esm({
  "../node_modules/stripe/esm/resources/FileLinks.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod84 = StripeResource.method;
    FileLinks = StripeResource.extend({
      create: stripeMethod84({ method: "POST", fullPath: "/v1/file_links" }),
      retrieve: stripeMethod84({ method: "GET", fullPath: "/v1/file_links/{link}" }),
      update: stripeMethod84({ method: "POST", fullPath: "/v1/file_links/{link}" }),
      list: stripeMethod84({
        method: "GET",
        fullPath: "/v1/file_links",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/multipart.js
function multipartRequestDataProcessor(method, data, headers, callback) {
  data = data || {};
  if (method !== "POST") {
    return callback(null, stringifyRequestData(data));
  }
  this._stripe._platformFunctions.tryBufferData(data).then((bufferedData) => {
    const buffer = multipartDataGenerator(method, bufferedData, headers);
    return callback(null, buffer);
  }).catch((err) => callback(err, null));
}
var multipartDataGenerator;
var init_multipart = __esm({
  "../node_modules/stripe/esm/multipart.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_utils();
    multipartDataGenerator = /* @__PURE__ */ __name((method, data, headers) => {
      const segno = (Math.round(Math.random() * 1e16) + Math.round(Math.random() * 1e16)).toString();
      headers["Content-Type"] = `multipart/form-data; boundary=${segno}`;
      const textEncoder = new TextEncoder();
      let buffer = new Uint8Array(0);
      const endBuffer = textEncoder.encode("\r\n");
      function push(l) {
        const prevBuffer = buffer;
        const newBuffer = l instanceof Uint8Array ? l : new Uint8Array(textEncoder.encode(l));
        buffer = new Uint8Array(prevBuffer.length + newBuffer.length + 2);
        buffer.set(prevBuffer);
        buffer.set(newBuffer, prevBuffer.length);
        buffer.set(endBuffer, buffer.length - 2);
      }
      __name(push, "push");
      function q(s) {
        return `"${s.replace(/"|"/g, "%22").replace(/\r\n|\r|\n/g, " ")}"`;
      }
      __name(q, "q");
      const flattenedData = flattenAndStringify(data);
      for (const k in flattenedData) {
        const v = flattenedData[k];
        push(`--${segno}`);
        if (Object.prototype.hasOwnProperty.call(v, "data")) {
          const typedEntry = v;
          push(`Content-Disposition: form-data; name=${q(k)}; filename=${q(typedEntry.name || "blob")}`);
          push(`Content-Type: ${typedEntry.type || "application/octet-stream"}`);
          push("");
          push(typedEntry.data);
        } else {
          push(`Content-Disposition: form-data; name=${q(k)}`);
          push("");
          push(v);
        }
      }
      push(`--${segno}--`);
      return buffer;
    }, "multipartDataGenerator");
    __name(multipartRequestDataProcessor, "multipartRequestDataProcessor");
  }
});

// ../node_modules/stripe/esm/resources/Files.js
var stripeMethod85, Files;
var init_Files = __esm({
  "../node_modules/stripe/esm/resources/Files.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_multipart();
    init_StripeResource();
    stripeMethod85 = StripeResource.method;
    Files = StripeResource.extend({
      create: stripeMethod85({
        method: "POST",
        fullPath: "/v1/files",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        host: "files.stripe.com"
      }),
      retrieve: stripeMethod85({ method: "GET", fullPath: "/v1/files/{file}" }),
      list: stripeMethod85({
        method: "GET",
        fullPath: "/v1/files",
        methodType: "list"
      }),
      requestDataProcessor: multipartRequestDataProcessor
    });
  }
});

// ../node_modules/stripe/esm/resources/InvoiceItems.js
var stripeMethod86, InvoiceItems;
var init_InvoiceItems = __esm({
  "../node_modules/stripe/esm/resources/InvoiceItems.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod86 = StripeResource.method;
    InvoiceItems = StripeResource.extend({
      create: stripeMethod86({ method: "POST", fullPath: "/v1/invoiceitems" }),
      retrieve: stripeMethod86({
        method: "GET",
        fullPath: "/v1/invoiceitems/{invoiceitem}"
      }),
      update: stripeMethod86({
        method: "POST",
        fullPath: "/v1/invoiceitems/{invoiceitem}"
      }),
      list: stripeMethod86({
        method: "GET",
        fullPath: "/v1/invoiceitems",
        methodType: "list"
      }),
      del: stripeMethod86({
        method: "DELETE",
        fullPath: "/v1/invoiceitems/{invoiceitem}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Invoices.js
var stripeMethod87, Invoices;
var init_Invoices = __esm({
  "../node_modules/stripe/esm/resources/Invoices.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod87 = StripeResource.method;
    Invoices = StripeResource.extend({
      create: stripeMethod87({ method: "POST", fullPath: "/v1/invoices" }),
      retrieve: stripeMethod87({ method: "GET", fullPath: "/v1/invoices/{invoice}" }),
      update: stripeMethod87({ method: "POST", fullPath: "/v1/invoices/{invoice}" }),
      list: stripeMethod87({
        method: "GET",
        fullPath: "/v1/invoices",
        methodType: "list"
      }),
      del: stripeMethod87({ method: "DELETE", fullPath: "/v1/invoices/{invoice}" }),
      finalizeInvoice: stripeMethod87({
        method: "POST",
        fullPath: "/v1/invoices/{invoice}/finalize"
      }),
      listLineItems: stripeMethod87({
        method: "GET",
        fullPath: "/v1/invoices/{invoice}/lines",
        methodType: "list"
      }),
      listUpcomingLines: stripeMethod87({
        method: "GET",
        fullPath: "/v1/invoices/upcoming/lines",
        methodType: "list"
      }),
      markUncollectible: stripeMethod87({
        method: "POST",
        fullPath: "/v1/invoices/{invoice}/mark_uncollectible"
      }),
      pay: stripeMethod87({ method: "POST", fullPath: "/v1/invoices/{invoice}/pay" }),
      retrieveUpcoming: stripeMethod87({
        method: "GET",
        fullPath: "/v1/invoices/upcoming"
      }),
      search: stripeMethod87({
        method: "GET",
        fullPath: "/v1/invoices/search",
        methodType: "search"
      }),
      sendInvoice: stripeMethod87({
        method: "POST",
        fullPath: "/v1/invoices/{invoice}/send"
      }),
      updateLineItem: stripeMethod87({
        method: "POST",
        fullPath: "/v1/invoices/{invoice}/lines/{line_item_id}"
      }),
      voidInvoice: stripeMethod87({
        method: "POST",
        fullPath: "/v1/invoices/{invoice}/void"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Mandates.js
var stripeMethod88, Mandates;
var init_Mandates = __esm({
  "../node_modules/stripe/esm/resources/Mandates.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod88 = StripeResource.method;
    Mandates = StripeResource.extend({
      retrieve: stripeMethod88({ method: "GET", fullPath: "/v1/mandates/{mandate}" })
    });
  }
});

// ../node_modules/stripe/esm/resources/OAuth.js
var stripeMethod89, oAuthHost, OAuth;
var init_OAuth = __esm({
  "../node_modules/stripe/esm/resources/OAuth.js"() {
    "use strict";
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    init_utils();
    stripeMethod89 = StripeResource.method;
    oAuthHost = "connect.stripe.com";
    OAuth = StripeResource.extend({
      basePath: "/",
      authorizeUrl(params, options) {
        params = params || {};
        options = options || {};
        let path = "oauth/authorize";
        if (options.express) {
          path = `express/${path}`;
        }
        if (!params.response_type) {
          params.response_type = "code";
        }
        if (!params.client_id) {
          params.client_id = this._stripe.getClientId();
        }
        if (!params.scope) {
          params.scope = "read_write";
        }
        return `https://${oAuthHost}/${path}?${stringifyRequestData(params)}`;
      },
      token: stripeMethod89({
        method: "POST",
        path: "oauth/token",
        host: oAuthHost
      }),
      deauthorize(spec, ...args) {
        if (!spec.client_id) {
          spec.client_id = this._stripe.getClientId();
        }
        return stripeMethod89({
          method: "POST",
          path: "oauth/deauthorize",
          host: oAuthHost
        }).apply(this, [spec, ...args]);
      }
    });
  }
});

// ../node_modules/stripe/esm/resources/PaymentIntents.js
var stripeMethod90, PaymentIntents;
var init_PaymentIntents = __esm({
  "../node_modules/stripe/esm/resources/PaymentIntents.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod90 = StripeResource.method;
    PaymentIntents = StripeResource.extend({
      create: stripeMethod90({ method: "POST", fullPath: "/v1/payment_intents" }),
      retrieve: stripeMethod90({
        method: "GET",
        fullPath: "/v1/payment_intents/{intent}"
      }),
      update: stripeMethod90({
        method: "POST",
        fullPath: "/v1/payment_intents/{intent}"
      }),
      list: stripeMethod90({
        method: "GET",
        fullPath: "/v1/payment_intents",
        methodType: "list"
      }),
      applyCustomerBalance: stripeMethod90({
        method: "POST",
        fullPath: "/v1/payment_intents/{intent}/apply_customer_balance"
      }),
      cancel: stripeMethod90({
        method: "POST",
        fullPath: "/v1/payment_intents/{intent}/cancel"
      }),
      capture: stripeMethod90({
        method: "POST",
        fullPath: "/v1/payment_intents/{intent}/capture"
      }),
      confirm: stripeMethod90({
        method: "POST",
        fullPath: "/v1/payment_intents/{intent}/confirm"
      }),
      incrementAuthorization: stripeMethod90({
        method: "POST",
        fullPath: "/v1/payment_intents/{intent}/increment_authorization"
      }),
      search: stripeMethod90({
        method: "GET",
        fullPath: "/v1/payment_intents/search",
        methodType: "search"
      }),
      verifyMicrodeposits: stripeMethod90({
        method: "POST",
        fullPath: "/v1/payment_intents/{intent}/verify_microdeposits"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/PaymentLinks.js
var stripeMethod91, PaymentLinks;
var init_PaymentLinks = __esm({
  "../node_modules/stripe/esm/resources/PaymentLinks.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod91 = StripeResource.method;
    PaymentLinks = StripeResource.extend({
      create: stripeMethod91({ method: "POST", fullPath: "/v1/payment_links" }),
      retrieve: stripeMethod91({
        method: "GET",
        fullPath: "/v1/payment_links/{payment_link}"
      }),
      update: stripeMethod91({
        method: "POST",
        fullPath: "/v1/payment_links/{payment_link}"
      }),
      list: stripeMethod91({
        method: "GET",
        fullPath: "/v1/payment_links",
        methodType: "list"
      }),
      listLineItems: stripeMethod91({
        method: "GET",
        fullPath: "/v1/payment_links/{payment_link}/line_items",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/PaymentMethodConfigurations.js
var stripeMethod92, PaymentMethodConfigurations;
var init_PaymentMethodConfigurations = __esm({
  "../node_modules/stripe/esm/resources/PaymentMethodConfigurations.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod92 = StripeResource.method;
    PaymentMethodConfigurations = StripeResource.extend({
      create: stripeMethod92({
        method: "POST",
        fullPath: "/v1/payment_method_configurations"
      }),
      retrieve: stripeMethod92({
        method: "GET",
        fullPath: "/v1/payment_method_configurations/{configuration}"
      }),
      update: stripeMethod92({
        method: "POST",
        fullPath: "/v1/payment_method_configurations/{configuration}"
      }),
      list: stripeMethod92({
        method: "GET",
        fullPath: "/v1/payment_method_configurations",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/PaymentMethodDomains.js
var stripeMethod93, PaymentMethodDomains;
var init_PaymentMethodDomains = __esm({
  "../node_modules/stripe/esm/resources/PaymentMethodDomains.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod93 = StripeResource.method;
    PaymentMethodDomains = StripeResource.extend({
      create: stripeMethod93({
        method: "POST",
        fullPath: "/v1/payment_method_domains"
      }),
      retrieve: stripeMethod93({
        method: "GET",
        fullPath: "/v1/payment_method_domains/{payment_method_domain}"
      }),
      update: stripeMethod93({
        method: "POST",
        fullPath: "/v1/payment_method_domains/{payment_method_domain}"
      }),
      list: stripeMethod93({
        method: "GET",
        fullPath: "/v1/payment_method_domains",
        methodType: "list"
      }),
      validate: stripeMethod93({
        method: "POST",
        fullPath: "/v1/payment_method_domains/{payment_method_domain}/validate"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/PaymentMethods.js
var stripeMethod94, PaymentMethods;
var init_PaymentMethods = __esm({
  "../node_modules/stripe/esm/resources/PaymentMethods.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod94 = StripeResource.method;
    PaymentMethods = StripeResource.extend({
      create: stripeMethod94({ method: "POST", fullPath: "/v1/payment_methods" }),
      retrieve: stripeMethod94({
        method: "GET",
        fullPath: "/v1/payment_methods/{payment_method}"
      }),
      update: stripeMethod94({
        method: "POST",
        fullPath: "/v1/payment_methods/{payment_method}"
      }),
      list: stripeMethod94({
        method: "GET",
        fullPath: "/v1/payment_methods",
        methodType: "list"
      }),
      attach: stripeMethod94({
        method: "POST",
        fullPath: "/v1/payment_methods/{payment_method}/attach"
      }),
      detach: stripeMethod94({
        method: "POST",
        fullPath: "/v1/payment_methods/{payment_method}/detach"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Payouts.js
var stripeMethod95, Payouts;
var init_Payouts = __esm({
  "../node_modules/stripe/esm/resources/Payouts.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod95 = StripeResource.method;
    Payouts = StripeResource.extend({
      create: stripeMethod95({ method: "POST", fullPath: "/v1/payouts" }),
      retrieve: stripeMethod95({ method: "GET", fullPath: "/v1/payouts/{payout}" }),
      update: stripeMethod95({ method: "POST", fullPath: "/v1/payouts/{payout}" }),
      list: stripeMethod95({
        method: "GET",
        fullPath: "/v1/payouts",
        methodType: "list"
      }),
      cancel: stripeMethod95({
        method: "POST",
        fullPath: "/v1/payouts/{payout}/cancel"
      }),
      reverse: stripeMethod95({
        method: "POST",
        fullPath: "/v1/payouts/{payout}/reverse"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Plans.js
var stripeMethod96, Plans;
var init_Plans = __esm({
  "../node_modules/stripe/esm/resources/Plans.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod96 = StripeResource.method;
    Plans = StripeResource.extend({
      create: stripeMethod96({ method: "POST", fullPath: "/v1/plans" }),
      retrieve: stripeMethod96({ method: "GET", fullPath: "/v1/plans/{plan}" }),
      update: stripeMethod96({ method: "POST", fullPath: "/v1/plans/{plan}" }),
      list: stripeMethod96({
        method: "GET",
        fullPath: "/v1/plans",
        methodType: "list"
      }),
      del: stripeMethod96({ method: "DELETE", fullPath: "/v1/plans/{plan}" })
    });
  }
});

// ../node_modules/stripe/esm/resources/Prices.js
var stripeMethod97, Prices;
var init_Prices = __esm({
  "../node_modules/stripe/esm/resources/Prices.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod97 = StripeResource.method;
    Prices = StripeResource.extend({
      create: stripeMethod97({ method: "POST", fullPath: "/v1/prices" }),
      retrieve: stripeMethod97({ method: "GET", fullPath: "/v1/prices/{price}" }),
      update: stripeMethod97({ method: "POST", fullPath: "/v1/prices/{price}" }),
      list: stripeMethod97({
        method: "GET",
        fullPath: "/v1/prices",
        methodType: "list"
      }),
      search: stripeMethod97({
        method: "GET",
        fullPath: "/v1/prices/search",
        methodType: "search"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Products.js
var stripeMethod98, Products2;
var init_Products2 = __esm({
  "../node_modules/stripe/esm/resources/Products.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod98 = StripeResource.method;
    Products2 = StripeResource.extend({
      create: stripeMethod98({ method: "POST", fullPath: "/v1/products" }),
      retrieve: stripeMethod98({ method: "GET", fullPath: "/v1/products/{id}" }),
      update: stripeMethod98({ method: "POST", fullPath: "/v1/products/{id}" }),
      list: stripeMethod98({
        method: "GET",
        fullPath: "/v1/products",
        methodType: "list"
      }),
      del: stripeMethod98({ method: "DELETE", fullPath: "/v1/products/{id}" }),
      createFeature: stripeMethod98({
        method: "POST",
        fullPath: "/v1/products/{product}/features"
      }),
      deleteFeature: stripeMethod98({
        method: "DELETE",
        fullPath: "/v1/products/{product}/features/{id}"
      }),
      listFeatures: stripeMethod98({
        method: "GET",
        fullPath: "/v1/products/{product}/features",
        methodType: "list"
      }),
      retrieveFeature: stripeMethod98({
        method: "GET",
        fullPath: "/v1/products/{product}/features/{id}"
      }),
      search: stripeMethod98({
        method: "GET",
        fullPath: "/v1/products/search",
        methodType: "search"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/PromotionCodes.js
var stripeMethod99, PromotionCodes;
var init_PromotionCodes = __esm({
  "../node_modules/stripe/esm/resources/PromotionCodes.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod99 = StripeResource.method;
    PromotionCodes = StripeResource.extend({
      create: stripeMethod99({ method: "POST", fullPath: "/v1/promotion_codes" }),
      retrieve: stripeMethod99({
        method: "GET",
        fullPath: "/v1/promotion_codes/{promotion_code}"
      }),
      update: stripeMethod99({
        method: "POST",
        fullPath: "/v1/promotion_codes/{promotion_code}"
      }),
      list: stripeMethod99({
        method: "GET",
        fullPath: "/v1/promotion_codes",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Quotes.js
var stripeMethod100, Quotes;
var init_Quotes = __esm({
  "../node_modules/stripe/esm/resources/Quotes.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod100 = StripeResource.method;
    Quotes = StripeResource.extend({
      create: stripeMethod100({ method: "POST", fullPath: "/v1/quotes" }),
      retrieve: stripeMethod100({ method: "GET", fullPath: "/v1/quotes/{quote}" }),
      update: stripeMethod100({ method: "POST", fullPath: "/v1/quotes/{quote}" }),
      list: stripeMethod100({
        method: "GET",
        fullPath: "/v1/quotes",
        methodType: "list"
      }),
      accept: stripeMethod100({ method: "POST", fullPath: "/v1/quotes/{quote}/accept" }),
      cancel: stripeMethod100({ method: "POST", fullPath: "/v1/quotes/{quote}/cancel" }),
      finalizeQuote: stripeMethod100({
        method: "POST",
        fullPath: "/v1/quotes/{quote}/finalize"
      }),
      listComputedUpfrontLineItems: stripeMethod100({
        method: "GET",
        fullPath: "/v1/quotes/{quote}/computed_upfront_line_items",
        methodType: "list"
      }),
      listLineItems: stripeMethod100({
        method: "GET",
        fullPath: "/v1/quotes/{quote}/line_items",
        methodType: "list"
      }),
      pdf: stripeMethod100({
        method: "GET",
        fullPath: "/v1/quotes/{quote}/pdf",
        host: "files.stripe.com",
        streaming: true
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Refunds.js
var stripeMethod101, Refunds2;
var init_Refunds2 = __esm({
  "../node_modules/stripe/esm/resources/Refunds.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod101 = StripeResource.method;
    Refunds2 = StripeResource.extend({
      create: stripeMethod101({ method: "POST", fullPath: "/v1/refunds" }),
      retrieve: stripeMethod101({ method: "GET", fullPath: "/v1/refunds/{refund}" }),
      update: stripeMethod101({ method: "POST", fullPath: "/v1/refunds/{refund}" }),
      list: stripeMethod101({
        method: "GET",
        fullPath: "/v1/refunds",
        methodType: "list"
      }),
      cancel: stripeMethod101({
        method: "POST",
        fullPath: "/v1/refunds/{refund}/cancel"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Reviews.js
var stripeMethod102, Reviews;
var init_Reviews = __esm({
  "../node_modules/stripe/esm/resources/Reviews.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod102 = StripeResource.method;
    Reviews = StripeResource.extend({
      retrieve: stripeMethod102({ method: "GET", fullPath: "/v1/reviews/{review}" }),
      list: stripeMethod102({
        method: "GET",
        fullPath: "/v1/reviews",
        methodType: "list"
      }),
      approve: stripeMethod102({
        method: "POST",
        fullPath: "/v1/reviews/{review}/approve"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/SetupAttempts.js
var stripeMethod103, SetupAttempts;
var init_SetupAttempts = __esm({
  "../node_modules/stripe/esm/resources/SetupAttempts.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod103 = StripeResource.method;
    SetupAttempts = StripeResource.extend({
      list: stripeMethod103({
        method: "GET",
        fullPath: "/v1/setup_attempts",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/SetupIntents.js
var stripeMethod104, SetupIntents;
var init_SetupIntents = __esm({
  "../node_modules/stripe/esm/resources/SetupIntents.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod104 = StripeResource.method;
    SetupIntents = StripeResource.extend({
      create: stripeMethod104({ method: "POST", fullPath: "/v1/setup_intents" }),
      retrieve: stripeMethod104({
        method: "GET",
        fullPath: "/v1/setup_intents/{intent}"
      }),
      update: stripeMethod104({
        method: "POST",
        fullPath: "/v1/setup_intents/{intent}"
      }),
      list: stripeMethod104({
        method: "GET",
        fullPath: "/v1/setup_intents",
        methodType: "list"
      }),
      cancel: stripeMethod104({
        method: "POST",
        fullPath: "/v1/setup_intents/{intent}/cancel"
      }),
      confirm: stripeMethod104({
        method: "POST",
        fullPath: "/v1/setup_intents/{intent}/confirm"
      }),
      verifyMicrodeposits: stripeMethod104({
        method: "POST",
        fullPath: "/v1/setup_intents/{intent}/verify_microdeposits"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/ShippingRates.js
var stripeMethod105, ShippingRates;
var init_ShippingRates = __esm({
  "../node_modules/stripe/esm/resources/ShippingRates.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod105 = StripeResource.method;
    ShippingRates = StripeResource.extend({
      create: stripeMethod105({ method: "POST", fullPath: "/v1/shipping_rates" }),
      retrieve: stripeMethod105({
        method: "GET",
        fullPath: "/v1/shipping_rates/{shipping_rate_token}"
      }),
      update: stripeMethod105({
        method: "POST",
        fullPath: "/v1/shipping_rates/{shipping_rate_token}"
      }),
      list: stripeMethod105({
        method: "GET",
        fullPath: "/v1/shipping_rates",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Sources.js
var stripeMethod106, Sources;
var init_Sources = __esm({
  "../node_modules/stripe/esm/resources/Sources.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod106 = StripeResource.method;
    Sources = StripeResource.extend({
      create: stripeMethod106({ method: "POST", fullPath: "/v1/sources" }),
      retrieve: stripeMethod106({ method: "GET", fullPath: "/v1/sources/{source}" }),
      update: stripeMethod106({ method: "POST", fullPath: "/v1/sources/{source}" }),
      listSourceTransactions: stripeMethod106({
        method: "GET",
        fullPath: "/v1/sources/{source}/source_transactions",
        methodType: "list"
      }),
      verify: stripeMethod106({
        method: "POST",
        fullPath: "/v1/sources/{source}/verify"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/SubscriptionItems.js
var stripeMethod107, SubscriptionItems;
var init_SubscriptionItems = __esm({
  "../node_modules/stripe/esm/resources/SubscriptionItems.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod107 = StripeResource.method;
    SubscriptionItems = StripeResource.extend({
      create: stripeMethod107({ method: "POST", fullPath: "/v1/subscription_items" }),
      retrieve: stripeMethod107({
        method: "GET",
        fullPath: "/v1/subscription_items/{item}"
      }),
      update: stripeMethod107({
        method: "POST",
        fullPath: "/v1/subscription_items/{item}"
      }),
      list: stripeMethod107({
        method: "GET",
        fullPath: "/v1/subscription_items",
        methodType: "list"
      }),
      del: stripeMethod107({
        method: "DELETE",
        fullPath: "/v1/subscription_items/{item}"
      }),
      createUsageRecord: stripeMethod107({
        method: "POST",
        fullPath: "/v1/subscription_items/{subscription_item}/usage_records"
      }),
      listUsageRecordSummaries: stripeMethod107({
        method: "GET",
        fullPath: "/v1/subscription_items/{subscription_item}/usage_record_summaries",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/SubscriptionSchedules.js
var stripeMethod108, SubscriptionSchedules;
var init_SubscriptionSchedules = __esm({
  "../node_modules/stripe/esm/resources/SubscriptionSchedules.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod108 = StripeResource.method;
    SubscriptionSchedules = StripeResource.extend({
      create: stripeMethod108({
        method: "POST",
        fullPath: "/v1/subscription_schedules"
      }),
      retrieve: stripeMethod108({
        method: "GET",
        fullPath: "/v1/subscription_schedules/{schedule}"
      }),
      update: stripeMethod108({
        method: "POST",
        fullPath: "/v1/subscription_schedules/{schedule}"
      }),
      list: stripeMethod108({
        method: "GET",
        fullPath: "/v1/subscription_schedules",
        methodType: "list"
      }),
      cancel: stripeMethod108({
        method: "POST",
        fullPath: "/v1/subscription_schedules/{schedule}/cancel"
      }),
      release: stripeMethod108({
        method: "POST",
        fullPath: "/v1/subscription_schedules/{schedule}/release"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Subscriptions.js
var stripeMethod109, Subscriptions;
var init_Subscriptions = __esm({
  "../node_modules/stripe/esm/resources/Subscriptions.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod109 = StripeResource.method;
    Subscriptions = StripeResource.extend({
      create: stripeMethod109({ method: "POST", fullPath: "/v1/subscriptions" }),
      retrieve: stripeMethod109({
        method: "GET",
        fullPath: "/v1/subscriptions/{subscription_exposed_id}"
      }),
      update: stripeMethod109({
        method: "POST",
        fullPath: "/v1/subscriptions/{subscription_exposed_id}"
      }),
      list: stripeMethod109({
        method: "GET",
        fullPath: "/v1/subscriptions",
        methodType: "list"
      }),
      cancel: stripeMethod109({
        method: "DELETE",
        fullPath: "/v1/subscriptions/{subscription_exposed_id}"
      }),
      deleteDiscount: stripeMethod109({
        method: "DELETE",
        fullPath: "/v1/subscriptions/{subscription_exposed_id}/discount"
      }),
      resume: stripeMethod109({
        method: "POST",
        fullPath: "/v1/subscriptions/{subscription}/resume"
      }),
      search: stripeMethod109({
        method: "GET",
        fullPath: "/v1/subscriptions/search",
        methodType: "search"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TaxCodes.js
var stripeMethod110, TaxCodes;
var init_TaxCodes = __esm({
  "../node_modules/stripe/esm/resources/TaxCodes.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod110 = StripeResource.method;
    TaxCodes = StripeResource.extend({
      retrieve: stripeMethod110({ method: "GET", fullPath: "/v1/tax_codes/{id}" }),
      list: stripeMethod110({
        method: "GET",
        fullPath: "/v1/tax_codes",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/TaxIds.js
var stripeMethod111, TaxIds;
var init_TaxIds = __esm({
  "../node_modules/stripe/esm/resources/TaxIds.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod111 = StripeResource.method;
    TaxIds = StripeResource.extend({
      create: stripeMethod111({ method: "POST", fullPath: "/v1/tax_ids" }),
      retrieve: stripeMethod111({ method: "GET", fullPath: "/v1/tax_ids/{id}" }),
      list: stripeMethod111({
        method: "GET",
        fullPath: "/v1/tax_ids",
        methodType: "list"
      }),
      del: stripeMethod111({ method: "DELETE", fullPath: "/v1/tax_ids/{id}" })
    });
  }
});

// ../node_modules/stripe/esm/resources/TaxRates.js
var stripeMethod112, TaxRates;
var init_TaxRates = __esm({
  "../node_modules/stripe/esm/resources/TaxRates.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod112 = StripeResource.method;
    TaxRates = StripeResource.extend({
      create: stripeMethod112({ method: "POST", fullPath: "/v1/tax_rates" }),
      retrieve: stripeMethod112({ method: "GET", fullPath: "/v1/tax_rates/{tax_rate}" }),
      update: stripeMethod112({ method: "POST", fullPath: "/v1/tax_rates/{tax_rate}" }),
      list: stripeMethod112({
        method: "GET",
        fullPath: "/v1/tax_rates",
        methodType: "list"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/Tokens.js
var stripeMethod113, Tokens2;
var init_Tokens2 = __esm({
  "../node_modules/stripe/esm/resources/Tokens.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod113 = StripeResource.method;
    Tokens2 = StripeResource.extend({
      create: stripeMethod113({ method: "POST", fullPath: "/v1/tokens" }),
      retrieve: stripeMethod113({ method: "GET", fullPath: "/v1/tokens/{token}" })
    });
  }
});

// ../node_modules/stripe/esm/resources/Topups.js
var stripeMethod114, Topups;
var init_Topups = __esm({
  "../node_modules/stripe/esm/resources/Topups.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod114 = StripeResource.method;
    Topups = StripeResource.extend({
      create: stripeMethod114({ method: "POST", fullPath: "/v1/topups" }),
      retrieve: stripeMethod114({ method: "GET", fullPath: "/v1/topups/{topup}" }),
      update: stripeMethod114({ method: "POST", fullPath: "/v1/topups/{topup}" }),
      list: stripeMethod114({
        method: "GET",
        fullPath: "/v1/topups",
        methodType: "list"
      }),
      cancel: stripeMethod114({ method: "POST", fullPath: "/v1/topups/{topup}/cancel" })
    });
  }
});

// ../node_modules/stripe/esm/resources/Transfers.js
var stripeMethod115, Transfers;
var init_Transfers = __esm({
  "../node_modules/stripe/esm/resources/Transfers.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod115 = StripeResource.method;
    Transfers = StripeResource.extend({
      create: stripeMethod115({ method: "POST", fullPath: "/v1/transfers" }),
      retrieve: stripeMethod115({ method: "GET", fullPath: "/v1/transfers/{transfer}" }),
      update: stripeMethod115({ method: "POST", fullPath: "/v1/transfers/{transfer}" }),
      list: stripeMethod115({
        method: "GET",
        fullPath: "/v1/transfers",
        methodType: "list"
      }),
      createReversal: stripeMethod115({
        method: "POST",
        fullPath: "/v1/transfers/{id}/reversals"
      }),
      listReversals: stripeMethod115({
        method: "GET",
        fullPath: "/v1/transfers/{id}/reversals",
        methodType: "list"
      }),
      retrieveReversal: stripeMethod115({
        method: "GET",
        fullPath: "/v1/transfers/{transfer}/reversals/{id}"
      }),
      updateReversal: stripeMethod115({
        method: "POST",
        fullPath: "/v1/transfers/{transfer}/reversals/{id}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources/WebhookEndpoints.js
var stripeMethod116, WebhookEndpoints;
var init_WebhookEndpoints = __esm({
  "../node_modules/stripe/esm/resources/WebhookEndpoints.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_StripeResource();
    stripeMethod116 = StripeResource.method;
    WebhookEndpoints = StripeResource.extend({
      create: stripeMethod116({ method: "POST", fullPath: "/v1/webhook_endpoints" }),
      retrieve: stripeMethod116({
        method: "GET",
        fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
      }),
      update: stripeMethod116({
        method: "POST",
        fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
      }),
      list: stripeMethod116({
        method: "GET",
        fullPath: "/v1/webhook_endpoints",
        methodType: "list"
      }),
      del: stripeMethod116({
        method: "DELETE",
        fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
      })
    });
  }
});

// ../node_modules/stripe/esm/resources.js
var resources_exports = {};
__export(resources_exports, {
  Account: () => Accounts2,
  AccountLinks: () => AccountLinks,
  AccountSessions: () => AccountSessions,
  Accounts: () => Accounts2,
  ApplePayDomains: () => ApplePayDomains,
  ApplicationFees: () => ApplicationFees,
  Apps: () => Apps,
  Balance: () => Balance,
  BalanceTransactions: () => BalanceTransactions,
  Billing: () => Billing,
  BillingPortal: () => BillingPortal,
  Charges: () => Charges,
  Checkout: () => Checkout,
  Climate: () => Climate,
  ConfirmationTokens: () => ConfirmationTokens2,
  CountrySpecs: () => CountrySpecs,
  Coupons: () => Coupons,
  CreditNotes: () => CreditNotes,
  CustomerSessions: () => CustomerSessions,
  Customers: () => Customers2,
  Disputes: () => Disputes2,
  Entitlements: () => Entitlements,
  EphemeralKeys: () => EphemeralKeys,
  Events: () => Events,
  ExchangeRates: () => ExchangeRates,
  FileLinks: () => FileLinks,
  Files: () => Files,
  FinancialConnections: () => FinancialConnections,
  Forwarding: () => Forwarding,
  Identity: () => Identity,
  InvoiceItems: () => InvoiceItems,
  Invoices: () => Invoices,
  Issuing: () => Issuing,
  Mandates: () => Mandates,
  OAuth: () => OAuth,
  PaymentIntents: () => PaymentIntents,
  PaymentLinks: () => PaymentLinks,
  PaymentMethodConfigurations: () => PaymentMethodConfigurations,
  PaymentMethodDomains: () => PaymentMethodDomains,
  PaymentMethods: () => PaymentMethods,
  Payouts: () => Payouts,
  Plans: () => Plans,
  Prices: () => Prices,
  Products: () => Products2,
  PromotionCodes: () => PromotionCodes,
  Quotes: () => Quotes,
  Radar: () => Radar,
  Refunds: () => Refunds2,
  Reporting: () => Reporting,
  Reviews: () => Reviews,
  SetupAttempts: () => SetupAttempts,
  SetupIntents: () => SetupIntents,
  ShippingRates: () => ShippingRates,
  Sigma: () => Sigma,
  Sources: () => Sources,
  SubscriptionItems: () => SubscriptionItems,
  SubscriptionSchedules: () => SubscriptionSchedules,
  Subscriptions: () => Subscriptions,
  Tax: () => Tax,
  TaxCodes: () => TaxCodes,
  TaxIds: () => TaxIds,
  TaxRates: () => TaxRates,
  Terminal: () => Terminal,
  TestHelpers: () => TestHelpers,
  Tokens: () => Tokens2,
  Topups: () => Topups,
  Transfers: () => Transfers,
  Treasury: () => Treasury,
  WebhookEndpoints: () => WebhookEndpoints
});
var Apps, Billing, BillingPortal, Checkout, Climate, Entitlements, FinancialConnections, Forwarding, Identity, Issuing, Radar, Reporting, Sigma, Tax, Terminal, TestHelpers, Treasury;
var init_resources = __esm({
  "../node_modules/stripe/esm/resources.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_ResourceNamespace();
    init_Accounts();
    init_ActiveEntitlements();
    init_Authorizations();
    init_Authorizations2();
    init_Calculations();
    init_Cardholders();
    init_Cards();
    init_Cards2();
    init_Configurations();
    init_Configurations2();
    init_ConfirmationTokens();
    init_ConnectionTokens();
    init_CreditReversals();
    init_Customers();
    init_DebitReversals();
    init_Disputes();
    init_EarlyFraudWarnings();
    init_Features();
    init_FinancialAccounts();
    init_InboundTransfers();
    init_InboundTransfers2();
    init_Locations();
    init_MeterEventAdjustments();
    init_MeterEvents();
    init_Meters();
    init_Orders();
    init_OutboundPayments();
    init_OutboundPayments2();
    init_OutboundTransfers();
    init_OutboundTransfers2();
    init_PersonalizationDesigns();
    init_PersonalizationDesigns2();
    init_PhysicalBundles();
    init_Products();
    init_Readers();
    init_Readers2();
    init_ReceivedCredits();
    init_ReceivedCredits2();
    init_ReceivedDebits();
    init_ReceivedDebits2();
    init_Refunds();
    init_Registrations();
    init_ReportRuns();
    init_ReportTypes();
    init_Requests();
    init_ScheduledQueryRuns();
    init_Secrets();
    init_Sessions();
    init_Sessions2();
    init_Sessions3();
    init_Settings();
    init_Suppliers();
    init_TestClocks();
    init_Tokens();
    init_TransactionEntries();
    init_Transactions();
    init_Transactions2();
    init_Transactions3();
    init_Transactions4();
    init_Transactions5();
    init_ValueListItems();
    init_ValueLists();
    init_VerificationReports();
    init_VerificationSessions();
    init_Accounts2();
    init_AccountLinks();
    init_AccountSessions();
    init_Accounts2();
    init_ApplePayDomains();
    init_ApplicationFees();
    init_Balance();
    init_BalanceTransactions();
    init_Charges();
    init_ConfirmationTokens2();
    init_CountrySpecs();
    init_Coupons();
    init_CreditNotes();
    init_CustomerSessions();
    init_Customers2();
    init_Disputes2();
    init_EphemeralKeys();
    init_Events();
    init_ExchangeRates();
    init_FileLinks();
    init_Files();
    init_InvoiceItems();
    init_Invoices();
    init_Mandates();
    init_OAuth();
    init_PaymentIntents();
    init_PaymentLinks();
    init_PaymentMethodConfigurations();
    init_PaymentMethodDomains();
    init_PaymentMethods();
    init_Payouts();
    init_Plans();
    init_Prices();
    init_Products2();
    init_PromotionCodes();
    init_Quotes();
    init_Refunds2();
    init_Reviews();
    init_SetupAttempts();
    init_SetupIntents();
    init_ShippingRates();
    init_Sources();
    init_SubscriptionItems();
    init_SubscriptionSchedules();
    init_Subscriptions();
    init_TaxCodes();
    init_TaxIds();
    init_TaxRates();
    init_Tokens2();
    init_Topups();
    init_Transfers();
    init_WebhookEndpoints();
    Apps = resourceNamespace("apps", { Secrets });
    Billing = resourceNamespace("billing", {
      MeterEventAdjustments,
      MeterEvents,
      Meters
    });
    BillingPortal = resourceNamespace("billingPortal", {
      Configurations,
      Sessions
    });
    Checkout = resourceNamespace("checkout", {
      Sessions: Sessions2
    });
    Climate = resourceNamespace("climate", {
      Orders,
      Products,
      Suppliers
    });
    Entitlements = resourceNamespace("entitlements", {
      ActiveEntitlements,
      Features
    });
    FinancialConnections = resourceNamespace("financialConnections", {
      Accounts,
      Sessions: Sessions3,
      Transactions: Transactions2
    });
    Forwarding = resourceNamespace("forwarding", {
      Requests
    });
    Identity = resourceNamespace("identity", {
      VerificationReports,
      VerificationSessions
    });
    Issuing = resourceNamespace("issuing", {
      Authorizations: Authorizations2,
      Cardholders,
      Cards: Cards2,
      Disputes,
      PersonalizationDesigns: PersonalizationDesigns2,
      PhysicalBundles,
      Tokens,
      Transactions: Transactions3
    });
    Radar = resourceNamespace("radar", {
      EarlyFraudWarnings,
      ValueListItems,
      ValueLists
    });
    Reporting = resourceNamespace("reporting", {
      ReportRuns,
      ReportTypes
    });
    Sigma = resourceNamespace("sigma", {
      ScheduledQueryRuns
    });
    Tax = resourceNamespace("tax", {
      Calculations,
      Registrations,
      Settings,
      Transactions: Transactions4
    });
    Terminal = resourceNamespace("terminal", {
      Configurations: Configurations2,
      ConnectionTokens,
      Locations,
      Readers: Readers2
    });
    TestHelpers = resourceNamespace("testHelpers", {
      ConfirmationTokens,
      Customers,
      Refunds,
      TestClocks,
      Issuing: resourceNamespace("issuing", {
        Authorizations,
        Cards,
        PersonalizationDesigns,
        Transactions
      }),
      Terminal: resourceNamespace("terminal", {
        Readers
      }),
      Treasury: resourceNamespace("treasury", {
        InboundTransfers,
        OutboundPayments,
        OutboundTransfers,
        ReceivedCredits,
        ReceivedDebits
      })
    });
    Treasury = resourceNamespace("treasury", {
      CreditReversals,
      DebitReversals,
      FinancialAccounts,
      InboundTransfers: InboundTransfers2,
      OutboundPayments: OutboundPayments2,
      OutboundTransfers: OutboundTransfers2,
      ReceivedCredits: ReceivedCredits2,
      ReceivedDebits: ReceivedDebits2,
      TransactionEntries,
      Transactions: Transactions5
    });
  }
});

// ../node_modules/stripe/esm/RequestSender.js
var MAX_RETRY_AFTER_WAIT, RequestSender;
var init_RequestSender = __esm({
  "../node_modules/stripe/esm/RequestSender.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_Error();
    init_utils();
    init_HttpClient();
    MAX_RETRY_AFTER_WAIT = 60;
    RequestSender = class _RequestSender {
      static {
        __name(this, "RequestSender");
      }
      constructor(stripe, maxBufferedRequestMetric) {
        this._stripe = stripe;
        this._maxBufferedRequestMetric = maxBufferedRequestMetric;
      }
      _addHeadersDirectlyToObject(obj, headers) {
        obj.requestId = headers["request-id"];
        obj.stripeAccount = obj.stripeAccount || headers["stripe-account"];
        obj.apiVersion = obj.apiVersion || headers["stripe-version"];
        obj.idempotencyKey = obj.idempotencyKey || headers["idempotency-key"];
      }
      _makeResponseEvent(requestEvent, statusCode, headers) {
        const requestEndTime = Date.now();
        const requestDurationMs = requestEndTime - requestEvent.request_start_time;
        return removeNullish({
          api_version: headers["stripe-version"],
          account: headers["stripe-account"],
          idempotency_key: headers["idempotency-key"],
          method: requestEvent.method,
          path: requestEvent.path,
          status: statusCode,
          request_id: this._getRequestId(headers),
          elapsed: requestDurationMs,
          request_start_time: requestEvent.request_start_time,
          request_end_time: requestEndTime
        });
      }
      _getRequestId(headers) {
        return headers["request-id"];
      }
      /**
       * Used by methods with spec.streaming === true. For these methods, we do not
       * buffer successful responses into memory or do parse them into stripe
       * objects, we delegate that all of that to the user and pass back the raw
       * http.Response object to the callback.
       *
       * (Unsuccessful responses shouldn't make it here, they should
       * still be buffered/parsed and handled by _jsonResponseHandler -- see
       * makeRequest)
       */
      _streamingResponseHandler(requestEvent, usage, callback) {
        return (res) => {
          const headers = res.getHeaders();
          const streamCompleteCallback = /* @__PURE__ */ __name(() => {
            const responseEvent = this._makeResponseEvent(requestEvent, res.getStatusCode(), headers);
            this._stripe._emitter.emit("response", responseEvent);
            this._recordRequestMetrics(this._getRequestId(headers), responseEvent.elapsed, usage);
          }, "streamCompleteCallback");
          const stream = res.toStream(streamCompleteCallback);
          this._addHeadersDirectlyToObject(stream, headers);
          return callback(null, stream);
        };
      }
      /**
       * Default handler for Stripe responses. Buffers the response into memory,
       * parses the JSON and returns it (i.e. passes it to the callback) if there
       * is no "error" field. Otherwise constructs/passes an appropriate Error.
       */
      _jsonResponseHandler(requestEvent, usage, callback) {
        return (res) => {
          const headers = res.getHeaders();
          const requestId = this._getRequestId(headers);
          const statusCode = res.getStatusCode();
          const responseEvent = this._makeResponseEvent(requestEvent, statusCode, headers);
          this._stripe._emitter.emit("response", responseEvent);
          res.toJSON().then((jsonResponse) => {
            if (jsonResponse.error) {
              let err;
              if (typeof jsonResponse.error === "string") {
                jsonResponse.error = {
                  type: jsonResponse.error,
                  message: jsonResponse.error_description
                };
              }
              jsonResponse.error.headers = headers;
              jsonResponse.error.statusCode = statusCode;
              jsonResponse.error.requestId = requestId;
              if (statusCode === 401) {
                err = new StripeAuthenticationError(jsonResponse.error);
              } else if (statusCode === 403) {
                err = new StripePermissionError(jsonResponse.error);
              } else if (statusCode === 429) {
                err = new StripeRateLimitError(jsonResponse.error);
              } else {
                err = StripeError.generate(jsonResponse.error);
              }
              throw err;
            }
            return jsonResponse;
          }, (e) => {
            throw new StripeAPIError({
              message: "Invalid JSON received from the Stripe API",
              exception: e,
              requestId: headers["request-id"]
            });
          }).then((jsonResponse) => {
            this._recordRequestMetrics(requestId, responseEvent.elapsed, usage);
            const rawResponse = res.getRawResponse();
            this._addHeadersDirectlyToObject(rawResponse, headers);
            Object.defineProperty(jsonResponse, "lastResponse", {
              enumerable: false,
              writable: false,
              value: rawResponse
            });
            callback(null, jsonResponse);
          }, (e) => callback(e, null));
        };
      }
      static _generateConnectionErrorMessage(requestRetries) {
        return `An error occurred with our connection to Stripe.${requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ""}`;
      }
      // For more on when and how to retry API requests, see https://stripe.com/docs/error-handling#safely-retrying-requests-with-idempotency
      static _shouldRetry(res, numRetries, maxRetries, error) {
        if (error && numRetries === 0 && HttpClient.CONNECTION_CLOSED_ERROR_CODES.includes(error.code)) {
          return true;
        }
        if (numRetries >= maxRetries) {
          return false;
        }
        if (!res) {
          return true;
        }
        if (res.getHeaders()["stripe-should-retry"] === "false") {
          return false;
        }
        if (res.getHeaders()["stripe-should-retry"] === "true") {
          return true;
        }
        if (res.getStatusCode() === 409) {
          return true;
        }
        if (res.getStatusCode() >= 500) {
          return true;
        }
        return false;
      }
      _getSleepTimeInMS(numRetries, retryAfter = null) {
        const initialNetworkRetryDelay = this._stripe.getInitialNetworkRetryDelay();
        const maxNetworkRetryDelay = this._stripe.getMaxNetworkRetryDelay();
        let sleepSeconds = Math.min(initialNetworkRetryDelay * Math.pow(numRetries - 1, 2), maxNetworkRetryDelay);
        sleepSeconds *= 0.5 * (1 + Math.random());
        sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);
        if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
          sleepSeconds = Math.max(sleepSeconds, retryAfter);
        }
        return sleepSeconds * 1e3;
      }
      // Max retries can be set on a per request basis. Favor those over the global setting
      _getMaxNetworkRetries(settings = {}) {
        return settings.maxNetworkRetries !== void 0 && Number.isInteger(settings.maxNetworkRetries) ? settings.maxNetworkRetries : this._stripe.getMaxNetworkRetries();
      }
      _defaultIdempotencyKey(method, settings) {
        const maxRetries = this._getMaxNetworkRetries(settings);
        if (method === "POST" && maxRetries > 0) {
          return `stripe-node-retry-${this._stripe._platformFunctions.uuid4()}`;
        }
        return null;
      }
      _makeHeaders(auth, contentLength, apiVersion, clientUserAgent, method, userSuppliedHeaders, userSuppliedSettings) {
        const defaultHeaders = {
          // Use specified auth token or use default from this stripe instance:
          Authorization: auth ? `Bearer ${auth}` : this._stripe.getApiField("auth"),
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this._getUserAgentString(),
          "X-Stripe-Client-User-Agent": clientUserAgent,
          "X-Stripe-Client-Telemetry": this._getTelemetryHeader(),
          "Stripe-Version": apiVersion,
          "Stripe-Account": this._stripe.getApiField("stripeAccount"),
          "Idempotency-Key": this._defaultIdempotencyKey(method, userSuppliedSettings)
        };
        const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
        if (methodHasPayload || contentLength) {
          if (!methodHasPayload) {
            emitWarning(`${method} method had non-zero contentLength but no payload is expected for this verb`);
          }
          defaultHeaders["Content-Length"] = contentLength;
        }
        return Object.assign(
          removeNullish(defaultHeaders),
          // If the user supplied, say 'idempotency-key', override instead of appending by ensuring caps are the same.
          normalizeHeaders(userSuppliedHeaders)
        );
      }
      _getUserAgentString() {
        const packageVersion = this._stripe.getConstant("PACKAGE_VERSION");
        const appInfo = this._stripe._appInfo ? this._stripe.getAppInfoAsString() : "";
        return `Stripe/v1 NodeBindings/${packageVersion} ${appInfo}`.trim();
      }
      _getTelemetryHeader() {
        if (this._stripe.getTelemetryEnabled() && this._stripe._prevRequestMetrics.length > 0) {
          const metrics = this._stripe._prevRequestMetrics.shift();
          return JSON.stringify({
            last_request_metrics: metrics
          });
        }
      }
      _recordRequestMetrics(requestId, requestDurationMs, usage) {
        if (this._stripe.getTelemetryEnabled() && requestId) {
          if (this._stripe._prevRequestMetrics.length > this._maxBufferedRequestMetric) {
            emitWarning("Request metrics buffer is full, dropping telemetry message.");
          } else {
            const m = {
              request_id: requestId,
              request_duration_ms: requestDurationMs
            };
            if (usage && usage.length > 0) {
              m.usage = usage;
            }
            this._stripe._prevRequestMetrics.push(m);
          }
        }
      }
      _request(method, host, path, data, auth, options = {}, usage = [], callback, requestDataProcessor = null) {
        let requestData;
        const retryRequest = /* @__PURE__ */ __name((requestFn, apiVersion, headers, requestRetries, retryAfter) => {
          return setTimeout(requestFn, this._getSleepTimeInMS(requestRetries, retryAfter), apiVersion, headers, requestRetries + 1);
        }, "retryRequest");
        const makeRequest = /* @__PURE__ */ __name((apiVersion, headers, numRetries) => {
          const timeout = options.settings && options.settings.timeout && Number.isInteger(options.settings.timeout) && options.settings.timeout >= 0 ? options.settings.timeout : this._stripe.getApiField("timeout");
          const req = this._stripe.getApiField("httpClient").makeRequest(host || this._stripe.getApiField("host"), this._stripe.getApiField("port"), path, method, headers, requestData, this._stripe.getApiField("protocol"), timeout);
          const requestStartTime = Date.now();
          const requestEvent = removeNullish({
            api_version: apiVersion,
            account: headers["Stripe-Account"],
            idempotency_key: headers["Idempotency-Key"],
            method,
            path,
            request_start_time: requestStartTime
          });
          const requestRetries = numRetries || 0;
          const maxRetries = this._getMaxNetworkRetries(options.settings || {});
          this._stripe._emitter.emit("request", requestEvent);
          req.then((res) => {
            if (_RequestSender._shouldRetry(res, requestRetries, maxRetries)) {
              return retryRequest(
                makeRequest,
                apiVersion,
                headers,
                requestRetries,
                // @ts-ignore
                res.getHeaders()["retry-after"]
              );
            } else if (options.streaming && res.getStatusCode() < 400) {
              return this._streamingResponseHandler(requestEvent, usage, callback)(res);
            } else {
              return this._jsonResponseHandler(requestEvent, usage, callback)(res);
            }
          }).catch((error) => {
            if (_RequestSender._shouldRetry(null, requestRetries, maxRetries, error)) {
              return retryRequest(makeRequest, apiVersion, headers, requestRetries, null);
            } else {
              const isTimeoutError = error.code && error.code === HttpClient.TIMEOUT_ERROR_CODE;
              return callback(new StripeConnectionError({
                message: isTimeoutError ? `Request aborted due to timeout being reached (${timeout}ms)` : _RequestSender._generateConnectionErrorMessage(requestRetries),
                // @ts-ignore
                detail: error
              }));
            }
          });
        }, "makeRequest");
        const prepareAndMakeRequest = /* @__PURE__ */ __name((error, data2) => {
          if (error) {
            return callback(error);
          }
          requestData = data2;
          this._stripe.getClientUserAgent((clientUserAgent) => {
            var _a, _b;
            const apiVersion = this._stripe.getApiField("version");
            const headers = this._makeHeaders(auth, requestData.length, apiVersion, clientUserAgent, method, (_a = options.headers) !== null && _a !== void 0 ? _a : null, (_b = options.settings) !== null && _b !== void 0 ? _b : {});
            makeRequest(apiVersion, headers, 0);
          });
        }, "prepareAndMakeRequest");
        if (requestDataProcessor) {
          requestDataProcessor(method, data, options.headers, prepareAndMakeRequest);
        } else {
          prepareAndMakeRequest(null, stringifyRequestData(data || {}));
        }
      }
    };
  }
});

// ../node_modules/stripe/esm/Webhooks.js
function createWebhooks(platformFunctions) {
  const Webhook = {
    DEFAULT_TOLERANCE: 300,
    // @ts-ignore
    signature: null,
    constructEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      try {
        this.signature.verifyHeader(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      } catch (e) {
        if (e instanceof CryptoProviderOnlySupportsAsyncError) {
          e.message += "\nUse `await constructEventAsync(...)` instead of `constructEvent(...)`";
        }
        throw e;
      }
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      return jsonPayload;
    },
    async constructEventAsync(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      await this.signature.verifyHeaderAsync(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      return jsonPayload;
    },
    /**
     * Generates a header to be used for webhook mocking
     *
     * @typedef {object} opts
     * @property {number} timestamp - Timestamp of the header. Defaults to Date.now()
     * @property {string} payload - JSON stringified payload object, containing the 'id' and 'object' parameters
     * @property {string} secret - Stripe webhook secret 'whsec_...'
     * @property {string} scheme - Version of API to hit. Defaults to 'v1'.
     * @property {string} signature - Computed webhook signature
     * @property {CryptoProvider} cryptoProvider - Crypto provider to use for computing the signature if none was provided. Defaults to NodeCryptoProvider.
     */
    generateTestHeaderString: /* @__PURE__ */ __name(function(opts) {
      if (!opts) {
        throw new StripeError({
          message: "Options are required"
        });
      }
      opts.timestamp = Math.floor(opts.timestamp) || Math.floor(Date.now() / 1e3);
      opts.scheme = opts.scheme || signature.EXPECTED_SCHEME;
      opts.cryptoProvider = opts.cryptoProvider || getCryptoProvider();
      opts.signature = opts.signature || opts.cryptoProvider.computeHMACSignature(opts.timestamp + "." + opts.payload, opts.secret);
      const generatedHeader = [
        "t=" + opts.timestamp,
        opts.scheme + "=" + opts.signature
      ].join(",");
      return generatedHeader;
    }, "generateTestHeaderString")
  };
  const signature = {
    EXPECTED_SCHEME: "v1",
    verifyHeader(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = cryptoProvider.computeHMACSignature(makeHMACContent(payload, details), secret);
      validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt);
      return true;
    },
    async verifyHeaderAsync(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = await cryptoProvider.computeHMACSignatureAsync(makeHMACContent(payload, details), secret);
      return validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt);
    }
  };
  function makeHMACContent(payload, details) {
    return `${details.timestamp}.${payload}`;
  }
  __name(makeHMACContent, "makeHMACContent");
  function parseEventDetails(encodedPayload, encodedHeader, expectedScheme) {
    if (!encodedPayload) {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No webhook payload was provided."
      });
    }
    const suspectPayloadType = typeof encodedPayload != "string" && !(encodedPayload instanceof Uint8Array);
    const textDecoder = new TextDecoder("utf8");
    const decodedPayload = encodedPayload instanceof Uint8Array ? textDecoder.decode(encodedPayload) : encodedPayload;
    if (Array.isArray(encodedHeader)) {
      throw new Error("Unexpected: An array was passed as a header, which should not be possible for the stripe-signature header.");
    }
    if (encodedHeader == null || encodedHeader == "") {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No stripe-signature header value was provided."
      });
    }
    const decodedHeader = encodedHeader instanceof Uint8Array ? textDecoder.decode(encodedHeader) : encodedHeader;
    const details = parseHeader(decodedHeader, expectedScheme);
    if (!details || details.timestamp === -1) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "Unable to extract timestamp and signatures from header"
      });
    }
    if (!details.signatures.length) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "No signatures found with expected scheme"
      });
    }
    return {
      decodedPayload,
      decodedHeader,
      details,
      suspectPayloadType
    };
  }
  __name(parseEventDetails, "parseEventDetails");
  function validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt) {
    const signatureFound = !!details.signatures.filter(platformFunctions.secureCompare.bind(platformFunctions, expectedSignature)).length;
    const docsLocation = "\nLearn more about webhook signing and explore webhook integration examples for various frameworks at https://github.com/stripe/stripe-node#webhook-signing";
    const whitespaceMessage = secretContainsWhitespace ? "\n\nNote: The provided signing secret contains whitespace. This often indicates an extra newline or space is in the value" : "";
    if (!signatureFound) {
      if (suspectPayloadType) {
        throw new StripeSignatureVerificationError(header, payload, {
          message: "Webhook payload must be provided as a string or a Buffer (https://nodejs.org/api/buffer.html) instance representing the _raw_ request body.Payload was provided as a parsed JavaScript object instead. \nSignature verification is impossible without access to the original signed material. \n" + docsLocation + "\n" + whitespaceMessage
        });
      }
      throw new StripeSignatureVerificationError(header, payload, {
        message: "No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe? \n If a webhook request is being forwarded by a third-party tool, ensure that the exact request body, including JSON formatting and new line style, is preserved.\n" + docsLocation + "\n" + whitespaceMessage
      });
    }
    const timestampAge = Math.floor((typeof receivedAt === "number" ? receivedAt : Date.now()) / 1e3) - details.timestamp;
    if (tolerance > 0 && timestampAge > tolerance) {
      throw new StripeSignatureVerificationError(header, payload, {
        message: "Timestamp outside the tolerance zone"
      });
    }
    return true;
  }
  __name(validateComputedSignature, "validateComputedSignature");
  function parseHeader(header, scheme) {
    if (typeof header !== "string") {
      return null;
    }
    return header.split(",").reduce((accum, item) => {
      const kv = item.split("=");
      if (kv[0] === "t") {
        accum.timestamp = parseInt(kv[1], 10);
      }
      if (kv[0] === scheme) {
        accum.signatures.push(kv[1]);
      }
      return accum;
    }, {
      timestamp: -1,
      signatures: []
    });
  }
  __name(parseHeader, "parseHeader");
  let webhooksCryptoProviderInstance = null;
  function getCryptoProvider() {
    if (!webhooksCryptoProviderInstance) {
      webhooksCryptoProviderInstance = platformFunctions.createDefaultCryptoProvider();
    }
    return webhooksCryptoProviderInstance;
  }
  __name(getCryptoProvider, "getCryptoProvider");
  Webhook.signature = signature;
  return Webhook;
}
var init_Webhooks = __esm({
  "../node_modules/stripe/esm/Webhooks.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_Error();
    init_CryptoProvider();
    __name(createWebhooks, "createWebhooks");
  }
});

// ../node_modules/stripe/esm/stripe.core.js
function createStripe(platformFunctions, requestSender = defaultRequestSenderFactory) {
  Stripe2.PACKAGE_VERSION = "14.25.0";
  Stripe2.USER_AGENT = Object.assign({ bindings_version: Stripe2.PACKAGE_VERSION, lang: "node", publisher: "stripe", uname: null, typescript: false }, determineProcessUserAgentProperties());
  Stripe2.StripeResource = StripeResource;
  Stripe2.resources = resources_exports;
  Stripe2.HttpClient = HttpClient;
  Stripe2.HttpClientResponse = HttpClientResponse;
  Stripe2.CryptoProvider = CryptoProvider;
  function createWebhooksDefault(fns = platformFunctions) {
    return createWebhooks(fns);
  }
  __name(createWebhooksDefault, "createWebhooksDefault");
  Stripe2.webhooks = Object.assign(createWebhooksDefault, createWebhooks(platformFunctions));
  function Stripe2(key, config = {}) {
    if (!(this instanceof Stripe2)) {
      return new Stripe2(key, config);
    }
    const props = this._getPropsFromConfig(config);
    this._platformFunctions = platformFunctions;
    Object.defineProperty(this, "_emitter", {
      value: this._platformFunctions.createEmitter(),
      enumerable: false,
      configurable: false,
      writable: false
    });
    this.VERSION = Stripe2.PACKAGE_VERSION;
    this.on = this._emitter.on.bind(this._emitter);
    this.once = this._emitter.once.bind(this._emitter);
    this.off = this._emitter.removeListener.bind(this._emitter);
    const agent = props.httpAgent || null;
    this._api = {
      auth: null,
      host: props.host || DEFAULT_HOST,
      port: props.port || DEFAULT_PORT,
      protocol: props.protocol || "https",
      basePath: DEFAULT_BASE_PATH,
      version: props.apiVersion || DEFAULT_API_VERSION,
      timeout: validateInteger("timeout", props.timeout, DEFAULT_TIMEOUT),
      maxNetworkRetries: validateInteger("maxNetworkRetries", props.maxNetworkRetries, 1),
      agent,
      httpClient: props.httpClient || (agent ? this._platformFunctions.createNodeHttpClient(agent) : this._platformFunctions.createDefaultHttpClient()),
      dev: false,
      stripeAccount: props.stripeAccount || null
    };
    const typescript = props.typescript || false;
    if (typescript !== Stripe2.USER_AGENT.typescript) {
      Stripe2.USER_AGENT.typescript = typescript;
    }
    if (props.appInfo) {
      this._setAppInfo(props.appInfo);
    }
    this._prepResources();
    this._setApiKey(key);
    this.errors = Error_exports;
    this.webhooks = createWebhooksDefault();
    this._prevRequestMetrics = [];
    this._enableTelemetry = props.telemetry !== false;
    this._requestSender = requestSender(this);
    this.StripeResource = Stripe2.StripeResource;
  }
  __name(Stripe2, "Stripe");
  Stripe2.errors = Error_exports;
  Stripe2.createNodeHttpClient = platformFunctions.createNodeHttpClient;
  Stripe2.createFetchHttpClient = platformFunctions.createFetchHttpClient;
  Stripe2.createNodeCryptoProvider = platformFunctions.createNodeCryptoProvider;
  Stripe2.createSubtleCryptoProvider = platformFunctions.createSubtleCryptoProvider;
  Stripe2.prototype = {
    // Properties are set in the constructor above
    _appInfo: void 0,
    on: null,
    off: null,
    once: null,
    VERSION: null,
    StripeResource: null,
    webhooks: null,
    errors: null,
    _api: null,
    _prevRequestMetrics: null,
    _emitter: null,
    _enableTelemetry: null,
    _requestSender: null,
    _platformFunctions: null,
    /**
     * @private
     */
    _setApiKey(key) {
      if (key) {
        this._setApiField("auth", `Bearer ${key}`);
      }
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setAppInfo(info) {
      if (info && typeof info !== "object") {
        throw new Error("AppInfo must be an object.");
      }
      if (info && !info.name) {
        throw new Error("AppInfo.name is required");
      }
      info = info || {};
      this._appInfo = APP_INFO_PROPERTIES.reduce(
        (accum, prop) => {
          if (typeof info[prop] == "string") {
            accum = accum || {};
            accum[prop] = info[prop];
          }
          return accum;
        },
        // @ts-ignore
        void 0
      );
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setApiField(key, value) {
      this._api[key] = value;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getApiField(key) {
      return this._api[key];
    },
    setClientId(clientId) {
      this._clientId = clientId;
    },
    getClientId() {
      return this._clientId;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getConstant: /* @__PURE__ */ __name((c) => {
      switch (c) {
        case "DEFAULT_HOST":
          return DEFAULT_HOST;
        case "DEFAULT_PORT":
          return DEFAULT_PORT;
        case "DEFAULT_BASE_PATH":
          return DEFAULT_BASE_PATH;
        case "DEFAULT_API_VERSION":
          return DEFAULT_API_VERSION;
        case "DEFAULT_TIMEOUT":
          return DEFAULT_TIMEOUT;
        case "MAX_NETWORK_RETRY_DELAY_SEC":
          return MAX_NETWORK_RETRY_DELAY_SEC;
        case "INITIAL_NETWORK_RETRY_DELAY_SEC":
          return INITIAL_NETWORK_RETRY_DELAY_SEC;
      }
      return Stripe2[c];
    }, "getConstant"),
    getMaxNetworkRetries() {
      return this.getApiField("maxNetworkRetries");
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setApiNumberField(prop, n, defaultVal) {
      const val = validateInteger(prop, n, defaultVal);
      this._setApiField(prop, val);
    },
    getMaxNetworkRetryDelay() {
      return MAX_NETWORK_RETRY_DELAY_SEC;
    },
    getInitialNetworkRetryDelay() {
      return INITIAL_NETWORK_RETRY_DELAY_SEC;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent and uses a cached version for a slight
     * speed advantage.
     */
    getClientUserAgent(cb) {
      return this.getClientUserAgentSeeded(Stripe2.USER_AGENT, cb);
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent by encoding a seeded object and
     * fetching a uname from the system.
     */
    getClientUserAgentSeeded(seed, cb) {
      this._platformFunctions.getUname().then((uname) => {
        var _a;
        const userAgent = {};
        for (const field in seed) {
          userAgent[field] = encodeURIComponent((_a = seed[field]) !== null && _a !== void 0 ? _a : "null");
        }
        userAgent.uname = encodeURIComponent(uname || "UNKNOWN");
        const client = this.getApiField("httpClient");
        if (client) {
          userAgent.httplib = encodeURIComponent(client.getClientName());
        }
        if (this._appInfo) {
          userAgent.application = this._appInfo;
        }
        cb(JSON.stringify(userAgent));
      });
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getAppInfoAsString() {
      if (!this._appInfo) {
        return "";
      }
      let formatted = this._appInfo.name;
      if (this._appInfo.version) {
        formatted += `/${this._appInfo.version}`;
      }
      if (this._appInfo.url) {
        formatted += ` (${this._appInfo.url})`;
      }
      return formatted;
    },
    getTelemetryEnabled() {
      return this._enableTelemetry;
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _prepResources() {
      for (const name in resources_exports) {
        this[pascalToCamelCase(name)] = new resources_exports[name](this);
      }
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _getPropsFromConfig(config) {
      if (!config) {
        return {};
      }
      const isString = typeof config === "string";
      const isObject2 = config === Object(config) && !Array.isArray(config);
      if (!isObject2 && !isString) {
        throw new Error("Config must either be an object or a string");
      }
      if (isString) {
        return {
          apiVersion: config
        };
      }
      const values = Object.keys(config).filter((value) => !ALLOWED_CONFIG_PROPERTIES.includes(value));
      if (values.length > 0) {
        throw new Error(`Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(", ")}`);
      }
      return config;
    }
  };
  return Stripe2;
}
var DEFAULT_HOST, DEFAULT_PORT, DEFAULT_BASE_PATH, DEFAULT_API_VERSION, DEFAULT_TIMEOUT, MAX_NETWORK_RETRY_DELAY_SEC, INITIAL_NETWORK_RETRY_DELAY_SEC, APP_INFO_PROPERTIES, ALLOWED_CONFIG_PROPERTIES, defaultRequestSenderFactory;
var init_stripe_core = __esm({
  "../node_modules/stripe/esm/stripe.core.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_Error();
    init_apiVersion();
    init_resources();
    init_HttpClient();
    init_utils();
    init_CryptoProvider();
    init_RequestSender();
    init_StripeResource();
    init_Webhooks();
    DEFAULT_HOST = "api.stripe.com";
    DEFAULT_PORT = "443";
    DEFAULT_BASE_PATH = "/v1/";
    DEFAULT_API_VERSION = ApiVersion;
    DEFAULT_TIMEOUT = 8e4;
    MAX_NETWORK_RETRY_DELAY_SEC = 2;
    INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;
    APP_INFO_PROPERTIES = ["name", "version", "url", "partner_id"];
    ALLOWED_CONFIG_PROPERTIES = [
      "apiVersion",
      "typescript",
      "maxNetworkRetries",
      "httpAgent",
      "httpClient",
      "timeout",
      "host",
      "port",
      "protocol",
      "telemetry",
      "appInfo",
      "stripeAccount"
    ];
    defaultRequestSenderFactory = /* @__PURE__ */ __name((stripe) => new RequestSender(stripe, StripeResource.MAX_BUFFERED_REQUEST_METRICS), "defaultRequestSenderFactory");
    __name(createStripe, "createStripe");
  }
});

// ../node_modules/stripe/esm/stripe.esm.worker.js
var Stripe, stripe_esm_worker_default;
var init_stripe_esm_worker = __esm({
  "../node_modules/stripe/esm/stripe.esm.worker.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_WebPlatformFunctions();
    init_stripe_core();
    Stripe = createStripe(new WebPlatformFunctions());
    stripe_esm_worker_default = Stripe;
  }
});

// api/checkout.js
async function onRequestPost2(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
  };
  try {
    const apiKey = env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Falta la variable de entorno STRIPE_SECRET_KEY en Cloudflare." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const stripe = new stripe_esm_worker_default(apiKey, {
      apiVersion: "2023-10-16",
      httpClient: stripe_esm_worker_default.createSubresourceHTTPClient()
      // Optimización nativa para Cloudflare Workers
    });
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }
    const priceId = body.priceId || "price_1U0y94FlwFW4ifPSpmUw7WMV";
    const email = body.email || "";
    const company = body.company || body.empresa || "";
    const mode = body.mode || "subscription";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode,
      customer_email: email.trim() !== "" ? email.trim() : void 0,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      custom_fields: [
        {
          key: "empresa",
          label: { type: "custom", custom: "Nombre de la Empresa / Organizaci\xF3n" },
          type: "text",
          optional: false
        }
      ],
      metadata: {
        company,
        source: "SAARE_PLATFORM_CLOUDFLARE"
      },
      success_url: `https://www.saare.es/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.saare.es/pricing?canceled=true`
    });
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en Cloudflare Function Stripe Checkout:", error);
    return new Response(
      JSON.stringify({ error: "Error al iniciar Stripe Checkout", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    }
  });
}
var init_checkout = __esm({
  "api/checkout.js"() {
    init_functionsRoutes_0_35428525275895484();
    init_stripe_esm_worker();
    __name(onRequestPost2, "onRequestPost");
    __name(onRequestOptions, "onRequestOptions");
  }
});

// api/deployments.js
async function onRequestPost3(context) {
  try {
    const payload = await context.request.json();
    const { tenant_id, active_scenario, scenario_name, governance_level, updated_at } = payload;
    if (context.env && context.env.DB) {
      await context.env.DB.prepare(`
        INSERT INTO deployments (tenant_id, active_scenario, scenario_name, governance_level, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(tenant_id) DO UPDATE SET
          active_scenario = excluded.active_scenario,
          scenario_name = excluded.scenario_name,
          governance_level = excluded.governance_level,
          updated_at = excluded.updated_at
      `).bind(tenant_id, active_scenario, scenario_name, governance_level, updated_at).run();
    }
    return new Response(JSON.stringify({ status: "SUCCESS", payload }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const tenantId = url.searchParams.get("tenantId");
  if (context.env && context.env.DB && tenantId) {
    const result = await context.env.DB.prepare("SELECT * FROM deployments WHERE tenant_id = ?").bind(tenantId).first();
    return new Response(JSON.stringify(result || null), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  return new Response(JSON.stringify({ message: "Servicio D1 listo en Edge" }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
var init_deployments = __esm({
  "api/deployments.js"() {
    init_functionsRoutes_0_35428525275895484();
    __name(onRequestPost3, "onRequestPost");
    __name(onRequestGet, "onRequestGet");
  }
});

// api/license.ts
async function onRequest3(context) {
  const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature" };
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    let body = {};
    if (context.request.method === "POST") {
      body = await context.request.json();
    }
    const customerEmail = body.data?.object?.customer_details?.email || body.data?.object?.customer_email || "cliente@saare.es";
    const companyName = body.data?.object?.custom_fields?.[0]?.text?.value || "Empresa Cliente";
    const evalToken = btoa(JSON.stringify({ company: companyName, type: "ENTERPRISE_LICENSE", exp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString() }));
    return new Response(JSON.stringify({ success: true, message: "Licencia generada correctamente", customerEmail, evalToken }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
var init_license = __esm({
  "api/license.ts"() {
    init_functionsRoutes_0_35428525275895484();
    __name(onRequest3, "onRequest");
  }
});

// api/middleware.js
async function onRequest4(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/engineer")) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Token JWT no proporcionado." }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    try {
      const token = authHeader.split(" ")[1];
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      if (decodedPayload.role !== "engineer" && decodedPayload.role !== "admin") {
        return new Response(
          JSON.stringify({
            error: "FORBIDDEN",
            message: "Acceso denegado: El perfil " + decodedPayload.role + " no tiene permisos de ingenier\xEDa."
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "INVALID_TOKEN", message: "Firma o formato del token no v\xE1lido." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
  return context.next();
}
var init_middleware = __esm({
  "api/middleware.js"() {
    init_functionsRoutes_0_35428525275895484();
    __name(onRequest4, "onRequest");
  }
});

// _middleware.js
async function onRequest5(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/engineer")) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Token JWT no proporcionado." }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    try {
      const token = authHeader.split(" ")[1];
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      if (decodedPayload.role !== "engineer" && decodedPayload.role !== "admin") {
        return new Response(
          JSON.stringify({
            error: "FORBIDDEN",
            message: "Acceso denegado: El perfil " + decodedPayload.role + " no tiene permisos de ingenier\xEDa."
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "INVALID_TOKEN", message: "Firma o formato del token no v\xE1lido." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
  return context.next();
}
var init_middleware2 = __esm({
  "_middleware.js"() {
    init_functionsRoutes_0_35428525275895484();
    __name(onRequest5, "onRequest");
  }
});

// ../.wrangler/tmp/pages-Uiz8UE/functionsRoutes-0.35428525275895484.mjs
var routes;
var init_functionsRoutes_0_35428525275895484 = __esm({
  "../.wrangler/tmp/pages-Uiz8UE/functionsRoutes-0.35428525275895484.mjs"() {
    init_completions();
    init_config();
    init_leads();
    init_checkout();
    init_checkout();
    init_deployments();
    init_deployments();
    init_license();
    init_middleware();
    init_middleware2();
    routes = [
      {
        routePath: "/v1/chat/completions",
        mountPath: "/v1/chat",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/engineer/config",
        mountPath: "/api/engineer",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/v1/leads",
        mountPath: "/api/v1",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/checkout",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions]
      },
      {
        routePath: "/api/checkout",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/deployments",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/deployments",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/license",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/middleware",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest5],
        modules: []
      }
    ];
  }
});

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_35428525275895484();

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_35428525275895484();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
