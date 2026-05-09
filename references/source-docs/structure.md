---
sidebar_position: 4
---

# JSON Structure Overview

A Zvid project is a plain JSON object submitted as `payload` to `POST /api/render/api-key`.

```json
{
  "payload": {
    "name": "my-video",
    "duration": 30,
    "visuals": [],
    "audios": []
  }
}
```

The Zvid API validates the payload, checks account limits, queues the render, resolves remote assets, and produces the final video.

## Project Object

```typescript
interface Project {
  name?: string;
  width?: number;
  height?: number;
  resolution?: ResolutionPreset;
  duration?: number;
  frameRate?: number;
  backgroundColor?: string;
  outputFormat?: "mp4" | "mov" | "avi" | "webm";
  visuals?: Item[];
  audios?: AudioItem[];
  thumbnail?: string;
  subtitle?: Subtitle;
}
```

| Property          | Type                                                               | Required | Default               | Notes                                                                                                     |
| ----------------- | ------------------------------------------------------------------ | -------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                                                           | No       | `"unnamed"`           | Output filename without extension. Letters, numbers, spaces, `_`, and `-` are accepted by API validation. |
| `width`           | `number`                                                           | No       | `1280`                | Used for custom resolution. Limited by the user's plan.                                                   |
| `height`          | `number`                                                           | No       | `720`                 | Used for custom resolution. Limited by the user's plan.                                                   |
| `resolution`      | [`ResolutionPreset`](./structure/properties/resolution-presets.md) | No       | custom dimensions     | Preset dimensions override `width` and `height` when not `custom`.                                        |
| `duration`        | `number`                                                           | No       | `10`                  | Seconds. Minimum `0.1`; maximum is plan-dependent.                                                        |
| `frameRate`       | `number`                                                           | No       | `30`                  | Integer from `1` to `60`.                                                                                 |
| `backgroundColor` | `string`                                                           | No       | `#ffffff`             | Hex color, such as `#000000`.                                                                             |
| `outputFormat`    | `string`                                                           | No       | `mp4`                 | API accepts only `mp4`, `mov`, `avi`, and `webm`.                                                         |
| `visuals`         | `Item[]`                                                           | No       | `[]`                  | Text, image, video, GIF, and SVG elements.                                                                |
| `audios`          | `AudioItem[]`                                                      | No       | `[]`                  | External audio tracks.                                                                                    |
| `thumbnail`       | `string`                                                           | No       | generated when absent | Optional remote image URL.                                                                                |
| `subtitle`        | `Subtitle`                                                         | No       | none                  | Caption and subtitle configuration.                                                                       |

## Resolution Presets

See the [`ResolutionPreset`](./structure/properties/resolution-presets.md) source reference for supported preset names, dimensions, and usage notes.

## Property Reference

All visual elements share timeline, transform, and layering fields. Media elements add resizing and zoom where supported. The pages below are the canonical source references for reusable typed properties:

- [`PositionPreset`](./structure/properties/position.md)
- [`Anchor`](./structure/properties/anchor.md)
- [`ResizeMode`](./structure/properties/resize.md)
- [`zoom`](./structure/properties/zoom.md)
- [`FilterOptions`](./structure/properties/filter-options.md)
- [`CropParams`](./structure/properties/crop-params.md)
- [`ChromaKey`](./structure/properties/chroma-key.md)
- [`BorderRadius`](./structure/properties/border-radius.md)
- [`XFadeEffect`](./structure/properties/xfade-effects.md)
- [`Caption`](./structure/properties/caption.md)
- [`Word`](./structure/properties/word.md)
- [`SubtitleStyles`](./structure/properties/subtitle-styles.md)

## Element Types

