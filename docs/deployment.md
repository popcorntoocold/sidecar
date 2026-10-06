# Deployment handoff

Verified October 6, 2026. The [public live app](https://sidecar-qloo.onrender.com/) is deployed on Render Free from commit `2e54ca6`. The owner approved storing Qloo, OpenAI and Upstash credentials in this service and a $3 total model allowance for public operation through judging on November 16. An atomic ceiling update preserved the existing $0.827362 reservation; no balance reset occurred. The current shared record had $0.924768 reserved after public verification. No hosting plan, payment method or domain was purchased. See [the live report](live-results-2026-10-06.md) for the tested workflow and remaining limits.

## Selected free route

The owner selected free hosting on October 4. Use [deploy/render-free.yaml](../deploy/render-free.yaml) for a Render Free Docker service with its included `onrender.com` address. A purchased domain is unnecessary. The blueprint defaults to an illustrative preview; the existing service now has its approved live configuration stored privately. The paid blueprint below is an alternative only, not authorized for activation.

[Render Free](https://render.com/docs/free) sleeps after 15 idle minutes and may take about a minute to wake. It cannot attach a persistent disk. Without a payment method, exhaustion of included bandwidth suspends services; exhaustion of build minutes disables new builds. Do not add payment details or upgrade. If using an existing billed workspace, verify its spending controls before provisioning because free services can incur bandwidth/build overages on that workspace.

For live mode, use a dedicated [Upstash Redis Free database](https://upstash.com/pricing/redis) (256 MB, 500,000 commands/month, 10 GB bandwidth at verification). Its [durable storage](https://upstash.com/docs/redis/features/durability) persists the small budget record independently of Render restarts. Use an account-owned database, not an unclaimed 72-hour scratch database. Keep eviction and auto-upgrade disabled. No application briefs or API keys are written to the ledger; only spending counters are stored.

### Initialize the shared budget once

October 6 update: credentials are configured locally and on Render. The official hackathon guide documents rate limits without a numeric quota; optional analysis hit a rate limit during testing. Keep the conservative single-process limit and do not claim it equals an issued quota. The historical initialization procedure below describes the one-time October 4 migration. It must never reset the now-higher current ledger.

1. Stop every local process that could make paid model calls. Preserve `.local/openai-budget.json`, including failed-call reservations. The first authorized connectivity test reserved **$0.015230**, not measured billing, under the existing $1 total test cap.
2. In private `.env`, set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and a stable `OPENAI_BUDGET_REDIS_KEY` such as `sidecar:budget:hackathon-2026`. Leave `OPENAI_BUDGET_FILE` pointing at the existing local ledger for migration.
3. Run `node --env-file=.env --import tsx scripts/initialize-remote-budget.ts`. This copies the prior reserved amount and ceiling only if the remote record does not exist. An ambiguous result must be inspected, never repaired by resetting the balance.
4. Point all subsequent local and hosted paid usage at this same remote ledger. Do not keep an independent local allowance. Never change the record key, reset its balance, attach a TTL, or increase the limit without a new explicit budget decision.
5. Run the cloud-ledger smoke check with synthetic reservations on a separate disposable key before enabling paid requests: `node --env-file=.env --import tsx scripts/verify-budget-upstash.ts`. This passed against the actual Upstash database on October 4 with 20 concurrent reservations, the exact expected ceiling, and refusal to reset an existing record. It used no OpenAI requests and removed its own test key. The local Redis check, `node scripts/verify-budget-redis.mjs`, also verifies restart persistence and missing/corrupt/expiring-record refusal.
6. All active environments must use the same remote record and approved ceiling. The current approved snapshot is `gpt-5.4-mini-2026-03-17`; `OPENAI_TEST_BUDGET_USD=3` includes all earlier reservations. Public operation through November 16 is authorized within this total, with no automatic top-up. The conservative Qloo workflow limit remains 30 per process per hour, not a claimed provider quota.

The server sends one atomic Lua reservation before each OpenAI request. Missing records, ceiling mismatch, timeout, malformed response, or provider refusal block paid inference. It never falls back to ephemeral files. If a response is lost after a successful reservation, the allowance stays reserved.

## Unselected paid alternative

The prepared [Render Blueprint](../deploy/render.yaml) uses one Docker web service (`0.5c-512mb`) and a 1 GB persistent disk on a Hobby workspace. The [current public prices](https://render.com/pricing) are $7/month compute plus $0.25/month disk, with a $0 workspace fee. Base cost is therefore $7.25/month, excluding taxes and usage overages. Hobby includes 5 GB bandwidth, then $0.15/GB, and 500 build minutes, then $5 per 1,000 minutes. Inspect the actual checkout estimate before provisioning.

The 512 MB instance is a starting configuration, not a measured live capacity guarantee. The app limits concurrency to two, but the harness still needs a memory/latency test with real responses before committing to this size. A larger plan must be separately approved.

Render supports the required Node child processes via Docker. A [persistent disk](https://render.com/docs/disks) retains the model budget ledger across restarts; only files under its mount persist. The blueprint keeps a single instance and disables automatic deployments. Disk-backed deploys briefly interrupt service. Blueprint fields follow the [official reference](https://render.com/docs/blueprint-spec).

## Before activating the paid alternative

1. Obtain approval for the actual hosting account and charges. The $1 OpenAI test authorization does not authorize hosting or ongoing public model spending.
2. Obtain event-issued Qloo access and its quota. Run the [live validation protocol](live-validation.md) locally first. No fake/live substitution is permitted.
3. Obtain authorization for the public model allowance and how long to keep the service active. The competition requires availability through November 16. Preserve unused versus already reserved test allowance accurately.
4. Verify the GitHub workflow for the deployment commit is green. Check that public source contains no credentials or private evidence.

## Provisioning procedure

Import `deploy/render.yaml` from the public repository in the approved Render account. The file is not at the default root path, so explicitly select that blueprint path. Confirm the $7.25/month base configuration, Hobby workspace, single instance, Ohio region, 1 GB disk, no automatic deploys and no extra services before creating it.

Set provider credentials privately in Render's secret environment fields. Set the workflow limit from the issued Qloo quota and the model allowance from explicit authorization. Never upload the private `.env` file or put secrets in the blueprint.

The ledger path is `/var/data/openai-budget.json`. Verify the container user can write within `/var/data` before live calls. If carrying the same authorized allowance from local tests, stop local paid requests and transfer the entire existing ledger to this path before allowing public requests. Do not reset, fork or independently spend the same allowance across two servers. Keep the ledger through deploys and restarts.

Do not infer launch success from `/api/status` alone: it reports configuration, not a verified provider response. Run an actual public brief anonymously, inspect constraints and provenance, revise it, and export its proposal. Verify desktop and mobile behavior, missing/invalid-key failures, cancellation and capacity limits. Record the tested URL and commit in `evaluation.md` and `submission.md` only after those checks succeed.

The selected free route is live and verified. The paid alternative remains unapproved. Do not purchase an upgrade to address a free-tier limit without a new user decision.
