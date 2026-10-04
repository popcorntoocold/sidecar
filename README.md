# Sidecar

Find your next neighborhood collaboration using cultural evidence. Sidecar is a Qloo Agentic Hackathon project for independent bookstores and cultural businesses researching local partners.

**Current state:** local application implemented. The complete illustrative walkthrough is usable. Live Qloo and model verification, public hosting, public repository publication, owner research, and competition submission are not complete. The example uses fictional businesses and never substitutes for live provider results.

## Try it locally

Use Node >=22.19.0 and pnpm 12.9.1. Install pnpm with `npm install --global pnpm@12.9.1`, then run:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run dev
```

Open http://127.0.0.1:4310 and choose **Explore a complete example**. Inspect evidence, compare partners, exclude one, create a proposal, edit the proposal, and export the brief. Starting your own brief invokes the live flow and requires credentials.

On this Windows workspace, the compatible bundled Node executable is `C:\Users\haora\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`. The server can be started with that executable followed by `--env-file-if-exists=.env --import tsx server/index.ts`.

## Configure live research

Request your own event-issued key from the [official Qloo resources](https://qloo.devpost.com/resources). Configure it privately. Never paste keys into Devpost, chat, source code, screenshots or browser fields.

Copy `.env.example` to `.env`, then set `QLOO_API_KEY`, `OPENAI_API_KEY`, and `OPENAI_MODEL`. Choose a currently available OpenAI Chat Completions model supporting JSON output; no billable model is selected by default. Restart the server after setting credentials. The server fixes both Qloo endpoint settings to https://hackathon.api.qloo.com, as required for event-issued keys. Qloo calls use the pinned official `@qloo/qloo-harness` package, server-side.

```sh
pnpm run check:live
```

The check makes minimal entity/tag requests, and fails explicitly if credentials are missing. It does not certify the complete integration. In the browser, resolve and confirm three cultural references, confirm a returned Qloo partner category, and run research. Verify the city, results, evidence and revisions before considering the entry live.

`QLOO_HOURLY_WORKFLOW_LIMIT` caps reserved workflow calls per server process per hour. A workflow can make several API requests; configure this conservatively from the actual event quota. Public operation currently requires a single server process. Multiple replicas would need a shared limiter and store. The app reserves eight calls for each research run, limits concurrent requests, and keeps research records for 30 minutes. No customer records are collected.

## How the agent works

1. Resolve cultural references and category tags using Qloo; let the owner confirm matches.
2. Discover geographically filtered places using the confirmed references and category.
3. Ask a constrained planner whether shortlist ranking or audience comparison would add useful evidence.
4. Retain provider evidence and the original discovery order. Optional analysis is visible separately.
5. Draft an editable collaboration proposal linked to known evidence records.

The server owns entity IDs and constraints. Model responses cannot issue arbitrary commands, change cities, or invent accepted citations. Provider content is treated as untrusted data. Credentials stay out of the browser bundle and logs.

Qloo metrics describe aggregate affinities. They do not establish actual customer overlap, sales, availability, or a business's willingness to partner. The supported harness can include nearby areas; the UI states this. No strict city-boundary guarantee is made.

## Verification

```sh
pnpm test
pnpm run build
pnpm run evaluate -- path/to/redacted-live-runs.json
```

Tests cover validation, process isolation, provider parsing, cancellations, budgets, unsupported actions/citations, preview separation, stale UI requests and HTTP behavior. External providers are isolated with explicit fixtures. An offline green suite does not prove live Qloo compatibility.

The evaluation summary accepts live Qloo research records only. It reports observable evidence coverage and duration, not recommendation accuracy or business impact. See [evaluation status](docs/evaluation.md).

The pinned pnpm setup applies patched transitive versions of undici and brace-expansion. npm installations do not reproduce this fix because an upstream dependency ships its own shrinkwrap. Use the committed pnpm lockfile; install scripts are disabled because platform binaries are supplied by registry packages.

## Deployment

The Dockerfile builds a single-process Node service. Configure secrets at the host, set a deliberate `QLOO_HOURLY_WORKFLOW_LIMIT`, expose port 4310 behind HTTPS, and keep the instance online through judging. Do not expose `.env` or development tooling publicly.

```sh
docker build -t sidecar-local .
docker run --rm -p 127.0.0.1:4311:4310 -e QLOO_HOURLY_WORKFLOW_LIMIT=30 sidecar-local
```

That command starts only a local preview without keys. A public URL and verified live-provider behavior are still required for the competition.

## Project documents

- [Approved specification](docs/superpowers/specs/2026-10-04-sidecar-design.md)
- [Approved implementation plan](docs/superpowers/plans/2026-10-04-sidecar.md)
- [Submission working draft](docs/submission.md)
- [Evaluation status and owner feedback guide](docs/evaluation.md)

MIT-licensed original application code. Qloo, fonts, libraries and other dependencies retain their own licenses and service terms.


