# Live validation protocol

Status: prepared, not executed. All tables below are blank observation templates. No owner has been contacted and no live recommendation-quality result has been measured.

## Fixed briefs

Keep the following three initial briefs fixed across the paired conditions. Resolve each name in the live UI and record the exact selected Qloo entity ID. If resolution or local coverage fails, retain that failure; do not silently substitute references or cities to improve the outcome. Any replacement is a separately labeled exploratory run.

| Brief | Business and partner | City | Objective | Cultural references to resolve |
| --- | --- | --- | --- | --- |
| B1 | Bookstore seeking café | Austin, Texas | Bring new people into our independent bookstore with a thoughtful neighborhood reading event. | Haruki Murakami (author), Khruangbin (artist), Before Sunrise (movie) |
| B2 | Music venue seeking restaurant | Chicago, Illinois | Explore a listening evening and nearby food collaboration for an independent music venue. | Nina Simone (artist), Talking Heads (artist), Amélie (movie) |
| B3 | Café seeking bookstore | Portland, Oregon | Explore a small reading and conversation event with a local bookstore. | Ursula K. Le Guin (author), Fleet Foxes (artist), Spirited Away (movie) |

These are test inputs, not claims about real customer audiences or business demand. Leave the optional business name empty. Initial exclusions must be empty for a paired comparison.

## Capture sequence

1. Confirm the issued Qloo quota and privately configure both keys. Preserve the existing OpenAI reservation ledger. Do not increase the authorized ceiling to finish a test.
2. Start the server and record the source commit, Node version, Qloo harness version, model snapshot, prompt version, budget settings and start time. Never record keys.
3. For each brief, select exact references and category, run live research, and inspect the actual geographic interpretation and returned source evidence. Record errors and empty results as outcomes.
4. Generate the paired comparison once. Save both outputs with the UI export. Preserve the initial result even when one condition is poor. Failed pairs must be logged; retries retain their test reservations.
5. Independently verify suggested business existence, address and category against official business sources. Record URL and verification time, or mark unknown. A matching Qloo name alone does not establish current business existence or category.
6. Exclude the first candidate and rerun. Confirm it is absent, city/category/references remain unchanged, and the revision identifies reused discovery. Change one reference and rerun; confirm discovery is refreshed. Do not require a different shortlist when Qloo legitimately returns the same candidates.
7. Generate a proposal for a remaining candidate, edit it, and export JSON and print to PDF. Inspect the exported text, citations, limitations and optional provider links.
8. Repeat the initial flow in a fresh public desktop session and a mobile viewport once deployed. Record the actual public URL and test date. Local tests do not satisfy this step.

The paired calls use the same brief, model, instructions and maximum output tokens. Grounded input includes provider evidence and is therefore longer. Calls are unseeded; a single pair cannot establish causality or a quality advantage. Research time is separate from generation time. The model baseline has no web search and its business names are explicitly unverified.

## Technical observation sheet

Copy one row for each condition of each brief. Use `unknown` for missing observations, never zero. Archive the paired export privately under `.local/` until provider retention and publication terms have been checked.

| Brief / condition | Timestamp | Exact entity IDs confirmed | Suggestions | Independently verified entities | City/category violations | Unknown checks | Citation coverage | Research ms / generation ms | Evidence file / source URLs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |

Citation coverage measures whether a generated suggestion cites a record in its supplied evidence, not whether the explanation is factually justified. Assess explanation support separately. Keep baseline citation coverage as “not applicable, no provider evidence” rather than treating it as a quality score of zero.

## Owner feedback sheet

Recruit only after the user approves the actual recipients and message. Target three consenting owners or organizers. Show the paired outputs as A and B in an independently randomized order; keep the condition mapping out of the material shown to them. Do not show model names or source labels during the preference task. Explain provenance and limitations afterward before anyone acts on suggestions.

Record their judgments verbatim. Ask which shortlist they would investigate, why, what is missing, and whether either proposal fits their business. Record observed task duration separately from self-reported time savings. Ask separately for permission to quote.

| Participant code / role | Brief | A/B mapping (private) | Preference and reason | Missing information | Observed task time | Requested change | Quote permission |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Pending | Pending | Pending | Pending | Not requested |

Report individual observations with their limitations. Three formative interviews are not a representative market study, and preference is not revenue impact.

## Public launch checks

- One Node container behind HTTPS, with long-running requests supported and anonymous access through judging.
- Issued Qloo quota translated conservatively into workflow limits. One harness workflow can issue multiple API requests.
- Persistent, writable OpenAI ledger at an absolute path. Redeploys and restarts must retain all existing reservations. No test allowance automatically authorizes ongoing public model spending.
- Public Git repository with no credentials, private logs, local evidence or unrelated files, plus a detected MIT license and clean-install instructions.
- Fresh public browser verification of live resolution, discovery, revision, proposal and failure states. No unlabeled fixtures or claims of completion based only on screenshots.
- Review exact deployment costs and account access before activating paid hosting. No hosting subscription has been authorized.
