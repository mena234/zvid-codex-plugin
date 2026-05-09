---
sidebar_position: 5
---

# Zoom

`zoom: true` applies a center-based zoom effect during the element's visible duration.

```typescript
zoom?: boolean;
```

`zoom` is supported for `IMAGE`, `VIDEO`, and `GIF` elements. It is not part of the `SVG` API schema.

## Example

```json
{
  "type": "IMAGE",
  "src": "https://cdn.example.com/photo.jpg",
  "width": 1280,
  "height": 720,
  "zoom": true
}
```

## Used By

- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
