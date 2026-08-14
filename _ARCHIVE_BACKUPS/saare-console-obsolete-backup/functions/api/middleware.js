export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Interceptar todo el tráfico bajo /api/engineer/
  if (url.pathname.startsWith('/api/engineer')) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Token JWT no proporcionado.' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    try {
      const token = authHeader.split(' ')[1];
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      if (decodedPayload.role !== 'engineer' && decodedPayload.role !== 'admin') {
        return new Response(
          JSON.stringify({ 
            error: 'FORBIDDEN', 
            message: 'Acceso denegado: El perfil ' + decodedPayload.role + ' no tiene permisos de ingeniería.' 
          }),
          { 
            status: 403, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            } 
          }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'INVALID_TOKEN', message: 'Firma o formato del token no válido.' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }
  }

  return context.next();
}
