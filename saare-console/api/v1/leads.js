export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = await context.request.json();
    const { name, email, company, role, environment, useCase, complianceNeeds, type } = body;

    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Falta la clave RESEND_API_KEY en las variables de Cloudflare.' 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Envío a través de Resend usando tu dominio verificado saare.es
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'S.A.A.R.E. Discovery <legal@saare.es>',
        to: ['legal@saare.es'],
        reply_to: email, // Para responder directamente al correo que puso el cliente
        subject: `[NUEVO LEAD DISCOVERY] ${company || name}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #c5a059; margin-top: 0; font-size: 20px;">Nueva Solicitud de Evaluación Discovery</h2>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Se ha recibido una nueva solicitud a través del portal S.A.A.R.E.</p>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569; width: 40%;">Nombre completo:</td>
                <td style="padding: 10px 0; color: #0f172a;">${name || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Empresa / Organización:</td>
                <td style="padding: 10px 0; color: #0f172a;">${company || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Correo corporativo:</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #c5a059; text-decoration: none; font-weight: bold;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Cargo / Función:</td>
                <td style="padding: 10px 0; color: #0f172a;">${role || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Entorno de despliegue:</td>
                <td style="padding: 10px 0; color: #0f172a;">${environment || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Carga de trabajo:</td>
                <td style="padding: 10px 0; color: #0f172a;">${useCase || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Marcos normativos:</td>
                <td style="padding: 10px 0; color: #0f172a;">${complianceNeeds || 'N/A'}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              Mensaje procesado mediante Cloudflare Pages Functions & Resend API.
            </div>
          </div>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: resendData.message || 'Error al enviar correo desde Resend.' 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'success', 
        message: 'Correo enviado a legal@saare.es con éxito.' 
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}