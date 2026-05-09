---
sidebar_position: 8
---

# ChromaKey

`chromaKey` removes pixels that match a target color, which is useful for green-screen style effects.

```typescript
interface ChromaKey {
  color: string;
  similarity?: number;
  blend?: number;
}
```

| Property     | Required | Range/format | Notes                            |
| ------------ | -------- | ------------ | -------------------------------- |
| `color`      | Yes      | hex color    | Example: `"#00ff00"`.            |
| `similarity` | No       | `0` to `100` | Higher values match more colors. |
| `blend`      | No       | `0` to `100` | Softens the keyed edge.          |

## Example

```json
{
  "chromaKey": {
    "color": "#00ff00",
    "similarity": 18,
    "blend": 8
  }
}
```

## Used By

- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
- [SVG Elements](../svg-elements.md)
