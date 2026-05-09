---
name: zvid-api
description: Help with Zvid API authentication, render job submission, job polling, credits, API keys, curl/fetch examples, and endpoint behavior based on the bundled Zvid docs.
---

# Zvid API

Use this skill when the user asks how to call the hosted Zvid API, manage API keys, submit render jobs, poll job status, check credits, or handle API errors.

## Source Order

1. Use docs in `../../references/source-docs/` for public API behavior.
2. For render request body validation, defer to the `zvid-video-json` skill and `orch/middleware/validation.js`.
3. Never expose, invent, log, or echo real API keys. Use placeholders like `YOUR_API_KEY`.

## Base URL And Auth

The documented API base URL is:

```text
https://api.zvid.io/api
```

API-key compatible requests use the `x-api-key` header. Zvid API keys are documented as `zvid_` plus 64 hexadecimal characters, and the full key is shown only once in the dashboard.

## Common Flow

The standard render flow is:

1. Verify the key with `GET /api/user/profile`.
2. Check credits with `GET /api/credits/balance`.
3. Submit a render job with `POST /api/render/api-key`.
4. Poll `GET /api/jobs/{id}` until the job is `completed` or `failed`.

## Endpoint Map

- `GET /api/user/profile`: retrieve authenticated user profile and credit balance.
- `GET /api/credits/balance`: retrieve current credit balance.
- `GET /api/credits/transactions`: retrieve paginated credit transactions.
- `GET /api/credits/usage-stats`: retrieve credit usage statistics for a timeframe.
- `GET /api/api-keys`: list active API keys.
- `POST /api/api-keys`: create an API key.
- `PUT /api/api-keys/{id}`: rename an active API key.
- `DELETE /api/api-keys/{id}`: revoke an API key.
- `GET /api/api-keys/{id}/stats`: retrieve API-key usage statistics.
- `POST /api/render/api-key`: queue a render job.
- `GET /api/jobs/{id}`: retrieve render job status, progress, result, or failure reason.

## Response And Error Notes

Render submission returns `202` with `jobId`, `status`, `queuePosition`, and `creditsReserved`.

Render status returns fields such as `id`, `state`, `progress`, `result`, `failedReason`, and `ts`. On completion, use `result.url`; on failure, inspect `failedReason`.

Validation errors use:

```json
{
  "error": "Validation failed",
  "message": "Please check your input and try again",
  "details": []
}
```

Render validation errors may also include `planLimits`.

## References

- Introduction: `../../references/source-docs/intro.md`
- Authentication: `../../references/source-docs/authentication.md`
- Getting started: `../../references/source-docs/getting-started.md`
- Endpoint docs: `../../references/source-docs/endpoints/`
