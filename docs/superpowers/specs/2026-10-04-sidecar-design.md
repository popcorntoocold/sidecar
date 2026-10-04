# Sidecar project design

Status: Product direction and written specification approved on October 4, 2026. The local application and offline checks are implemented. Live provider verification, public deployment and final submission remain pending. See docs/evaluation.md for current evidence.

## Objective and audience

Build a competitive Qloo Agentic Hackathon entry aiming for first place. Sidecar helps an independent bookstore or cultural venue choose a local collaboration partner and develop a concrete event proposal. The initial audience is a small business owner who understands their creative identity but lacks time and evidence to research partnerships.

Working pitch: **Find the business your audience should meet next.**

The product uses selected books, films, artists, and brands as an explicit hypothesis about the business's audience. These inputs do not establish the preferences of its actual customers. Qloo supplies aggregate affinities; Sidecar turns those into a shortlist and a proposed collaboration. Revenue impact and owner demand remain hypotheses to validate.

The user authorized choosing the strongest concept and approved Sidecar. Austin is a proposed first demonstration city, subject to adequate API coverage. The application must accept other city inputs supported by the provider.

## Competition requirements

Verified October 4, 2026 against the [overview](https://qloo.devpost.com/) and [rules](https://qloo.devpost.com/rules).

- Submission deadline: October 30, 2026, 10:45 p.m. America/Chicago.
- First prize: $15,000. Winning is an aspiration, not a forecast.
- Required deliverables: functional externally hosted app, public repository with source and run instructions, detectable open-source license, and project description.
- Four equally weighted criteria: technical implementation, design, potential impact, and quality of idea. Technical implementation is the first tie-break criterion.
- Keep the demo accessible through the end of judging, November 16, 2026.
- A video is optional. The app must communicate its value without a presenter.

Live account inspection found registration complete and no project draft. The current event gallery is unpublished, so the concept has not been validated against current competitors.

## Alternatives considered

| Direction | Strength | Reason for selection or rejection |
| --- | --- | --- |
| Sidecar local collaboration agent | Concrete business decision; cross-category evidence; clear iterative workflow | Selected. Needs local coverage and actual owner feedback. |
| Group evening or trip planner | Easy for judges to understand and try | Less distinctive positioning; accurate schedules, availability, and travel constraints expand scope. |
| Cultural gift finder | Quick to demonstrate | Purchase availability and catalog integration add dependencies; relatively shallow agent loop. |

These are design judgments, not measured competitive scores.

## Core product flow

1. **Set a brief.** Choose a city, business type, partner category, and intended event. Add three to five cultural reference entities. Business name is optional and stays outside Qloo requests.
2. **Resolve references.** Search Qloo entities and let the user confirm exact matches. Display type and disambiguating metadata. Never silently substitute a similarly named entity.
3. **Discover partners.** A bounded server-side agent selects validated tools, searches geographically constrained candidates, and gathers affinity evidence. The owner sees progress and an understandable record of the tool actions.
4. **Compare candidates.** Present up to five partners with location, source, raw provider metric labels where available, evidence coverage, and reasons to investigate. Avoid presenting an aggregate affinity as a probability of success.
5. **Revise a decision.** Reject a candidate or change a reference/category, then rerun only affected work. Explain which inputs and evidence changed. A rejection excludes that candidate; it does not infer an unspoken reason.
6. **Create a collaboration brief.** Select one partner to produce an editable proposal: event concept, mutual value hypothesis, agenda, questions to verify, and a suggested measurement plan. Export a printable brief and evidence appendix. Outreach remains a draft.

An anonymous judge can start from an illustrative bookstore brief or enter their own cultural references. Example inputs must be labeled as illustrative and resolved against live Qloo. No login, customer database, or file upload is needed.

## Differentiating demonstration

The judge starts with the same city and business but changes its cultural references. The shortlist changes based on returned Qloo evidence. A second interaction rejects a candidate and yields a revised proposal with visible provenance.

The app includes a comparison view of an LLM-only baseline and the Qloo-grounded approach for the same brief. The baseline is generated honestly, with its source and timestamp. We measure entity validity, constraint adherence, provenance completeness, latency, and blinded owner preference. Do not claim improved revenue, conversion, or recommendation quality without measurements. Synthetic fixtures demonstrate UI behavior only and never stand in for a live result or evaluation.

## Architecture

- **Web interface:** React and TypeScript, built with Vite. A brief editor, research progress view, partner comparison, and exportable proposal form one coherent experience.
- **Server:** Node with a small typed HTTP API. Qloo's supported harness runs in a trusted process behind the server. Host selection follows an actual deployment check; it must support the harness and long-enough bounded requests.
- **Agent:** One orchestrator with a small tool surface, explicit run state, strict argument validation, and a maximum of eight tool invocations per run. The initial UI never depends on multiple autonomous personas.
- **Qloo adapter:** Typed wrappers for entity resolution, local recommendations, comparison, and shortlist evaluation where the installed harness supports them. Verify actual schemas before implementation. Never guess a command or fabricate a metric.
- **Evidence model:** Separate provider facts, derived calculations, user inputs, and generated proposal text. Each supported factual claim references a returned entity or evidence record.
- **Storage:** Session-scoped brief and result state. Store only the minimum cache allowed by event terms; start with short-lived server memory and invalidate when relevant inputs change.
- **Model provider:** A server-side adapter chosen after confirming available credentials and pricing. No provider selected or billing authorization assumed by this spec. Use structured tool arguments and validated output.

The [official kit](https://github.com/qloo/qloo-hackathon-kit) exposes Qloo through CLI and MCP workflows. The proposed backend uses that supported surface, with a direct API adapter considered only after verifying event compatibility. The current harness requires Node >=22.19.0; the local default is 22.13.1. The bundled runtime at `C:\Users\haora\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe` was verified as v24.19.0 and meets this requirement. Use it without changing the machine default.

## Data and scoring

Core records are Brief, ResolvedEntity, Candidate, EvidenceRecord, AgentEvent, and CollaborationProposal.

An EvidenceRecord includes source, workflow, retrieval time, resolved entity IDs, non-secret request parameters, provider metric names/values, and known missing fields. Provider request IDs are preserved when supplied. Redacted provenance is available from each candidate.

Use ordering within a comparable provider result set. Do not combine unrelated affinity, popularity, or ranking values into a made-up confidence percentage. If shortlist ranking is supported, use one documented ranking request over the same candidate set and signals. Otherwise present the available ordering and its limits. Comparison of audiences is not customer overlap, market size, or purchase intent.

The [Qloo public API overview](https://github.com/qloo/docs-public/blob/main/reference/api-overview.md) documents recommendation, lookup, location, and comparison capabilities. [Insights documentation](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md) describes entity signals, geographical filters, and per-recommendation input contributions under `query.explainability`. Prefer returned contributions for explanations when exposed by the chosen workflow. Locality matching may include nearby places by default; verify the resolved locality and use radius zero for strict boundaries. Availability, output schemas, and event credential permissions must be verified live.

## Visual design

A calm editorial workspace with warm ivory, dark ink, and restrained copper accents. Typography and spacing carry the hierarchy. The primary comparison view uses readable partner rows rather than a wall of charts. The brief remains visible beside results on desktop; mobile progresses through the same steps vertically.

Each partner has one clear recommendation rationale, a visible evidence control, and a compare/select action. Provide keyboard operation, reduced-motion support, accessible contrast, sensible loading states, and specific empty states. The agent activity log explains actions without exposing private model reasoning or raw secrets.

## Reliability and boundaries

- Validate every tool argument server-side and allowlist workflows. Never interpolate user text into a shell command. Spawn the harness without a shell, using bounded input files or supported structured input.
- Keep credentials out of client bundles, repositories, prompts, URLs, and logs. A missing key produces an explicit setup error. Authentication errors cannot silently fall back to fixtures or another account.
- Cache identical approved requests where permitted. Enforce timeouts, bounded retry with backoff for transient failures, request size limits, and public-demo rate limits. Determine final ceilings from issued quota before deployment.
- Return partial evidence visibly when one optional analysis fails. If core discovery fails, retain the brief and provide a retry action; do not invent candidates.
- If local coverage is sparse, disclose it and let the owner broaden the area. Do not secretly remove geographical constraints.
- Treat web/provider text as data, not instructions. Generated proposals cannot invent opening hours, contact details, prices, bookings, willingness to partner, or expected revenue.
- [Qloo guidance](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/SAFE_USE.md) limits interpretation to aggregate taste signals. Sidecar does not infer sensitive traits or use customer identity data.

## Evaluation and acceptance

Technical checks must cover the following meaningful risks:

- Ambiguous entity matches require explicit resolution.
- Geographical and category constraints persist across initial discovery and revision.
- Rejected candidates are not returned in the revised shortlist.
- Every provider-derived claim maps to an evidence record; generated suggestions are labeled.
- Invalid model output and injected provider text cannot invoke unapproved tools.
- Missing credentials, throttling, timeout, and partial evidence render recoverable states.
- No credentials appear in source, bundles, exported briefs, or captured logs.

Run a live test of at least three distinct briefs, then verify the public demo in a fresh browser session at desktop and mobile sizes. Record actual outcomes, latency, and API usage. Retain a small, redacted reproducibility set only where permitted.

For impact evidence, seek feedback from at least three actual owners or event organizers on real candidate shortlists. This is a target, not completed research. Contacting anyone requires the user's authorization. Record task time and preference feedback without manufacturing statistics or presenting three interviews as a representative study.

Definition of a first functional milestone: a new user enters a brief, resolves entities, obtains live geographically constrained candidates with provenance, changes one constraint, and exports a source-linked brief. A mock screen alone does not satisfy this milestone.

## Delivery sequence and status

1. Review this specification and write the implementation plan.
2. Configure an event-issued Qloo credential and compatible isolated Node runtime. Verify live search, discovery, and shortlist capability before polishing UI.
3. Build the first functional milestone and focused reliability tests.
4. Add comparison view, public-demo protections, visual polish, and deployment verification.
5. Gather owner feedback, address demonstrated problems, and produce the reproducibility evidence.
6. Prepare the public repository, license, screenshots, project description, and final Devpost entry for review.

Target internal completion: October 27, leaving time for deployment or submission problems before October 30. This is a planning target, not a scheduled automation.

Current dependencies: the Qloo application was submitted with approval and issuance is pending. The OpenAI model and $1 test ceiling are approved; the private credential still needs to be configured. Hosting remains to be configured. The [official API request form](https://docs.google.com/forms/d/1G_udB8rJTlSwwCx9LF1vaftYI4Qf459ZXIKqLPElWc8/viewform) requests account details, a project idea, and acceptance of API rules. Credential values should be configured privately, not pasted into chat.

Ruflo tooling was searched in the available tool catalog. Neither Ruflo tools nor ToolSearch are exposed in this session. No Ruflo actions have been performed.

The local application and Qloo key application are complete. The public source repository has been published with an MIT license. No live provider integration, deployment, owner feedback or contest submission is represented as complete.
