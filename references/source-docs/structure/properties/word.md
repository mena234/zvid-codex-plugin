---
source_url: "https://docs.zvid.io/docs/structure/properties/word"
sidebar_position: 12
---

# Word

`Word` defines the timing for one word inside a subtitle caption.

```typescript
interface Word {
  start: number;
  end: number;
  text: string;
}
```

| Property | Required | Notes                       |
| -------- | -------- | --------------------------- |
| `start`  | Yes      | Word start time in seconds. |
| `end`    | Yes      | Word end time in seconds.   |
| `text`   | Yes      | Word text.                  |

Word timings drive `one-word`, `karaoke`, and `progressive` subtitle modes.

## Used By

- [Caption](./caption.md)
- [Subtitle](../subtitle.md)
