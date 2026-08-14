export async function onRequestPost(context) {
  const scenario = context.request.headers.get("X-SAARE-Scenario") || "eu_ai_act_es";

  return new Response(JSON.stringify({
    id: "chatcmpl-saare-l7",
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
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
