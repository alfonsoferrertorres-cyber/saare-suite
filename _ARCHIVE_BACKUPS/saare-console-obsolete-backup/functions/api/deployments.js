export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const { tenant_id, active_scenario, scenario_name, governance_level, updated_at } = payload;

    // Si D1 está configurado en env.DB, inserta o actualiza
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const tenantId = url.searchParams.get('tenantId');

  if (context.env && context.env.DB && tenantId) {
    const result = await context.env.DB.prepare('SELECT * FROM deployments WHERE tenant_id = ?').bind(tenantId).first();
    return new Response(JSON.stringify(result || null), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  return new Response(JSON.stringify({ message: "Servicio D1 listo en Edge" }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
