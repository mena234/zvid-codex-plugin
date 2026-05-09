---
sidebar_position: 3
---

# Anchor

`anchor` controls the transform origin used for placement, rotation, and scaling.

```typescript
type Anchor =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
```

Use `anchor: "center-center"` when `x` and `y` should represent the center point of an element.

## Example

```json
{
  "type": "IMAGE",
  "src": "https://cdn.example.com/photo.jpg",
  "x": 640,
  "y": 360,
  "width": 400,
  "height": 300,
  "anchor": "center-center"
}
```

## Used By

- [Text Elements](../text-elements.md)
- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
- [SVG Elements](../svg-elements.md)
