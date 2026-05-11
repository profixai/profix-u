## Goal

Add an automated Lighthouse audit to GitHub Actions CI so SEO/performance regressions (especially cache-lifetime headers) are surfaced on every pull request and on pushes to `main`.

## Approach

Use the official **Lighthouse CI** action (`treosh/lighthouse-ci-action`) running against the production preview build served locally by `vite preview`. This avoids depending on the deployed Lovable URL (which can be flaky in CI) and audits the same artifact users will receive.

A new `lighthouse` job is added to `.github/workflows/ci.yml`, running in parallel with the existing `web` job. A `lighthouserc.json` file at the repo root configures thresholds and the specific audits we want to gate on — most importantly `uses-long-cache-ttl` — so the workflow fails when caching regressions reappear.

## Files

- **New** `.github/workflows/ci.yml` — add `lighthouse` job (kept separate from `web` to avoid blocking type/test feedback).
- **New** `lighthouserc.json` — Lighthouse CI assertion config.

## Workflow steps (new `lighthouse` job)

```text
checkout → setup Bun → install → bun run build
        → start `bunx vite preview --port 4173` in background
        → wait-on http://localhost:4173
        → treosh/lighthouse-ci-action@v12 (3 runs, desktop + mobile)
        → upload HTML reports as workflow artifact
```

## `lighthouserc.json` (key assertions)

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/"],
      "numberOfRuns": 3,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.85 }],
        "categories:seo":         ["error", { "minScore": 0.95 }],
        "categories:accessibility":["warn", { "minScore": 0.9 }],
        "categories:best-practices":["warn", { "minScore": 0.9 }],

        "uses-long-cache-ttl":     ["error", { "maxLength": 0 }],
        "render-blocking-resources":["warn", { "maxLength": 0 }],
        "unused-javascript":       "off"
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

`uses-long-cache-ttl` is set as **error** so any future asset shipped with a short cache header fails CI — directly addressing the regression class you flagged. Lovable-hosted infra assets (`cdn.gpteng.co`, `~flock.js`) are not present when auditing the local preview, so they cannot cause false negatives.

## Severity tuning

- **error (blocks PR merge):** SEO score, `uses-long-cache-ttl`.
- **warn (visible but non-blocking):** performance / a11y / best-practices scores, render-blocking resources.

This mirrors your existing pattern of leaving `lint` as `continue-on-error` while keeping correctness gates (type-check, build, tests) hard. Thresholds can be ratcheted up later once a baseline is established.

## Out of scope

- Auditing the deployed Lovable preview URL (would require a secret + deploy wait; can be added later as a nightly cron job).
- Historical trend storage via Lighthouse CI Server (temporary public storage is sufficient for PR review links).
