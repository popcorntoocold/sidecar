# Sidecar submission working draft

This is a preparation document, not a submitted entry. Public source: https://github.com/popcorntoocold/sidecar (MIT). Public live app: https://sidecar-qloo.onrender.com/ . The hosted discovery, evidence, editable proposal/export and exclusion revision were verified October 6 at commit `2e54ca6`. The current Devpost story is maintained in [devpost-story.md](devpost-story.md).

## Name and pitch

**Sidecar**

Find your next neighborhood collaboration through shared cultural taste.

## Problem

Independent businesses can have complementary audiences without an obvious connection. A bookstore and café may share cultural interests, yet their owners have little time to investigate whether a joint event is worth pursuing. This is our product hypothesis, awaiting direct owner feedback.

## Product

Sidecar begins with a business's city, collaboration objective, and cultural references. Its live workflow resolves the references with Qloo, discovers nearby partners, gathers cultural evidence, and drafts a collaboration brief. Owners can inspect sources, compare candidates, reject a partner and revise the shortlist.

The local live workflow has now been exercised with event credentials on three fixed briefs. Paired model comparisons, proposals and exclusion revisions have been recorded, including failed attempts. Changing a cultural reference refreshed discovery. The public app still offers a separate fictional walkthrough. Category suitability and surrounding-area matches remain material limitations; no quality advantage is claimed. See the [October 6 live report](live-results-2026-10-06.md).

## Qloo integration

The backend uses the official Qloo harness for entity description, tag discovery, geographically filtered recommendations, shortlist ranking and audience comparison. Recommendations retain their provider evidence. Sidecar distinguishes aggregate affinity from actual customer overlap and treats the generated event proposal as a suggestion requiring verification.

Live verification covers describe, find_tags and recommend. The planner chose to finish after discovery in the initial fixed runs; optional rank and audience comparison remain unverified live. Raw credentials and private provider logs are excluded from submission materials.

## Engineering

React/TypeScript interface, Node server, typed input validation, server-owned tool arguments, bounded research calls, source-linked proposals, stale-request protection, request budgets, and explicit failure states. Provider credentials remain server-side.

## Demonstration sequence

1. Enter a real bookstore brief and confirm three exact cultural references.
2. Confirm the partner category and run live discovery.
3. Show source evidence for an unexpected but plausible candidate.
4. Reject a candidate or change one reference; show the revised result and explain the change.
5. Generate and export the collaboration brief.
6. Show actual baseline comparison and owner feedback only if completed.

## Completion checklist

- [x] Product concept and technical design approved.
- [x] Local app and labeled example workflow implemented.
- [x] Source-level provider and agent tests added.
- [x] Event API key requested and receipt confirmed.
- [x] Event key configured; live resolution, tags and discovery verified locally.
- [x] Model configured; live finish decisions and proposals recorded locally.
- [x] Three local paired comparisons validated, with failed attempts retained.
- [ ] Independent owner feedback completed.
- [x] Public illustrative walkthrough deployed and tested anonymously.
- [x] Public live Qloo workflow deployed and verified on desktop.
- [ ] Current mobile workflow verified at a confirmed mobile viewport.
- [x] Repository published with MIT license detected.
- [ ] Final screenshots and honest description added to Devpost.
- [ ] User reviews and submits the final entry.

Deadline: October 30, 2026, 10:45 p.m. Central. [Official event](https://qloo.devpost.com/).

