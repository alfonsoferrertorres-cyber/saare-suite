export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const timestamp = new Date().toISOString();
    const evidenceId = body.id || `EV-${Math.floor(100000 + Math.random() * 900000)}`;

    const responsePayload = {
      status: "success",
      message: "Evidence recorded on Cloud Dual-Vault L7",
      evidence_id: evidenceId,
      timestamp_rfc3161: timestamp,
      received: body
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
