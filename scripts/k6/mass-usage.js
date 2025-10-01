import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Massive usage simulation with frontend browsing + optional authenticated API traffic
// Env vars:
// - BASE_URL: your frontend URL (e.g., https://your.lovable.app)
// - FUNCTIONS_URL: Supabase Functions base URL (e.g., https://<project>.supabase.co/functions)
//   You can an aulso set SUPABASE_FUNCTIONS_URL instead of FUNCTIONS_URL
// - AUTH_TOKEN: JWT for athenticated user (bearer)
// - USER_ID: UUID for that user (needed for session-balance route)
// - PRESTADOR_ID: optional UUID for prestador-profile route

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const FUNCTIONS_URL = __ENV.FUNCTIONS_URL || __ENV.SUPABASE_FUNCTIONS_URL || '';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';
const USER_ID = __ENV.USER_ID || '';
const PRESTADOR_ID = __ENV.PRESTADOR_ID || '';

const hasAuthApi = !!(FUNCTIONS_URL && AUTH_TOKEN);

function buildOptions() {
  const scenarios = {
    landing_browse: {
      executor: 'ramping-arrival-rate',
      startRate: 20,
      timeUnit: '1s',
      preAllocatedVUs: 400,
      maxVUs: 1000,
      stages: [
        { target: 100, duration: '3m' },  // warmup
        { target: 200, duration: '7m' },  // ramp
        { target: 200, duration: '10m' }, // sustain
        { target: 0, duration: '2m' },    // ramp down
      ],
      exec: 'landing',
      tags: { scenario: 'landing_browse' },
    },
  };

  if (hasAuthApi) {
    scenarios.api_authenticated = {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 600,
      stages: [
        { target: 50, duration: '3m' },
        { target: 100, duration: '7m' },
        { target: 100, duration: '10m' },
        { target: 0, duration: '2m' },
      ],
      exec: 'apiAuth',
      tags: { scenario: 'api_authenticated' },
    };
  }

  return {
    thresholds: {
      'http_req_failed{scenario:landing_browse}': ['rate<0.01'],
      'http_req_duration{scenario:landing_browse}': ['p(95)<800'],
      ...(hasAuthApi
        ? {
            'http_req_failed{scenario:api_authenticated}': ['rate<0.02'],
            'http_req_duration{scenario:api_authenticated}': ['p(95)<1000'],
          }
        : {}),
    },
    scenarios,
  };
}

export const options = buildOptions();

export function landing() {
  // Simulate a user hitting the homepage and a few key routes
  const pages = [
    '/',
    '/prestadores',
    '/autoajuda',
    '/agendar-sessao',
  ];

  group('browse-pages', () => {
    pages.forEach((p) => {
      const res = http.get(`${BASE_URL}${p}`);
      check(res, {
        'page status ok': (r) => [200, 301, 302, 304].includes(r.status),
        'html or redirect': (r) => r.status !== 200 || String(r.headers['Content-Type'] || '').includes('text/html') || r.body.includes('<html'),
      });
      sleep(Math.random() * 0.4);
    });
  });

  group('static-assets', () => {
    const assets = ['/manifest.json', '/favicon.ico'];
    assets.forEach((path) => {
      const r = http.get(`${BASE_URL}${path}`);
      check(r, { [`asset ${path}`]: (rr) => rr.status === 200 || rr.status === 304 });
      sleep(Math.random() * 0.2);
    });
  });

  // brief think time between iterations
  sleep(Math.random() * 1.2);
}

export function apiAuth() {
  if (!hasAuthApi) {
    // Nothing to do if not configured
    sleep(1);
    return;
  }

  const headers = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Session balance (GET /v1/session-balance/:userId)
  if (USER_ID) {
    const sb = http.get(`${FUNCTIONS_URL}/v1/session-balance/${USER_ID}`, { headers });
    check(sb, {
      'session-balance 200': (r) => r.status === 200,
    });
  }

  // Bookings list (GET)
  const bl = http.get(`${FUNCTIONS_URL}/v1/booking-list`, { headers });
  check(bl, {
    'booking-list ok': (r) => r.status === 200,
  });

  // Prestador profile (GET /v1/prestador-profile/:id) if provided
  if (PRESTADOR_ID) {
    const pp = http.get(`${FUNCTIONS_URL}/v1/prestador-profile/${PRESTADOR_ID}`, { headers });
    check(pp, { 'prestador-profile ok': (r) => r.status === 200 });
  }

  // Small think time to mimic user pacing
  sleep(Math.random() * 0.8);
}
