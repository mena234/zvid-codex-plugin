---
source_url: "https://docs.zvid.io/docs/structure/properties/filter-options"
sidebar_position: 6
---

# FilterOptions

`filter` adjusts visual appearance before the element is composed.

```typescript
interface FilterOptions {
  brightness?: number;
  contrast?: number;
  saturate?: number;
  "hue-rotate"?: string;
  blur?: string;
  invert?: boolean;
  colorTint?: string;
}
```

| Property     | Range/format    | Notes                       |
| ------------ | --------------- | --------------------------- |
| `brightness` | `-100` to `100` | Lower or raise brightness.  |
| `contrast`   | `-100` to `100` | Lower or raise contrast.    |
| `saturate`   | `-100` to `100` | Lower or raise saturation.  |
| `hue-rotate` | degree string   | Example: `"30"`.            |
| `blur`       | `0` to `100`    | Larger values blur more.    |
| `invert`     | `boolean`       | Inverts colors when `true`. |
| `colorTint`  | hex color       | Example: `"#ff6b35"`.       |

## Example

```json
{
  "filter": {
    "brightness": -10,
    "hue-rotate": "30",
    "blur": "2"
  }
}
```

## Used By

- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
- [SVG Elements](../svg-elements.md)
