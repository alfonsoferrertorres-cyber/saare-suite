import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    high_concurrency_stress: {
      executor: 'shared-iterations',
      vus: 50,                   // 50 usuarios virtuales concurrentes
      iterations: 10000,         // N = 10.000 muestras para significancia estadística
      maxDuration: '10m',        // Tiempo máximo de ejecución
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  // Cambia la URL por tu endpoint dedicado de staging/preproducción si aplica
  const url = 'https://api.saare.es/v1/intercept'; 
  const payload = JSON.stringify({
    prompt: 'Solicitud masiva de prueba de carga N=10000 - Evaluacion de resiliencia y latencia L7',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}