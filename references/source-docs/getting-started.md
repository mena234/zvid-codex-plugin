---
sidebar_position: 3
---

# Getting Started

This guide walks through the API-key render flow: verify authentication, check credits, submit a JSON render payload, then poll the job result.

## Prerequisites

- A Zvid account
- An API key from the dashboard
- Sufficient credits for the render

## Step 1: Verify Your API Key

```bash
curl -X GET https://api.zvid.io/api/user/profile \
  -H "x-api-key: YOUR_API_KEY"
```

Example response:

```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-09-01T00:00:00.000Z"
  },
  "credits": {
    "balance": 1164,
    "subscriptionCredits": 1164,
    "addonCredits": {
      "balance": 0,
      "totalEarned": 0,
      "totalSpent": 0
    }
  }
}
```

## Step 2: Check Your Credit Balance

```bash
curl -X GET https://api.zvid.io/api/credits/balance \
  -H "x-api-key: YOUR_API_KEY"
```

```json
{
  "balance": 1164,
  "subscriptionCredits": 1164,
  "addonCredits": {
    "balance": 0,
    "totalEarned": 0,
    "totalSpent": 0
  }
}
```

## Step 3: Submit Your First Render

```bash
curl -X POST https://api.zvid.io/api/render/api-key \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "name": "hello-zvid",
      "width": 1920,
      "height": 1080,
      "duration": 10,
      "frameRate": 30,
      "backgroundColor": "#000000",
      "visuals": [
        {
          "type": "TEXT",
          "text": "Hello, Zvid!",
          "x": 960,
          "y": 540,
          "anchor": "center-center",
          "style": {
            "fontSize": 72,
            "color": "#ffffff",
            "fontFamily": "Arial"
          }
        }
      ]
    }
  }'
```

Example response:

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "queuePosition": 2,
  "creditsReserved": 15
}
```

Save `jobId`; it is the value used as `{id}` in the jobs endpoint.

## Step 4: Check Render Status

```bash
curl -X GET https://api.zvid.io/api/jobs/{id} \
  -H "x-api-key: YOUR_API_KEY"
```

### Processing

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "state": "active",
  "progress": {
    "phase": "rendering",
    "percentage": 65,
    "message": "Rendering frames..."
  },
  "result": null,
  "failedReason": null,
  "ts": {
    "created": 1774290612835,
    "updated": 1774290615000,
    "finished": null
  }
}
```

### Completed

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "state": "completed",
  "progress": {
    "phase": "uploading",
    "percentage": 100,
    "message": "Uploading to B2: 100%"
  },
  "result": {
    "ok": true,
    "renderDuration": 16,
    "totalDuration": 17,
    "finishedAt": "2026-03-23T18:30:29.888Z",
    "url": "https://cdn.zvid.io/videos/4/hello-zvid.mp4",
    "thumbnailUrl": "https://cdn.zvid.io/images/4/hello-zvid_thumbnail.jpg",
    "size": 3848989,
    "fileName": "hello-zvid.mp4",
    "duration": 10
  },
  "failedReason": null,
  "ts": {
    "created": 1774290612835,
    "updated": 1774290612835,
    "finished": 1774290629888
  }
}
```

### Failed

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "state": "failed",
  "progress": {
    "phase": "rendering",
    "percentage": 40,
    "message": "Processing failed"
  },
  "result": null,
  "failedReason": "Rendering failed due to invalid asset",
  "ts": {
    "created": 1774290612835,
    "updated": 1774290617000,
    "finished": 1774290617000
  }
}
```

Poll every few seconds. When `state` is `completed`, use `result.url`. If `state` is `failed`, inspect `failedReason`.

## Error Handling

Validation errors return `400` with field-level details:

```json
{
  "error": "Validation failed",
  "message": "Please check your input and try again",
  "details": [
    {
      "field": "payload.duration",
      "message": "Duration must be at least 0.1 seconds"
    }
  ]
}
```

Fix the listed fields and submit the request again.

## Next Steps

- Explore the [JSON Structure Overview](./structure.md).
- Read the [FAQ](./faq.md).
- Contact [help@zvid.io](mailto:help@zvid.io).
