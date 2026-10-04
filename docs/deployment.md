# Deployment handoff

Prepared October 4, 2026. Nothing has been provisioned or purchased. The public source is [popcorntoocold/sidecar](https://github.com/popcorntoocold/sidecar); the live application is not deployed.

## Proposed host and cost

The prepared [Render Blueprint](../deploy/render.yaml) uses one Docker web service (`0.5c-512mb`) and a 1 GB persistent disk on a Hobby workspace. The [current public prices](https://render.com/pricing) are $7/month compute plus $0.25/month disk, with a $0 workspace fee. Base cost is therefore $7.25/month, excluding taxes and usage overages. Hobby includes 5 GB bandwidth, then $0.15/GB, and 500 build minutes, then $5 per 1,000 minutes. Inspect the actual checkout estimate before provisioning.

The 512 MB instance is a starting configuration, not a measured live capacity guarantee. The app limits concurrency to two, but the harness still needs a memory/latency test with real responses before committing to this size. A larger plan must be separately approved.

Render supports the required Node child processes via Docker. A [persistent disk](https://render.com/docs/disks) retains the model budget ledger across restarts; only files under its mount persist. The blueprint keeps a single instance and disables automatic deployments. Disk-backed deploys briefly interrupt service. Blueprint fields follow the [official reference](https://render.com/docs/blueprint-spec).

## Before activating

1. Obtain approval for the actual hosting account and charges. The $1 OpenAI test authorization does not authorize hosting or ongoing public model spending.
2. Obtain event-issued Qloo access and its quota. Run the [live validation protocol](live-validation.md) locally first. No fake/live substitution is permitted.
3. Obtain authorization for the public model allowance and how long to keep the service active. The competition requires availability through November 16. Preserve unused versus already reserved test allowance accurately.
4. Verify the GitHub workflow for the deployment commit is green. Check that public source contains no credentials or private evidence.

## Provisioning procedure

Import `deploy/render.yaml` from the public repository in the approved Render account. The file is not at the default root path, so explicitly select that blueprint path. Confirm the $7.25/month base configuration, Hobby workspace, single instance, Ohio region, 1 GB disk, no automatic deploys and no extra services before creating it.

Set provider credentials privately in Render's secret environment fields. Set the workflow limit from the issued Qloo quota and the model allowance from explicit authorization. Never upload the private `.env` file or put secrets in the blueprint.

The ledger path is `/var/data/openai-budget.json`. Verify the container user can write within `/var/data` before live calls. If carrying the same authorized allowance from local tests, stop local paid requests and transfer the entire existing ledger to this path before allowing public requests. Do not reset, fork or independently spend the same allowance across two servers. Keep the ledger through deploys and restarts.

Do not infer launch success from `/api/status` alone: it reports configuration, not a verified provider response. Run an actual public brief anonymously, inspect constraints and provenance, revise it, and export its proposal. Verify desktop and mobile behavior, missing/invalid-key failures, cancellation and capacity limits. Record the tested URL and commit in `evaluation.md` and `submission.md` only after those checks succeed.

If paid hosting is not approved, keep the app local. A temporary tunnel or fictional preview does not satisfy the promised stable, functional public demo.
