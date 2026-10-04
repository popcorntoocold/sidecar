# Sidecar evaluation status

As of October 4, 2026, offline tests and local browser checks have been run. No live Qloo result, LLM baseline, owner interview, revenue result or measured recommendation-quality advantage is established.

## Evidence already available

- Automated behavioral tests for brief validation, process limits, secret-safe errors, provider parsing, agent bounds, citation validation, HTTP routes, stale responses, and preview separation.
- Local browser walkthrough: example load, evidence expansion, side-by-side comparison and proposal generation.
- Production frontend compilation and TypeScript verification.

Final counts and screenshots belong in the verification record after the last change. Example recommendations are fictional and excluded from the evaluator.

## Live validation to perform when credentials are configured

Use three different real briefs: a bookstore seeking a café partner, a small music venue seeking a food partner, and a café seeking a bookstore partner. Confirm each reference entity and category. Save permitted redacted evidence, actual latency, geographic coverage, exclusions, and failure states. Keep nearby-area matching visible.

For an LLM-only comparison, hold brief, model, prompt budget and review instructions constant; omit Qloo evidence only in the baseline. Record both outputs without cherry-picking. Have owners compare outputs without knowing which system produced them. Do not use Qloo affinity itself as an independent measure that Qloo recommendations are better. The baseline generator and comparison UI remain unfinished pending provider access and a verified evaluation protocol.

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

- 45 tests passed across nine suites. TypeScript and the production frontend build passed.
- Browser checks covered example discovery, evidence, comparison, exclusion, proposal generation and editing, and mobile overflow (375 CSS pixels). Print text mirrors edited fields in separate expanding document elements; physical printing was not exercised.
- A clean Docker build and local production startup succeeded. The production API returned preview mode with four fictional candidates and zero exclusions.
- The independent review found no Critical issues, three Important provider-adapter issues, and two Minor proposal issues. All five were addressed. Regression tests reproduced the provider issues before fixes and passed afterward.
- The credential check exited explicitly with missing QLOO_API_KEY. No live Qloo or OpenAI request has been verified.
- Public hosting, repository publication, real owner feedback, baseline comparison and final submission remain incomplete.
- The Qloo API key request was submitted with explicit user approval and the form confirmed receipt. Issuance remains pending; the confirmation estimates a few business days.

- Dependency resolution moved to pinned pnpm 12.9.1 with undici 8.10.2 and brace-expansion 5.0.12 overrides. The project pnpm audit reports no known vulnerabilities. This is the package advisory result, not a claim of complete application security.

