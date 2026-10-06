# Live validation, October 6, 2026

The event key was received and configured privately. These are local integration findings, not public deployment verification or a recommendation-quality claim. No owners have been contacted.

## Reproducible setup

The fixed inputs are in [the protocol](live-validation.md). Node 24.19.0, Qloo harness 0.1.26, event endpoint `https://hackathon.api.qloo.com`, and model `gpt-5.4-mini-2026-03-17` were used. All OpenAI calls share the existing persistent Upstash reservation ledger and $1 total ceiling. No ceiling reset or increase occurred. Raw provider records, exact entity selections, model comparisons, revisions and failures are retained in ignored `.local/live-2026-10-06/` and are not committed.

`Before Sunrise` returned two film identities. The 1995 Richard Linklater film was explicitly selected from Qloo's returned candidates. The other eight reference names resolved uniquely. Initial city, objective and cultural names were retained for all three briefs. No personal or customer data was used.

## Results

| Fixed brief | Initial discovery and planner time | Visible candidates | Comparison | Exclusion |
| --- | ---: | ---: | --- | --- |
| B1: Austin bookstore seeking café | 5,524 ms | 5 | v2 pair passed validation | First candidate absent; original discovery evidence reused |
| B2: Chicago venue seeking restaurant | 5,029 ms | 5 | v2 pair passed validation | First candidate absent; original discovery evidence reused |
| B3: Portland café seeking bookstore | 3,510 ms | 5 | v2 pair passed validation | First candidate absent; original discovery evidence reused |

All 15 displayed candidates linked to existing Qloo discovery records. This checks citation identity, not business suitability or support for every generated sentence. The paired inputs used the same model, instructions, brief and output limit, with provider evidence supplied only to the grounded call. There are no blinded preference scores or measured business outcomes.

For B1, substituting Nina Simone for Khruangbin created new discovery evidence and changed the visible shortlist. Palomino Coffee remained first. This is an exploratory revision check, not an alternative baseline observation. The planner chose to finish after discovery in the three fixed initial runs. Optional rank/audience tools were not exercised by those runs; their existence in code is not evidence of live use.

## Failures retained and fixes

