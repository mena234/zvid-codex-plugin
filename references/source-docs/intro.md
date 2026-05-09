---
sidebar_position: 1
---

# Introduction

Welcome to the **Zvid API Documentation**. The Zvid API lets you submit JSON video projects, queue render jobs, check job status, manage credits, and create API keys.

## What is Zvid?

Zvid is a video rendering platform for creating videos from structured JSON. The API flow is:

1. Send a render request to `POST /api/render/api-key` with a `payload` object.
2. The Zvid API authenticates the API key, validates the payload, checks credits and rate limits, and queues the render job.
3. Zvid resolves remote assets, applies plan limits, renders the video, and uploads the result.
4. Poll `GET /api/jobs/{id}` to retrieve progress and the final result.

With Zvid, you can:

- Render videos with custom text, images, SVGs, GIFs, video clips, audio, and subtitles
- Manage API keys for server-to-server access
- Track render jobs and results
- Monitor credit balance and usage

## Quick Start

### 1. Create an API Key

Create an API key from the [Zvid Dashboard](https://dash.zvid.io):

1. Log in to your Zvid account.
2. Open **API Access**.
3. Click **Create API Key**.
4. Give the key a descriptive name.
5. Copy and store the key securely. The full key is shown only once.

### 2. Verify the Key

```bash
curl -X GET https://api.zvid.io/api/user/profile \
  -H "x-api-key: your-api-key-here"
```

### 3. Submit a Render Job

```bash
curl -X POST https://api.zvid.io/api/render/api-key \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "name": "test",
      "width": 1920,
      "height": 1080,
      "duration": 10,
      "backgroundColor": "#000000",
      "visuals": [
        {
          "type": "TEXT",
          "text": "Hello, Zvid!",
          "x": 960,
          "y": 540,
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

Example queued response:

```json
{
  "jobId": "a88b7ad5-d0ed-48be-95df-b4ee41f3f07e",
  "status": "queued",
  "queuePosition": 2,
  "creditsReserved": 15
}
```

Save `jobId`; it is the ID used by the jobs endpoint.

### 4. Check the Render Job

```bash
curl -X GET https://api.zvid.io/api/jobs/{id} \
  -H "x-api-key: your-api-key-here"
```

### Example Response: Processing

```json
{
  "id": "a88b7ad5-d0ed-48be-95df-b4ee41f3f07e",
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

### Example Response: Completed

```json
{
  "id": "a88b7ad5-d0ed-48be-95df-b4ee41f3f07e",
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
    "url": "https://cdn.zvid.io/videos/121/test.mp4",
    "thumbnailUrl": "https://cdn.zvid.io/images/121/test_thumbnail.jpg",
    "size": 3848989,
    "fileName": "test.mp4",
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

### Example Response: Failed

```json
{
  "id": "a88b7ad5-d0ed-48be-95df-b4ee41f3f07e",
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

## Response Fields

- `id`: Render job ID.
- `state`: Job state, such as `waiting`, `active`, `completed`, or `failed`.
- `progress`: Current render/upload progress. It may be a number or an object with `phase`, `percentage`, and `message`.
- `result`: Final render output when completed.
- `failedReason`: Error message when the job fails.
- `ts`: Created, updated, and finished timestamps.

## API Base URL

```text
https://api.zvid.io/api
```

## What's Next?

- Read the [Authentication Guide](./authentication.md).
- Follow the [Getting Started Guide](./getting-started.md).
- Explore the [JSON Structure Overview](./structure.md).

## Need Help?

Contact [help@zvid.io](mailto:help@zvid.io).
