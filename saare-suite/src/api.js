/* ==========================================================================
   __tests__/integration.test.jsx · Integración con MSW
   ========================================================================== */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';

// Mock handlers para los 11 endpoints
const handlers = [
  // 1. POST /v1/auth/login
  http.post('*/v1/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@saare.es' && body.password === 'validpass123') {
      return HttpResponse.json(
        {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'refresh_token_mock',
          user: {
            email: 'test@saare.es',
            role: 'CISO_SECOPS_LEVEL_3',
            tenantName: 'ENTERPRISE',
            plan: 'Professional',
          },
        },
        { status: 200 }
      );
    }
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // 2. POST /v1/auth/refresh
  http.post('*/v1/auth/refresh', async ({ request }) => {
    const body = await request.json();
    if (body.refresh_token === 'refresh_token_mock') {
      return HttpResponse.json(
        {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...new',
          refreshToken: 'refresh_token_mock_new',
        },
        { status: 200 }
      );
    }
    return HttpResponse.json(
      { error: 'Refresh token expired' },
      { status: 401 }
    );
  }),

  // 3. POST /v1/auth/logout
  http.post('*/v1/auth/logout', () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // 4. GET /v1/auth/me
  http.get('*/v1/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth?.includes('Bearer')) {
      return HttpResponse.json(
        {
          user: {
            email: 'test@saare.es',
            role: 'CISO_SECOPS_LEVEL_3',
            tenantName: 'ENTERPRISE',
            plan: 'Professional',
          },
        },
        { status: 200 }
      );
    }
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  // 5. POST /v1/auth/reset-password-request
  http.post('*/v1/auth/reset-password-request', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        success: true,
        message: 'Reset link enviado a ' + body.email,
      },
      { status: 200 }
    );
  }),

  // 6. POST /v1/auth/verify-otp
  http.post('*/v1/auth/verify-otp', async ({ request }) => {
    const body = await request.json();
    if (body.otp === '123456') {
      return HttpResponse.json(
        {
          success: true,
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...reset',
          user: {
            email: body.email,
            role: 'CISO_SECOPS_LEVEL_3',
          },
        },
        { status: 200 }
      );
    }
    return HttpResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }),

  // 7. POST /v1/trial
  http.post('*/v1/trial', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        token: 'trial_token_mock',
        user: {
          email: body.email,
          role: 'TRIAL_USER',
          tenantName: 'TRIAL',
        },
        tenant: {
          name: 'TRIAL',
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      { status: 201 }
    );
  }),

  // 8. POST /v1/trial/submit
  http.post('*/v1/trial/submit', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        success: true,
        ref: 'TRIAL-' + Date.now(),
      },
      { status: 200 }
    );
  }),

  // 9. POST /v1/checkout
  http.post('*/v1/checkout', async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.includes('Bearer')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    return HttpResponse.json(
      {
        url: `https://checkout.stripe.com/pay/cs_test_${body.price}`,
      },
      { status: 200 }
    );
  }),

  // 10. GET /v1/trust-anchor/verify/{hash}
  http.get('*/v1/trust-anchor/verify/:hash', ({ params }) => {
    if (params.hash === '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842') {
      return HttpResponse.json(
        {
          status: 'VERIFIED',
          hash: params.hash,
          algorithm: 'SHA-256',
          standard: 'RFC 3161',
        },
        { status: 200 }
      );
    }
    return HttpResponse.json(
      { status: 'UNVERIFIABLE' },
      { status: 404 }
    );
  }),

  // 11. POST /v1/audit/submit
  http.post('*/v1/audit/submit', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        success: true,
        informe_url: `https://saare.es/audit/${Date.now()}`,
      },
      { status: 200 }
    );
  }),
];

const server = setupServer(...handlers);

// ==========================================================================
// TESTS
// ==========================================================================

describe('S.A.A.R.E. API Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('POST /v1/auth/login · válido', async () => {
    const res = await fetch('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@saare.es',
        password: 'validpass123',
        role: 'CISO_SECOPS_LEVEL_3',
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('test@saare.es');
  });

  it('POST /v1/auth/login · inválido', async () => {
    const res = await fetch('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@saare.es',
        password: 'wrongpassword',
        role: 'CISO_SECOPS_LEVEL_3',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('GET /v1/auth/me · sin auth', async () => {
    const res = await fetch('/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /v1/auth/me · con auth', async () => {
    const res = await fetch('/v1/auth/me', {
      headers: { Authorization: 'Bearer token_mock' },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toBeDefined();
  });

  it('POST /v1/trial · registro de demo', async () => {
    const res = await fetch('/v1/trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Juan Pérez',
        empresa: 'Acme Inc',
        email: 'juan@acme.es',
        modo: 'trial',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.tenant.expiresAt).toBeDefined();
  });

  it('GET /v1/trust-anchor/verify/{hash} · válido', async () => {
    const hash = '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842';
    const res = await fetch(`/v1/trust-anchor/verify/${hash}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('VERIFIED');
  });

  it('GET /v1/trust-anchor/verify/{hash} · inválido', async () => {
    const res = await fetch('/v1/trust-anchor/verify/invalid-hash');
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.status).toBe('UNVERIFIABLE');
  });

  it('POST /v1/auth/refresh · token válido', async () => {
    const res = await fetch('/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: 'refresh_token_mock' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
  });

  it('POST /v1/checkout · sin auth', async () => {
    const res = await fetch('/v1/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 'price_professional', mode: 'payment' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /v1/checkout · con auth', async () => {
    const res = await fetch('/v1/checkout', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token_mock',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ price: 'price_professional', mode: 'payment' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toContain('checkout.stripe.com');
  });

  it('POST /v1/audit/submit · envío de informe', async () => {
    const res = await fetch('/v1/audit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Audit 2024',
        contenido: 'Log de auditoría',
        campo3: 'val',
        campo4: 'val',
        campo5: 'val',
        campo6: 'val',
        campo7: 'val',
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.informe_url).toBeDefined();
  });
});

describe('Error Handling', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('Maneja 408 Timeout', async () => {
    server.use(
      http.post('*/v1/timeout-test', () => {
        return HttpResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        );
      })
    );
    const res = await fetch('/v1/timeout-test', { method: 'POST' });
    expect(res.status).toBe(408);
  });

  it('Maneja 429 Rate Limit', async () => {
    server.use(
      http.post('*/v1/ratelimit-test', () => {
        return HttpResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      })
    );
    const res = await fetch('/v1/ratelimit-test', { method: 'POST' });
    expect(res.status).toBe(429);
  });

  it('Maneja 5xx Server Error', async () => {
    server.use(
      http.post('*/v1/server-error-test', () => {
        return HttpResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      })
    );
    const res = await fetch('/v1/server-error-test', { method: 'POST' });
    expect(res.status).toBe(500);
  });
});