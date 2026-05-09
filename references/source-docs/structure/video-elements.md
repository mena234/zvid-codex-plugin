---
source_url: "https://docs.zvid.io/docs/structure/video-elements"
sidebar_position: 3
---

# Video Elements

`VIDEO` elements place remote video clips on the project timeline. They support source trimming, playback speed, volume, filters, crop, chroma key, resize, zoom, animations, and video-to-video transitions.

## Interface

```typescript
interface VideoItem {
  type: "VIDEO";
  src: string;
  id?: string;
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
  zoom?: boolean;
  enterAnimation?: XFadeEffect | null;
  exitAnimation?: XFadeEffect | null;
  cropParams?: CropParams;
  chromaKey?: ChromaKey;
  filter?: FilterOptions;
  videoBegin?: number;
  videoEnd?: number;
  videoDuration?: number;
  volume?: number;
  speed?: number;
  frameRate?: number;
  transition?: XFadeEffect | null;
  transitionDuration?: number;
  transitionId?: string;
}
```

## Required Fields

| Property | Type      | Notes                               |
| -------- | --------- | ----------------------------------- |
| `type`   | `"VIDEO"` | Case-insensitive in API validation. |
| `src`    | `string`  | Remote `http` or `https` URL.       |

## Common Property Reference

| Property                   | Quick notes                                                                 | Full reference                                    |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- |
| `position`                 | Preset placement such as `center-center`.                                   | [`PositionPreset`](./properties/position.md)      |
| `anchor`                   | Transform origin for placement and rotation.                                | [`Anchor`](./properties/anchor.md)                |
| `resize`                   | `contain` or `cover`.                                                       | [`ResizeMode`](./properties/resize.md)            |
| `zoom`                     | Center-based zoom during visible duration.                                  | [`zoom`](./properties/zoom.md)                    |
| `filter`                   | Brightness, contrast, blur, tint, and related effects.                      | [`FilterOptions`](./properties/filter-options.md) |
| `cropParams`               | Pixel crop rectangle.                                                       | [`CropParams`](./properties/crop-params.md)       |
| `chromaKey`                | Remove pixels matching a color.                                             | [`ChromaKey`](./properties/chroma-key.md)         |
| animations and transitions | Xfade effect names for `enterAnimation`, `exitAnimation`, and `transition`. | [`XFadeEffect`](./properties/xfade-effects.md)    |

## Timeline And Source Timing

| Property                 | Default                    | Notes                             |
| ------------------------ | -------------------------- | --------------------------------- |
| `enterBegin`, `enterEnd` | `0`                        | Timeline entrance timing.         |
| `exitBegin`, `exitEnd`   | `project.duration`         | Timeline exit timing.             |
| `videoBegin`             | `0`                        | Start offset inside source media. |
| `videoEnd`               | project or source duration | End offset inside source media.   |
| `videoDuration`          | project or source duration | Source clip duration hint.        |

## Audio And Playback

| Property    | Default                   | Range               |
| ----------- | ------------------------- | ------------------- |
| `volume`    | `1`                       | `0` to `1`          |
| `speed`     | `1`                       | `0.1` to `10`       |
| `frameRate` | source/project frame rate | integer `1` to `60` |

Set `volume: 0` on video clips when you want to replace source audio with tracks from `audios`.

## Transitions

Transitions are available only between `VIDEO` elements. Add `id` to the target clip and set `transition`, `transitionDuration`, and `transitionId` on the clip that starts the transition.

```json
[
  {
    "type": "VIDEO",
    "id": "intro",
    "src": "https://cdn.pixabay.com/video/2025/03/12/264272_large.mp4",
    "resize": "cover",
    "enterBegin": 0,
    "exitEnd": 5,
    "transition": "fade",
    "transitionDuration": 1,
    "transitionId": "main"
  },
  {
    "type": "VIDEO",
    "id": "main",
    "src": "https://cdn.pixabay.com/video/2025/05/01/275983_large.mp4",
    "resize": "cover",
    "enterBegin": 5,
    "exitEnd": 10
  }
]
```

The next clip's `id` must match `transitionId`. Keep the handoff timing coordinated: the first clip's `exitEnd` should align with the next clip's `enterBegin` for the documented transition pattern.

## Supported Effects

Video supports [`filter`](./properties/filter-options.md), [`cropParams`](./properties/crop-params.md), and [`chromaKey`](./properties/chroma-key.md). Video does not support [`radius`](./properties/border-radius.md).

## Examples

### Simple Video

```json
{
  "type": "VIDEO",
  "src": "https://cdn.pixabay.com/video/2025/06/03/283533_large.mp4",
  "resize": "cover",
  "volume": 0
}
```

### Trimmed Clip

```json
{
  "type": "VIDEO",
  "src": "https://cdn.pixabay.com/video/2025/06/03/283533_large.mp4",
  "videoBegin": 5,
  "videoEnd": 25,
  "volume": 0.8,
  "width": 1920,
  "height": 1080,
  "enterBegin": 0,
  "exitEnd": 20
}
```

### Picture In Picture

```json
{
  "type": "VIDEO",
  "src": "https://cdn.pixabay.com/video/2025/05/01/275983_large.mp4",
  "videoBegin": 10,
  "videoEnd": 30,
  "width": 300,
  "height": 200,
  "position": "bottom-right",
  "volume": 0.3,
  "track": 10
}
```

## Formats

Input video assets are remote URLs and are checked before rendering. Output video formats are limited to `mp4`, `mov`, `avi`, and `webm`.

## Related Pages

- [Transitions](./transitions.md)
- [Audio Elements](./audio-elements.md)
- [Animation Effects](./animations.md)
- [XFadeEffect](./properties/xfade-effects.md)
