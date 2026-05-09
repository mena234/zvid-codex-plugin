---
source_url: "https://docs.zvid.io/docs/structure/gif-elements"
sidebar_position: 4
---

# GIF Elements

`GIF` elements add animated GIF assets to a project. The hosted API accepts GIFs as media-like visual elements, including timing, transform, resize, zoom, crop, filters, and chroma key options.

## Interface

```typescript
interface GIFItem {
  type: "GIF";
  src: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchor?: Anchor;
  position?: PositionPreset;
  resize?: "contain" | "cover";
  enterBegin?: number;
  enterEnd?: number;
  exitBegin?: number;
  exitEnd?: number;
  track?: number;
  opacity?: number;
  angle?: number;
  flipV?: boolean;
  flipH?: boolean;
  enterAnimation?: XFadeEffect | null;
  exitAnimation?: XFadeEffect | null;
  filter?: FilterOptions;
  cropParams?: CropParams;
  chromaKey?: ChromaKey;
  zoom?: boolean;
}
```

## Required Fields

| Property | Type     | Notes                               |
| -------- | -------- | ----------------------------------- |
| `type`   | `"GIF"`  | Case-insensitive in API validation. |
| `src`    | `string` | Remote `http` or `https` URL.       |

## Common Property Reference

| Property     | Quick notes                                            | Full reference                                    |
| ------------ | ------------------------------------------------------ | ------------------------------------------------- |
| `position`   | Preset placement such as `center-center`.              | [`PositionPreset`](./properties/position.md)      |
| `anchor`     | Transform origin for placement and rotation.           | [`Anchor`](./properties/anchor.md)                |
| `resize`     | `contain` or `cover`.                                  | [`ResizeMode`](./properties/resize.md)            |
| `zoom`       | Center-based zoom during visible duration.             | [`zoom`](./properties/zoom.md)                    |
| `filter`     | Brightness, contrast, blur, tint, and related effects. | [`FilterOptions`](./properties/filter-options.md) |
| `cropParams` | Pixel crop rectangle.                                  | [`CropParams`](./properties/crop-params.md)       |
| `chromaKey`  | Remove pixels matching a color.                        | [`ChromaKey`](./properties/chroma-key.md)         |
| animations   | Enter and exit xfade effects.                          | [`XFadeEffect`](./properties/xfade-effects.md)    |

## Properties

`GIF` supports the same common visual timing and transform properties as images:

- `x`, `y`, `width`, `height`
- `position`, `anchor`, `resize`
- `enterBegin`, `enterEnd`, `exitBegin`, `exitEnd`
- `track`, `opacity`, `angle`, `flipV`, `flipH`
- `enterAnimation`, `exitAnimation`
- `zoom`

It also accepts [`filter`](./properties/filter-options.md), [`cropParams`](./properties/crop-params.md), and [`chromaKey`](./properties/chroma-key.md).

## Examples

### Simple GIF

```json
{
  "type": "GIF",
  "src": "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  "position": "center-center",
  "track": 10
}
```

### Resized GIF

```json
{
  "type": "GIF",
  "src": "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  "width": 300,
  "height": 300,
  "resize": "contain",
  "position": "bottom-right",
  "opacity": 0.8
}
```

### Cropped GIF

```json
{
  "type": "GIF",
  "src": "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  "width": 300,
  "height": 200,
  "cropParams": {
    "x": 50,
    "y": 25,
    "width": 400,
    "height": 300
  }
}
```

## Related Pages

- [Image Elements](./image-elements.md)
- [Video Elements](./video-elements.md)
- [Animation Effects](./animations.md)
- [Property Reference](./properties/position.md)
