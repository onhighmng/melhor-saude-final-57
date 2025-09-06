import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';

const BASE_URL = __ENV.BASE_URL || 'https://xn--melhorsade-udb.com';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.005'],
    http_req_duration: ['p(95)<900'],
  },
  scenarios: {
    soak: {
      executor: 'constant-arrival-rate',
      rate: 20,           // 20 requests per second sustained
      timeUnit: '1s',
      duration: '30m',    // adjust as needed
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
};

export default function () {
  const res = http.get(BASE_URL);
  check(res, { ok: (r) => [200, 301, 302, 304].includes(r.status) });

  // lightweight asset checks to keep steady pressure without overwhelming
  http.get(`${BASE_URL}/manifest.json`);
  http.get(`${BASE_URL}/favicon.ico`);

  sleep(Math.random() * 0.5);
}

export function handleSummary(data) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    [`soak-summary-${ts}.json`]: JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