- [Text Elements](./structure/text-elements.md): plain text or safe HTML.
- [Image Elements](./structure/image-elements.md): remote image sources, filters, crop, radius, chroma key, resize, and zoom.
- [Video Elements](./structure/video-elements.md): remote video clips, trim timing, audio, playback speed, transitions, resize, and zoom.
- [GIF Elements](./structure/gif-elements.md): animated GIFs with timing, resize, zoom, crop, filters, and chroma key.
- [SVG Elements](./structure/svg-elements.md): inline SVG with validation restrictions.
- [Audio Elements](./structure/audio-elements.md): background music, narration, and sound effects.
- [Subtitle](./structure/subtitle.md): word-timed captions and subtitle styling.
- [Animation Effects](./structure/animations.md): enter and exit animations for visual elements.
- [Video Transitions](./structure/transitions.md): video-to-video xfade transitions.

## Defaults

### Project Defaults

| Property          | Default   |
| ----------------- | --------- |
| `width`           | `1280`    |
| `height`          | `720`     |
| `duration`        | `10`      |
| `frameRate`       | `30`      |
| `backgroundColor` | `#ffffff` |
| `outputFormat`    | `mp4`     |
| `name`            | `unnamed` |
| `visuals`         | `[]`      |
| `audios`          | `[]`      |

### Visual Defaults

| Property                          | Default            |
| --------------------------------- | ------------------ |
| `x`, `y`                          | `0`                |
| `enterBegin`, `enterEnd`          | `0`                |
| `exitBegin`, `exitEnd`            | `project.duration` |
| `opacity`                         | `1`                |
| `angle`                           | `0`                |
| `flipV`, `flipH`                  | `false`            |
| `track`                           | `0`                |
| `enterAnimation`, `exitAnimation` | `null`             |

### Video Defaults

| Property                     | Default                                            |
| ---------------------------- | -------------------------------------------------- |
| `videoBegin`                 | `0`                                                |
| `videoEnd`                   | project duration or source duration when available |
| `videoDuration`              | project duration or source duration when available |
| `volume`                     | `1`                                                |
| `speed`                      | `1`                                                |
| `transition`, `transitionId` | `null`                                             |

### Audio Defaults

| Property        | Default                                            |
| --------------- | -------------------------------------------------- |
| `enter`         | `0`                                                |
| `exit`          | project duration                                   |
| `audioBegin`    | `0`                                                |
| `audioEnd`      | project duration or source duration when available |
| `audioDuration` | project duration or source duration when available |
| `volume`        | `1`                                                |
| `speed`         | `1`                                                |

## Supported Formats

- Input media: remote HTTP/HTTPS assets accepted by API validation and checked during rendering.
- Output video: `mp4`, `mov`, `avi`, or `webm`.
- SVG: inline SVG only, with security restrictions described in [SVG Elements](./structure/svg-elements.md).
- Text HTML: safe subset only, described in [Text Elements](./structure/text-elements.md).

## Resource Limits

Limits are plan-dependent and enforced before or during rendering. They include output resolution, project duration, input media resolution, media size, and element counts by type. Validation errors include the active plan limits when the payload exceeds them.

## Quick Examples

### Basic Text Element

```json
{
  "type": "TEXT",
  "text": "Hello World",
  "x": 640,
  "y": 360,
  "anchor": "center-center",
  "style": {
    "fontSize": 48,
    "color": "#000000",
    "textAlign": "center"
  }
}
```

### Basic Image Element

```json
{
  "type": "IMAGE",
  "src": "https://images.pexels.com/photos/32972375/pexels-photo-32972375.jpeg",
  "x": 100,
  "y": 100,
  "width": 607,
  "height": 910
}
```

### Basic Video Element

```json
{
  "type": "VIDEO",
  "src": "https://videos.pexels.com/video-files/1409899/1409899-sd_640_360_25fps.mp4",
  "videoEnd": 10,
  "volume": 0
}
```

### Basic Audio Element

```json
{
  "src": "https://cdn.pixabay.com/audio/2025/04/21/audio_ed6f0ed574.mp3",
  "volume": 0.5
}
```

## Next Steps

- [Getting Started](./getting-started.md)
- [Examples](./examples/inspirational-video.md)
- [FAQ](./faq.md)
