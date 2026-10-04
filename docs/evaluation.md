# Sidecar evaluation status

As of October 4, 2026, offline tests and local browser checks have been run. No live Qloo result, LLM baseline, owner interview, revenue result or measured recommendation-quality advantage is established.

## Evidence already available

- Automated behavioral tests for brief validation, process limits, secret-safe errors, provider parsing, agent bounds, citation validation, HTTP routes, stale responses, and preview separation.
- Local browser walkthrough: example load, evidence expansion, side-by-side comparison and proposal generation.
- Production frontend compilation and TypeScript verification.

Final counts and screenshots belong in the verification record after the last change. Example recommendations are fictional and excluded from the evaluator.

## Live validation to perform when credentials are configured

Use three different real briefs: a bookstore seeking a café partner, a small music venue seeking a food partner, and a café seeking a bookstore partner. Confirm each reference entity and category. Save permitted redacted evidence, actual latency, geographic coverage, exclusions, and failure states. Keep nearby-area matching visible.

For an LLM-only comparison, hold brief, model, prompt budget and review instructions constant; omit Qloo evidence only in the baseline. Record both outputs without cherry-picking. Have owners compare outputs without knowing which system produced them. Do not use Qloo affinity itself as an independent measure that Qloo recommendations are better. The paired generator and comparison UI are implemented and fixture-tested. Both calls use the same model, instructions, brief and output-token ceiling; the grounded call also receives Qloo candidates and evidence. Input lengths therefore differ. Generation latency is recorded separately from prior discovery. The initial run must have no exclusions so both conditions receive the same constraints. Live comparison results remain unmeasured. The fixed protocol is in `docs/live-validation.md`.

The included `scripts/evaluate.ts` reports citation coverage and latency from recorded live runs. It is an integrity check, not a recommender-quality benchmark.

## Owner feedback guide

Target three owners or event organizers for formative feedback. No outreach has been sent. Before contacting anyone, obtain the user's authorization for the actual recipients and message.

Ask:

1. How do you currently choose local collaboration partners, and what makes it difficult?
2. Given this shortlist and evidence, which partner would you investigate first and why?
3. What information is missing before you would contact them?
4. Does the proposed event fit your business, and what would you change?
5. Did the tool save any work? Record observed task time separately from the person's estimate.

Record role, voluntary feedback, task outcome, changes requested, and whether permission to quote was given. Do not manufacture interviews or treat this small sample as representative market validation.

## Verification record, October 4, 2026

- 65 tests passed across 15 suites on the current local implementation. TypeScript and the production frontend build passed.
- Browser checks covered example discovery, evidence, comparison, exclusion, proposal generation and editing, and mobile overflow (375 CSS pixels). Print text mirrors edited fields in separate expanding document elements; physical printing was not exercised.
- A clean Docker build and local production startup succeeded. The production API returned preview mode with four fictional candidates and zero exclusions.
- The independent review found no Critical issues, three Important provider-adapter issues, and two Minor proposal issues. All five were addressed. Regression tests reproduced the provider issues before fixes and passed afterward.
- The credential check exited explicitly with missing QLOO_API_KEY. No live Qloo or OpenAI request has been verified.
- Public hosting, real owner feedback, measured baseline comparison and final submission remain incomplete.
- The Qloo API key request was submitted with explicit user approval and the form confirmed receipt. Issuance remains pending; the confirmation estimates a few business days.

- Dependency resolution moved to pinned pnpm 12.9.1 with undici 8.10.2 and brace-expansion 5.0.12 overrides. The project pnpm audit reports no known vulnerabilities. This is the package advisory result, not a claim of complete application security.


## Model test authorization

The project owner approved up to $1 total OpenAI test usage for the GPT-5.4 mini snapshot on October 4. The local private environment records that ceiling. No paid call has been made: both credential fields remain empty at the last presence-only check. The persistent reservation guard refuses calls beyond the configured allowance and retains reservations for failed attempts. Production requires a deliberate absolute ledger path; the operator must ensure the storage persists across deploys.

## Revision and provenance checks

Provider discovery and analysis reuse identical requests for at most 30 minutes in bounded server memory. Tests verify exclusions preserve the discovery record, changed cultural signals invalidate discovery, and changed shortlists invalidate analysis. Revision summaries display input changes and evidence IDs reused versus new to the run. Optional business names stay outside Qloo requests; they are sent to the model as proposal context. Provider provenance URLs are sanitized and linked where returned.

Latest continuation verification: all 64 tests also passed in the Linux Docker build, followed by TypeScript and Vite compilation. The non-root production container started on loopback, served four labeled preview candidates and reported both providers unconfigured. The installed harness CLI started successfully with `--help`; no provider request was sent. Mobile inspection reported 375 CSS pixels for both viewport and content width. The temporary verification container was stopped and removed. Credential-pattern scans of tracked/untracked deliverable files and Git history found no matches; this is a focused scan, not a comprehensive security audit.

A subsequent HTTP integration regression reproduced an early per-visitor limit during resolve → research → paired comparison → exclusion/revision. The per-visitor ceiling now permits 30 workflow reservations, capped by the unchanged global allowance. The full 65-test suite passes after the fix, including the server-owned revision chain and exclusion check. Providers in this integration test are explicit fixtures; it is not a live integration result.

## Public repository

Published October 4 at https://github.com/popcorntoocold/sidecar. GitHub reports PUBLIC visibility, default branch main, and MIT license detection. An unauthenticated web read also confirmed access. GitHub Actions now runs the container build, test suite, TypeScript compiler and a provider-free production smoke check. Hosting has not been activated; `docs/deployment.md` and `deploy/render.yaml` describe the proposed paid configuration for approval.

GitHub Actions run [37241292846](https://github.com/popcorntoocold/sidecar/actions/runs/37241292846), source commit `b776cd1`, passed 65 tests, TypeScript/Vite compilation, production preview/credential separation and harness CLI startup on a fresh GitHub runner. The preceding run found a readiness race in the smoke check; bounded retries now include connection resets during startup.

An isolated local Docker volume test under a 512 MB / 0.5 CPU limit confirmed that the non-root container user can persist a simulated budget reservation, and that a replacement container reads it and refuses excess reservations. No API requests were made. The disposable test volume was removed. This verifies storage behavior, not live harness memory capacity or Render account provisioning.
