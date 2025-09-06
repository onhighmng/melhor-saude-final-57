# k6 load tests

These scripts target the production domain by default and can export HTML and JSON summaries automatically.

Default domain
- BASE_URL default: https://xn--melhorsade-udb.com
- Override anytime via env: BASE_URL=https://staging.example.com

Included tests
- smoke.js: quick health + small ramp
- soak.js: constant, long-duration load
- spike.js: sudden traffic spikes

Run examples
```
# Smoke
BASE_URL=https://xn--melhorsade-udb.com k6 run scripts/k6/smoke.js

# Soak
BASE_URL=https://xn--melhorsade-udb.com k6 run scripts/k6/soak.js

# Spike
BASE_URL=https://xn--melhorsade-udb.com k6 run scripts/k6/spike.js
```

Result export
- Each script implements handleSummary and writes two files in the current directory:
  - <name>-summary-<timestamp>.html (rich HTML report)
  - <name>-summary-<timestamp>.json (raw JSON stats)
- Print a colored CLI summary as well.

Notes
- Routes used reflect the app: '/', '/prestadores', '/autoajuda', '/agendar-sessao'.
- Adjust VU counts and thresholds to your infra limits.
- For k6 Cloud, these scripts also work; summary files are available when running locally.