- The first entity lookup exceeded the 30-second process timeout. A diagnostic repeat completed in approximately 13 seconds, and the normal entity/tag check subsequently passed. No timeout increase was made.
- Successful describe responses omitted the entity type from their results but provided it in canonical resolution metadata. The adapter now preserves that identity-matched type. A regression failed before the fix and passed afterward.
- Original B1 and B2 comparison calls were rejected because the model selected records outside the five-candidate shortlist. A diagnostic B1 repeat reproduced this: the evidence contained all ten discovery records. Comparison input now scopes discovery/rank details to the allowed candidates while preserving the original full evidence for inspection. A regression failed before the fix and passed afterward. Both v2 reruns passed; failed attempts remain part of the record and budget.
- B2's first proposal failed the output schema. The original raw proposal was not captured, so its exact schema violation is unknown. A separately recorded diagnostic retry passed the proposal schema. Do not describe this as a reproducibly fixed issue.
- B1 and B3 proposals passed validation. Generated proposals still require human review; passing citation/schema validation does not establish category fit or factual support.
- A later local browser proposal also failed the schema. Proposal requests previously asked only for JSON, without sending the application's field/count/length contract. They now use strict structured output generated from that same Zod contract, following [OpenAI's documentation](https://developers.openai.com/api/docs/guides/structured-outputs). A live proposal passed with the schema enabled. The exact fields rejected in the earlier uncaptured failures remain unknown; one success does not establish a reliability rate. Truncated and refused outputs are explicitly rejected.
- Live subtype and tag taxonomy fields are now preserved for readable place labels and distinguishable category choices. The UI cautions that category matches can include mixed-use venues.
- Separate direct checks of optional `rank` and `compare_audiences` returned `QLOO_RATE_LIMIT`. No optional-analysis success is claimed. The [official hackathon guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide) confirms rate limits but does not publish a numeric allowance. The local 30-workflow limit is an application guard, not an issued Qloo quota.

Latest verification: 82 tests passed, TypeScript passed and Vite production build passed. A literal credential scan across 73 deliverable files found no configured credentials. The cloud ledger retained $0.763078 of conservative reservations under the unchanged $1 ceiling at the latest check. Reservations include failed attempts and overestimate billing; this is not an invoice total.

## Independent spot checks and quality limits

Checked October 6, 2026 against these official sources:

| Candidate | Finding | Source |
| --- | --- | --- |
| Palomino Coffee | Coffee shop; provider address matches 4136 E 12th St, Austin | [Official website](https://palominocoffee.com/) |
| Mother Foucault's Bookshop | Bookshop; provider address matches 715 SE Grand Ave, Portland | [Official store page](https://www.motherfoucaultsbookshop.com/store) |
| Pittock Mansion | Historic house museum, not a primary bookstore. Its presence is a category-fit failure for B3. | [Official museum](https://pittockmansion.org/) |
| Zhou B Art Center | Art center at the returned Chicago address; primary restaurant status is unverified. | [Official exhibitions page](https://zhoubartcenter.com/current-exhibitions/) |

These spot checks are not a complete independent audit. Other entities and baseline suggestions remain unverified. Qloo returned mixed-use venues under restaurant and coffee tags. The Portland results included I Like Comics in Vancouver, outside strict Portland boundaries. The application describes surrounding-area matching, but this can still be unsuitable for an owner's intent. Affinity does not override a category or location mismatch.

The model-only Austin output also included bookstores when a café was requested. Neither condition is established as superior. Further work should prioritize category suitability, verification and clearer partner constraints before a final competitive demo. Do not cherry-pick the Austin success as proof that every city/category works.

## Public deployment and browser verification

On October 6, the owner approved storing the provider and ledger credentials on Render Free and a $3 total model allowance for public use through judging on November 16. The remote ceiling was atomically raised from 1,000,000 to 3,000,000 microdollars while preserving 827,362 already reserved. The record key and persistent TTL were unchanged. Local paid service was stopped before the change.

Render deploy `dep-db29lfrncjis73dtppo0` successfully deployed source `2e54ca65630255bf6cc43715fd45c08fe7666bd8`. Its build passed 82 tests and TypeScript/Vite compilation. The public status returned all three configuration booleans true. Actual browser requests, not status alone, then verified:

- Haruki Murakami (author), Khruangbin (artist), and the 1995 Before Sunrise film resolved and were explicitly confirmed.
- Coffee shop (place category) returned five Austin-area partners. Evidence `4d3fef96-c45e-4699-8b28-8a6ac258fe90` was retrieved at `2026-10-06T06:56:02.148Z` with the exact three IDs, Austin location and category tag.
- Palomino Coffee produced a live proposal. Its title was edited and JSON downloaded through the public UI. The download retained the edited title, live mode, correct partner and a valid evidence citation.
- Excluding The Yard removed it, added Mozart's Coffee Roasters and displayed one reused evidence record and zero new records.

The shared ledger read 924,768 reserved microdollars after these checks, below the 3,000,000 cap. This is a conservative reservation total, not an invoice. No hosting plan, card or domain was purchased. The public demo can stop paid requests when the allowance is exhausted; free hosting also has cold starts and provider/workflow limits.

Desktop presentation was visually inspected and screenshots captured. The browser viewport override did not apply the requested 375px width, so this run does not establish mobile verification. The override was reset. Public baseline generation was not repeated because the three local pairs already exist; optional analysis is still unverified live.

## Still incomplete

Current mobile browser verification, complete independent entity audit, live optional analysis verification, final video, owner feedback and final submission. Public live operation is now authorized within the shared $3 total allowance through judging; increasing it needs a new budget decision.
