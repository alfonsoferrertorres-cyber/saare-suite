// Servicio de generación y gestión de sesiones JWT de prueba para desarrollo

export function generateTestToken(role = 'engineer') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'user-admin-01',
    name: 'Alfonso ISV',
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24h
  };

  const b64Header = btoa(JSON.stringify(header));
  const b64Payload = btoa(JSON.stringify(payload));
  const dummySignature = 'mocked_signature_for_dev_mode';

  const jwt = `${b64Header}.${b64Payload}.${dummySignature}`;
  localStorage.setItem('saare_jwt_token', jwt);
  return jwt;
}

export function getStoredToken() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('saare_jwt_token') || null;
  }
  return null;
}

export function clearToken() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('saare_jwt_token');
  }
}
