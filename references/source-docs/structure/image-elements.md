---
sidebar_position: 2
---

# Image Elements

`IMAGE` elements add remote raster images to the composition. The API validates the URL and visual options, then Zvid downloads and checks the asset before rendering.

## Interface

```typescript
interface ImageItem {
  type: "IMAGE";
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
  radius?: BorderRadius;
  zoom?: boolean;
}
```

## Required Fields

| Property | Type      | Notes                               |
| -------- | --------- | ----------------------------------- |
| `type`   | `"IMAGE"` | Case-insensitive in API validation. |
| `src`    | `string`  | Remote `http` or `https` URL.       |

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
| `radius`     | Rounded image corners.                                 | [`BorderRadius`](./properties/border-radius.md)   |
| animations   | Enter and exit xfade effects.                          | [`XFadeEffect`](./properties/xfade-effects.md)    |

## Properties

| Property                 | Default                                     | Notes                             |
| ------------------------ | ------------------------------------------- | --------------------------------- |
| `x`, `y`                 | `0`                                         | Pixel position.                   |
| `width`, `height`        | source or project dimensions                | Limited by plan input resolution. |
| `position`               | `custom`                                    | Preset positioning.               |
| `anchor`                 | derived from `position` when preset is used | Transform origin.                 |
| `resize`                 | none                                        | `contain` or `cover`.             |
| `enterBegin`, `enterEnd` | `0`                                         | Entrance timing.                  |
| `exitBegin`, `exitEnd`   | `project.duration`                          | Exit timing.                      |
| `track`                  | `0`                                         | Layer order.                      |
| `opacity`                | `1`                                         | `0` to `1`.                       |
| `angle`                  | `0`                                         | `-360` to `360` degrees.          |
| `flipV`, `flipH`         | `false`                                     | Flips the element.                |
| `zoom`                   | `false`                                     | Enables center-based zoom.        |

## Examples

### Simple Image

```json
{
  "type": "IMAGE",
  "src": "https://cdn.pixabay.com/photo/2022/08/16/05/50/straw-bales-7389396_1280.jpg",
  "x": 100,
  "y": 100,
  "width": 400,
  "height": 300
}
```

### Centered Cover Image

```json
{
  "type": "IMAGE",
  "src": "https://cdn.pixabay.com/photo/2024/10/02/18/24/leaf-9091894_1280.jpg",
  "width": 1280,
  "height": 720,
  "position": "center-center",
  "resize": "cover"
}
```

### Cropped Image

```json
{
  "type": "IMAGE",
  "src": "https://cdn.pixabay.com/photo/2023/06/04/20/21/cat-8040862_1280.jpg",
  "x": 300,
  "y": 200,
  "width": 400,
  "height": 300,
  "cropParams": {
    "x": 100,
    "y": 50,
    "width": 800,
    "height": 600
  }
}
```

### Rounded Corners And Filters

```json
{
  "type": "IMAGE",
  "src": "https://cdn.pixabay.com/photo/2022/11/05/22/11/channel-7572879_1280.jpg",
  "width": 300,
  "height": 200,
  "position": "bottom-right",
  "radius": {
    "tl": 10,
    "tr": 10,
    "bl": 10,
    "br": 10
  },
  "filter": {
    "brightness": -10,
    "hue-rotate": "30",
    "blur": "2"
  }
}
```

## Related Pages

- [Video Elements](./video-elements.md)
- [GIF Elements](./gif-elements.md)
- [Animation Effects](./animations.md)
- [FilterOptions](./properties/filter-options.md)
- [CropParams](./properties/crop-params.md)
- [ChromaKey](./properties/chroma-key.md)
- [BorderRadius](./properties/border-radius.md)
