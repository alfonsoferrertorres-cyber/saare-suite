export async function onRequest(context) {
  // Esta respuesta solo se enviará si el middleware permite el paso
  return new Response(
    JSON.stringify({
      status: "SUCCESS",
      system: "S.A.A.R.E. Engine",
      mode: "ENGINEERING_ACTIVE",
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    }
  );
}
