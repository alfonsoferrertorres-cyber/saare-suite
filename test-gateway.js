async function enviarPromptAGateway() {
  const url = "https://api.saare.es/api/v1/proxy/llm";
  const apiKey = "saare_sk_test_9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822c";

  const payload = {
    tenant: "ORGANISMO_DEMO_01",
    provider: "OPENAI",
    model: "gpt-4o",
    messages: [
      { role: "user", content: "Hola S.A.A.R.E., prueba de registro agnóstico tras actualización." }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
enviarPromptAGateway();