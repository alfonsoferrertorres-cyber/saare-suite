// benchmark_saare.js — S.A.A.R.E. Benchmark Test
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
  const url = __ENV.TARGET_URL || 'https://api.saare.es/v1/intercept';
  const payload = JSON.stringify({ 
    prompt: 'Usuario DNI 12345678X solicitando acceso a expediente bancario' 
  });
  const params = { 
    headers: { 
      'Content-Type': 'application/json',
      'X-Saare-Tenant': 'ENTERPRISE'
    } 
  };
  
  const res = http.post(url, payload, params);
  
  check(res, { 
    'Petición evaluada correctamente (Allow/Deny)': (r) => r.status === 200 || r.status === 403 
  });
}