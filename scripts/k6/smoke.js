import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';

/******************************************************
 k6 Smoke + Ramp Load Test for Melhor Saúde Frontend

 Usage:
  BASE_URL=https://xn--melhorsade-udb.com k6 run scripts/k6/smoke.js
 
 Stages:
  - Quick smoke (10 VUs)
  - Ramp to 200 VUs over 5m
  - Sustain 200 VUs for 5m
  - Ramp down
 
 Thresholds:
  - 95% requests < 800ms
  - error rate < 1%
******************************************************/

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    { duration: '30s', target: 10 },
    { duration: '5m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'https://xn--melhorsade-udb.com';

export default function () {
  const res = http.get(BASE_URL);
  check(res, {
    'status ok': (r) => [200, 301, 302, 304].includes(r.status),
    'has HTML or redirect': (r) => r.status !== 200 || String(r.headers['Content-Type'] || '').includes('text/html'),
  });

  // Fetch a few critical assets (adjust if paths change)
  const assets = [
    '/manifest.json',
    '/favicon.ico',
  ];

  assets.forEach((path) => {
    const r = http.get(`${BASE_URL}${path}`);
    check(r, {
      [`asset ${path} ok`]: (rr) => rr.status === 200 || rr.status === 304,
    });
  });

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    [`smoke-summary-${ts}.json`]: JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
