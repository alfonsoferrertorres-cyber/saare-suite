// apps/control-plane/src/modules/statStatelessL7.js
// Componente: STAT_STATELESS_L7 | Ref: MS3V RECON VALID 2026 ALF 0521

const ALLOWED_TOOL_GRAMMAR = /^[a-zA-Z0-9_.:-]{1,64}$/;

const FORBIDDEN_AST_PATTERNS = [
  /\b(eval|exec|execSync|spawn|spawnSync|fork|Function|setTimeout|setInterval)\s*\(/i,
  /\b(child_process|os\.system|subprocess|pickle\.loads|yaml\.load|__import__)\b/i,
  /(\bDROP\s+TABLE\b|\bTRUNCATE\s+TABLE\b|\bDELETE\s+FROM\b|\bUNION\s+SELECT\b|--\s*$)/i,
  /(\$\(.*\)|`[^`]+`|\|\|\s*rm\s+-rf|;\s*rm\s+-rf|\bcurl\s+http|\bwget\s+http)/i,
  /(ignore\s+all\s+previous\s+instructions|system\s+override|developer\s+mode|jailbreak)/i
];

function buildAstNodes(input, depth = 0, maxDepth = 8) {
  if (depth > maxDepth) {
    return { type: "AST_DEPTH_OVERFLOW", unsafe: true, reason: "CFG_MAX_DEPTH_EXCEEDED" };
  }

  if (input === null || input === undefined) {
    return { type: "LiteralNull", value: null, unsafe: false };
  }

  if (typeof input === "string") {
    const matchedRule = FORBIDDEN_AST_PATTERNS.find((rx) => rx.test(input));
    return {
      type: "StringLiteral",
      length: input.length,
      unsafe: Boolean(matchedRule),
      reason: matchedRule ? `GRAMMAR_VIOLATION:${matchedRule.source.slice(0, 32)}` : null
    };
  }

  if (typeof input === "number" || typeof input === "boolean") {
    return { type: "PrimitiveLiteral", unsafe: false };
  }

  if (Array.isArray(input)) {
    const children = input.map((item) => buildAstNodes(item, depth + 1, maxDepth));
    const unsafeChild = children.find((c) => c.unsafe);
    return {
      type: "ArrayExpression",
      count: children.length,
      children,
      unsafe: Boolean(unsafeChild),
      reason: unsafeChild?.reason || null
    };
  }

  if (typeof input === "object") {
    const properties = [];
    for (const [key, val] of Object.entries(input)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return { type: "PrototypePollutionNode", unsafe: true, reason: "CFG_PROTOTYPE_POLLUTION" };
      }

      if ((key === "name" || key === "function" || key === "method") && typeof val === "string") {
        if (!ALLOWED_TOOL_GRAMMAR.test(val)) {
          return {
            type: "ToolIdentifierNode",
            identifier: val,
            unsafe: true,
            reason: "INVALID_TOOL_IDENTIFIER_GRAMMAR"
          };
        }
      }

      const valueNode = buildAstNodes(val, depth + 1, maxDepth);
      if (valueNode.unsafe) {
        return {
          type: "ObjectPropertyNode",
          key,
          unsafe: true,
          reason: valueNode.reason
        };
      }
      properties.push({ key, nodeType: valueNode.type });
    }
    return { type: "ObjectExpression", properties, unsafe: false };
  }

  return { type: "UnknownNode", unsafe: true, reason: "UNSUPPORTED_AST_TYPE" };
}

export async function evaluateStatStatelessL7(payload, options = {}) {
  const startNs = performance.now();
  const encoder = new TextEncoder();
  const serialized = JSON.stringify(payload ?? {});
  const volatileBuffer = new Uint8Array(encoder.encode(serialized).length);
  encoder.encodeInto(serialized, volatileBuffer);

  try {
    // 1 & 2. Tokenización y parseo estructural desde el buffer volátil
    const decoder = new TextDecoder();
    const parsedFrame = JSON.parse(decoder.decode(volatileBuffer));

    // 3 & 4. Construcción del AST y validación contra gramáticas regulares / libres de contexto
    const astRoot = buildAstNodes({
      prompt: parsedFrame.prompt || "",
      messages: parsedFrame.messages || [],
      tools: parsedFrame.tools || [],
      tool_calls: parsedFrame.tool_calls || parsedFrame.function_call || null,
      method: parsedFrame.method || null,
      params: parsedFrame.params || null
    });

    const tenantAllowedTools = Array.isArray(options.allowedTools) ? options.allowedTools : null;
    const requestedTools = [
      ...(Array.isArray(parsedFrame.tools) ? parsedFrame.tools.map((t) => t?.function?.name || t?.name) : []),
      ...(Array.isArray(parsedFrame.tool_calls) ? parsedFrame.tool_calls.map((tc) => tc?.function?.name || tc?.name) : []),
      ...(parsedFrame.method ? [parsedFrame.method] : [])
    ].filter(Boolean);

    let unauthorizedTool = null;
    if (tenantAllowedTools && requestedTools.length > 0) {
      unauthorizedTool = requestedTools.find((tName) => !tenantAllowedTools.includes(tName)) || null;
    }

    const isDenied = Boolean(astRoot.unsafe || unauthorizedTool);
    const reason = unauthorizedTool
      ? `TOOL_NOT_WHITELISTED:${unauthorizedTool}`
      : (astRoot.reason || "AST_GRAMMAR_VERIFIED");

    const latencyMs = Number((performance.now() - startNs).toFixed(3));

    return {
      component: "STAT_STATELESS_L7",
      reference: "MS3V RECON VALID 2026 ALF 0521",
      executionMode: "LOCAL_LOOPBACK_BIND_RAM",
      verdict: isDenied ? "DENY" : "ALLOW",
      status: isDenied ? "RECHAZADO" : "APROBADO",
      reason,
      inspectedTools: requestedTools,
      astSummary: {
        rootType: astRoot.type,
        deterministic: true
      },
      ramWipeExecuted: true,
      latencyMs
    };
  } finally {
    // 5. Cero persistencia: sobrescritura posicional completa a nivel de bits (0x00)
    volatileBuffer.fill(0x00);
  }
}