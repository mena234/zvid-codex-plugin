---
sidebar_position: 9
---

# BorderRadius

`radius` rounds image corners.

```typescript
interface BorderRadius {
  tl?: number;
  tr?: number;
  bl?: number;
  br?: number;
}
```

| Property | Corner       |
| -------- | ------------ |
| `tl`     | Top-left     |
| `tr`     | Top-right    |
| `bl`     | Bottom-left  |
| `br`     | Bottom-right |

Values are measured in pixels and must stay within plan limits.

## Example

```json
{
  "radius": {
    "tl": 10,
    "tr": 10,
    "bl": 10,
    "br": 10
  }
}
```

## Used By

- [Image Elements](../image-elements.md)
