---
source_url: "https://docs.zvid.io/docs/structure/properties/crop-params"
sidebar_position: 7
---

# CropParams

`cropParams` selects a rectangular region from the source asset before the element is composed.

```typescript
interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

| Property | Required | Notes                         |
| -------- | -------- | ----------------------------- |
| `x`      | Yes      | Left edge of the crop region. |
| `y`      | Yes      | Top edge of the crop region.  |
| `width`  | Yes      | Crop region width.            |
| `height` | Yes      | Crop region height.           |

Values are measured in pixels and must stay within plan limits.

## Example

```json
{
  "cropParams": {
    "x": 100,
    "y": 50,
    "width": 800,
    "height": 600
  }
}
```

## Used By

- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
