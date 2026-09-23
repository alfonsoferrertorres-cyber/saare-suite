// benchmark_saare.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    stress_test: {
      executor: 'shared-iterations',
      vus: 50,
      iterations: 10000,
      maxDuration: '5m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const url = 'https://api.saare.es/v1/intercept';
  const payload = JSON.stringify({ prompt: 'Usuario DNI 12345678X solicitando acceso' });
  const params = { headers: { 'Content-Type': 'application/json' } };
  
  const res = http.post(url, payload, params);
  
  // Acepta 200 (Permitido) o 403 (Bloqueado por PII de forma correcta)
  check(res, { 
    'petición evaluada correctamente': (r) => r.status === 200 || r.status === 403 
  });
}