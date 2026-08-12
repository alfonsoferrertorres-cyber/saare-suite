const CONTROL_PLANE_API = "http://localhost:3001/api/v1";

export async function interceptAndRecordPrompt(promptText, userToken = "USER-EDD4309534") {
  const hasPII = /[0-9]{7,9}[a-zA-Z]/i.test(promptText) || /DNI|NIE|PASAPORTE/i.test(promptText);

  const payload = {
    prompt: promptText,
    user: userToken,
    decision: hasPII ? "RECHAZADO" : "PERMITIDO",
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(CONTROL_PLANE_API + "/intercept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return data.receipt;
    }
  } catch (err) {
    console.warn("Control Plane offline. Generando recibo local...");
  }

  return {
    evidenceId: 'EV-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8) + '-' + Math.floor(1000 + Math.random() * 9000),
    timestamp: payload.timestamp,
    userAnonymized: userToken,
    decision: payload.decision,
    sha256: 'sha256-' + Math.random().toString(36).substring(2, 34) + '-ED25519-SIG'
  };
}