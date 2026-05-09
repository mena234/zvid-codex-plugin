---
source_url: "https://docs.zvid.io/docs/structure/text-elements"
sidebar_position: 1
---

# Text Elements

`TEXT` elements render plain text or safe HTML into an image layer, then compose that layer into the video.

## Interface

```typescript
interface TextItem {
  type: "TEXT";
  text?: string;
  html?: string;
  style?: Record<string, string | number>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchor?: Anchor;
  position?: PositionPreset;
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
}
```

## Required Fields

| Property         | Type     | Notes                               |
| ---------------- | -------- | ----------------------------------- |
| `type`           | `"TEXT"` | Case-insensitive in API validation. |
| `text` or `html` | `string` | At least one must contain content.  |

## Common Property Reference

| Property   | Quick notes                                  | Full reference                                 |
| ---------- | -------------------------------------------- | ---------------------------------------------- |
| `position` | Preset placement such as `center-center`.    | [`PositionPreset`](./properties/position.md)   |
| `anchor`   | Transform origin for placement and rotation. | [`Anchor`](./properties/anchor.md)             |
| animations | Enter and exit xfade effects.                | [`XFadeEffect`](./properties/xfade-effects.md) |

## Content

- `text` is plain text. The API rejects `<` and `>` in this field.
- `html` supports a safe subset of inline HTML and takes priority over `text` when both are present.
- `style` accepts safe CSS property names and safe string or number values.

Allowed `html` tags are `b`, `strong`, `i`, `em`, `u`, `s`, `br`, `span`, `div`, `p`, `ul`, `ol`, and `li`.

The API rejects script/style tags, event handler attributes, unsupported attributes, external CSS resource loads such as `url(...)` and `@import`, control characters, and unsafe CSS tokens.

## Common Properties

| Property                 | Default                                     | Notes                                        |
| ------------------------ | ------------------------------------------- | -------------------------------------------- |
| `x`, `y`                 | `0`                                         | Pixel position before preset positioning.    |
| `width`, `height`        | auto-calculated                             | Useful for multi-line text or fixed layouts. |
| `position`               | `custom`                                    | Preset positioning overrides `x` and `y`.    |
| `anchor`                 | derived from `position` when preset is used | Transform origin for placement and rotation. |
| `enterBegin`, `enterEnd` | `0`                                         | Entrance timing.                             |
| `exitBegin`, `exitEnd`   | `project.duration`                          | Exit timing.                                 |
| `track`                  | `0`                                         | Higher tracks render above lower tracks.     |
| `opacity`                | `1`                                         | `0` to `1`.                                  |
| `angle`                  | `0`                                         | `-360` to `360` degrees.                     |
| `flipV`, `flipH`         | `false`                                     | Vertical and horizontal flips.               |

## Examples

### Plain Text

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

### Styled Text With Animation

```json
{
  "type": "TEXT",
  "text": "Welcome to Zvid",
  "position": "center-center",
  "enterBegin": 0,
  "enterEnd": 1,
  "exitBegin": 9,
  "exitEnd": 10,
  "enterAnimation": "fade",
  "exitAnimation": "fade",
  "style": {
    "fontSize": 36,
    "color": "#ff6b35",
    "textAlign": "center",
    "fontWeight": "bold"
  }
}
```

### Safe HTML

```json
{
  "type": "TEXT",
  "html": "<div style=\"text-align:center\"><p style=\"color:#ff6b35; margin:0; font-size:48px\">Big Title</p><p style=\"color:#666666; font-size:18px\">Subtitle text</p></div>",
  "position": "center-center",
  "enterBegin": 0,
  "enterEnd": 2,
  "exitBegin": 8,
  "exitEnd": 10
}
```

### Watermark

```json
{
  "type": "TEXT",
  "text": "WATERMARK",
  "x": 660,
  "y": 340,
  "anchor": "center-center",
  "angle": 45,
  "opacity": 0.3,
  "track": 10,
  "style": {
    "fontSize": 72,
    "color": "#000000",
    "fontFamily": "Anton",
    "textAlign": "center"
  }
}
```

## Font Handling

Use exact Google Fonts family names, such as `Poppins`, `Montserrat`, `Roboto`, `Open Sans`, `Lato`, `Playfair Display`, `Oswald`, or `Bebas Neue`.

## Related Pages

- [Animation Effects](./animations.md)
- [Image Elements](./image-elements.md)
- [Video Elements](./video-elements.md)
- [Anchor](./properties/anchor.md)
