---
source_url: "https://docs.zvid.io/docs/structure/properties/resize"
sidebar_position: 4
---

# Resize

`resize` scales media to the project canvas while preserving the asset aspect ratio.

```typescript
type ResizeMode = "contain" | "cover";
```

| Value     | Behavior                                 |
| --------- | ---------------------------------------- |
| `contain` | Fits the full asset inside the canvas.   |
| `cover`   | Fills the canvas and may crop the asset. |

`resize` is supported for `IMAGE`, `VIDEO`, and `GIF` elements.

:::note
SVG elements should use explicit `width` and `height`. Although `resize` may pass API validation for SVG, it is not applied during rendering.
:::

## Example

```json
{
  "type": "IMAGE",
  "src": "https://cdn.example.com/photo.jpg",
  "resize": "cover",
  "position": "center-center"
}
```

## Used By

- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
