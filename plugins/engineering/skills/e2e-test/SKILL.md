---
name: e2e-test
description: Run a comprehensive end-to-end test of an app against real backend + frontend dev servers, with mocks disabled. Hits API endpoints directly, then drives the UI through a browser, and produces a PASS / FAIL summary. Use when user wants to run a full E2E sweep, says "test everything end to end", "smoke test the app", or wants to verify a release before shipping.
---

# /e2e-test — Full End-to-End Test Sweep

A disciplined E2E pass against a running app, with no mocks. Hits the real backend, drives the real UI, reports PASS / FAIL per test with enough detail to fix anything that breaks.

## Prerequisites

Before starting:

- **Backend and frontend dev servers are running** and reachable. Confirm with the user which ports / URLs to use.
- **The database is in a known state.** Either freshly seeded or backed up so the test can clean up after itself.
- **Auth bypass or a test credential is configured.** Most teams have a `DEV_AUTH_BYPASS` flag, a service account, or a test user. Confirm which to use.
- **Browser MCP / Playwright / Puppeteer is available** for the UI phase.

If any of the above is missing, stop and ask the user. Do not silently start the servers in a state you can't reason about.

## Process

**Phase 1 — Backend API smoke.**

For each major entity / endpoint group, run the full CRUD cycle directly against the API (curl, fetch, or the project's GraphQL client). Use real seeded IDs.

Example pattern for one entity:

```bash
# create
curl -s "$API/entity" -X POST -d '{...}' -H "Authorization: ..."
# read back
curl -s "$API/entity/$ID"
# update
curl -s "$API/entity/$ID" -X PATCH -d '{...}'
# delete
curl -s "$API/entity/$ID" -X DELETE
```

Record PASS / FAIL per step. On FAIL, capture the full response body and HTTP status. **Clean up created test data** at the end of each CRUD test — fail loudly if you can't.

**Phase 2 — Frontend page sweep.**

For every page in the app, drive the browser:

1. Navigate to the page.
2. Disable client-side mocks (e.g. `localStorage.setItem('msw-config', JSON.stringify({ enabled: false }))`) if the app uses an in-browser mocking layer.
3. Take a screenshot.
4. Check the console for errors.
5. Verify the page renders real data (no infinite "Loading…", no error fallback).
6. Verify the network tab shows successful API calls.

If the user provided a specific page list, walk it in their order. Otherwise: home → primary list pages → primary detail pages → settings.

**Phase 3 — Critical interactions.**

The pages-load test misses interaction bugs. For every flow the user flagged as critical (or, if they didn't, the top 3-5 you can identify from the routes):

- Open the dialog / sidebar / drawer.
- Fill it with valid input.
- Submit.
- Verify the new state in the UI and via a direct API read-back.
- Roll back.

Each interaction is its own PASS / FAIL.

**Phase 4 — Summary.**

Produce a single table the user can scan:

```
| Phase | Test | Result | Notes |
|-------|------|--------|-------|
| API   | Entity X CRUD | PASS | |
| API   | Entity Y CRUD | FAIL | 500 on POST: <error> |
| UI    | /dashboard    | PASS | |
| UI    | /settings/x   | FAIL | console error: <message> |
| Flow  | Create Order  | PASS | |
```

Then a section per FAIL with:

- Exact error message / stack trace
- Reproducing curl or browser steps
- Suggested fix or area to investigate

## Pitfalls

- **Don't claim PASS because the request returned 200.** Read the body. A 200 with `{ errors: [...] }` is FAIL.
- **Don't continue past a hard FAIL in API CRUD.** If `create` fails, the rest of the chain is meaningless. Stop, surface the failure, ask the user how to proceed.
- **Don't skip cleanup.** Tests that leave seed-pollution behind break the next run.
- **Don't run against prod.** Refuse if the URL doesn't look like a dev / staging environment. Confirm explicitly.

## Pairs with

- `/engineering:testing-strategy` — decide upfront which test layers a feature needs.
- `/engineering:deploy-checklist` — run E2E as one of the deploy gates.
- `/engineering:incident-response` — re-run a focused subset of this against a hotfix branch.
