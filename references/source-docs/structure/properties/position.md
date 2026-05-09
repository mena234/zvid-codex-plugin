---
source_url: "https://docs.zvid.io/docs/structure/properties/position"
sidebar_position: 2
---

# PositionPreset

`position` places an element on the canvas using a preset. When `position` is not `custom`, Zvid calculates `x` and `y` from the project dimensions and item dimensions. If no explicit `anchor` is set, Zvid uses the same value as the non-custom `position`.

```typescript
type PositionPreset =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "custom";
```

| Value           | Placement                       |
| --------------- | ------------------------------- |
| `top-left`      | Top-left corner                 |
| `top-center`    | Top edge, centered              |
| `top-right`     | Top-right corner                |
| `center-left`   | Left edge, vertically centered  |
| `center-center` | Center of the canvas            |
| `center-right`  | Right edge, vertically centered |
| `bottom-left`   | Bottom-left corner              |
| `bottom-center` | Bottom edge, centered           |
| `bottom-right`  | Bottom-right corner             |
| `custom`        | Use explicit `x` and `y`        |

## Example

```json
{
  "type": "TEXT",
  "text": "Centered",
  "position": "center-center"
}
```

## Used By

- [Text Elements](../text-elements.md)
- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
- [SVG Elements](../svg-elements.md)
