# Sidecar submission working draft

This is a preparation document, not a submitted entry. Rewrite claims after live integration and evaluation. Public source: https://github.com/popcorntoocold/sidecar (MIT). Public illustrative walkthrough: https://sidecar-qloo.onrender.com/ . The hosted app has no live provider credentials yet.

## Name and pitch

**Sidecar**

Find your next neighborhood collaboration through shared cultural taste.

## Problem

Independent businesses can have complementary audiences without an obvious connection. A bookstore and café may share cultural interests, yet their owners have little time to investigate whether a joint event is worth pursuing. This is our product hypothesis, awaiting direct owner feedback.

## Product

Sidecar begins with a business's city, collaboration objective, and cultural references. Its proposed live workflow resolves the references with Qloo, discovers nearby partners, gathers cultural evidence, and drafts a collaboration brief. Owners can inspect sources, compare candidates, reject a partner and revise the shortlist.

The local implementation already includes this interface and a separate, explicitly fictional walkthrough. The Qloo adapter and bounded planning loop are implemented but have not been exercised with event credentials. The paired LLM-only comparison, revision history, evidence reuse and persistent model test-budget guard are implemented and fixture-tested. No quality advantage is claimed from these offline tests.

## Qloo integration

The backend uses the official Qloo harness for entity description, tag discovery, geographically filtered recommendations, shortlist ranking and audience comparison. Recommendations retain their provider evidence. Sidecar distinguishes aggregate affinity from actual customer overlap and treats the generated event proposal as a suggestion requiring verification.

Before submission, replace this paragraph with a concise explanation of the workflows successfully demonstrated against live credentials, including a redacted request and result.

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
- [ ] Event key configured and live Qloo workflows verified.
- [ ] Model configured and live tool decisions and proposal verified.
- [ ] Live baseline comparison and owner feedback completed.
- [x] Public illustrative walkthrough deployed and tested anonymously.
- [ ] Public live Qloo workflow deployed and verified.
- [x] Repository published with MIT license detected.
- [ ] Final screenshots and honest description added to Devpost.
- [ ] User reviews and submits the final entry.

Deadline: October 30, 2026, 10:45 p.m. Central. [Official event](https://qloo.devpost.com/).

