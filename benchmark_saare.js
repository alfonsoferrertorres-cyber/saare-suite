import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    stress_test: {
      executor: 'shared-iterations',
      vus: 50,                  # 50 usuarios concurrentes
      iterations: 10000,        # N = 10,000 muestras para significancia estadística
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
  check(res, { 'status is 200': (r) => r.status === 200 });
}