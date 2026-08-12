import { Resend } from 'resend';

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const payload = await request.json();

    const governanceProfile = {
      environmentType: payload.deploymentModel || payload.environment || payload.env || 'Hybrid Enterprise AI',
      governanceMaturity: 'Developing',
      exposureAreas: [
        'Runtime Policy Enforcement',
        'AI Agent & MCP Boundary Control',
        'Auditable Evidence Logging',
        'Sensitive Data Exposure (DLP)'
      ]
    };

    if (env.DB) {
      await env.DB.prepare(
        'INSERT INTO leads (email, environment_type, payload_json, created_at) VALUES (?, ?, ?, ?)'
      ).bind(
        payload.email || 'anon@saare.es',
        governanceProfile.environmentType,
        JSON.stringify(governanceProfile),
        new Date().toISOString()
      ).run();
    }

    if (env.RESEND_API_KEY && payload.email) {
      const resend = new Resend(env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'S.A.A.R.E. Governance <no-reply@saare.es>',
        to: payload.email,
        subject: 'Perfil de Gobernanza IA Registrado',
        html: \<p>Se ha generado el perfil para el entorno: <strong>\</strong></p>\
      });
    }

    return new Response(JSON.stringify({ success: true, profile: governanceProfile }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
