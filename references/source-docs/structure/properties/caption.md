---
source_url: "https://docs.zvid.io/docs/structure/properties/caption"
sidebar_position: 11
---

# Caption

`Caption` defines one subtitle segment on the video timeline.

```typescript
interface Caption {
  start: number;
  end: number;
  text: string;
  words: Word[];
}
```

| Property | Required | Notes                               |
| -------- | -------- | ----------------------------------- |
| `start`  | Yes      | Caption start time in seconds.      |
| `end`    | Yes      | Caption end time in seconds.        |
| `text`   | Yes      | Full caption text.                  |
| `words`  | Yes      | Word-level timings for the caption. |

## Example

```json
{
  "start": 0.5,
  "end": 2,
  "text": "Welcome to our video",
  "words": [
    { "start": 0.5, "end": 0.9, "text": "Welcome" },
    { "start": 0.9, "end": 1.1, "text": "to" },
    { "start": 1.1, "end": 1.4, "text": "our" },
    { "start": 1.4, "end": 2, "text": "video" }
  ]
}
```

## Used By

- [Subtitle](../subtitle.md)
- [Word](./word.md)
