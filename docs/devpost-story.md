## Inspiration

A bookstore and a neighborhood cafe may share a cultural world without an obvious reason to meet. Their owners need a concrete idea, a plausible partner, and a way to check the reasoning. Sidecar explores whether books, music and film can make that research more specific. The business need remains a product hypothesis awaiting owner interviews.

## What it does

Start with your city, collaboration goal and three to five cultural references. Confirm the exact Qloo matches and partner category. Sidecar discovers nearby places, preserves the supporting evidence and helps turn a candidate into an editable collaboration brief.

Reject a partner and inspect which evidence was reused. Change a cultural reference and discovery refreshes. Export the proposal with its evidence appendix for review. The separate fictional walkthrough is clearly labeled.

## How we built it

React and TypeScript power the interface. A Fastify server invokes the official Qloo harness in a restricted child process. Qloo resolves references and category tags and returns geographically filtered recommendations. A bounded model planner can request additional ranking or audience evidence, then finish. The server owns tool arguments, entity IDs and limits. Discovery order is retained, and optional analysis is shown separately.

Proposal generation uses a strict schema, with citations checked against evidence in the run. Provider responses are treated as data, never instructions. Cached records retain their original timestamps. The app reports what changed when a brief is revised.

Render Free hosts the app. An Upstash Free Redis ledger atomically reserves a conservative model-cost allowance before each paid request. The same record protects the total allowance across local tests, hosted requests and service restarts. Missing or inconsistent records block paid inference. Credentials stay server-side, and Qloo receives cultural references and the selected area without customer records.

## Challenges and lessons

Real integration exposed problems that fixtures missed. Ambiguous films needed explicit confirmation. Category labels needed their taxonomy scope. Paired comparisons initially let evidence mention candidates outside the accepted shortlist; restricting model input to the current shortlist fixed that contract. Proposals needed the application's exact field and length schema, not just valid JSON.

The most important limitation is relevance. A place can match a category tag without being the intended primary business, and nearby-area matches can cross city boundaries. Our Portland bookstore run included a historic house museum. Cultural affinity does not override a category mismatch. Sidecar makes evidence inspectable and asks owners to verify business type, location, interest, costs and availability.

## What we have verified

- Three fixed local live briefs in Austin, Chicago and Portland, with exclusions and a changed-reference check.
- Three valid model-only versus Qloo-grounded comparison pairs after contract fixes. Failed attempts remain in the evaluation record. No measured quality advantage is claimed.
- Live Qloo resolution, category discovery and recommendations. Initial planners finished after discovery; separate optional ranking and audience checks hit a provider rate limit, so those operations are not claimed as verified live.
- 82 automated tests, TypeScript compilation and production build passing in CI and the Render build.
- Public live workflow on Render Free: reference and category confirmation, partner discovery, evidence inspection, proposal editing and JSON export. Excluding The Yard removed it, added Mozart's Coffee Roasters and reused the original evidence record.
- Public MIT-licensed source, persistent spending controls and a clearly labeled fictional walkthrough.

## What's next

Improve category suitability, complete independent checks of suggested businesses, gather owner feedback and record the final demonstration. No actual partnership, customer overlap, revenue outcome or recommendation-quality advantage has been established.
