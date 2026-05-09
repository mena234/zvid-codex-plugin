---
source_url: "https://docs.zvid.io/docs/structure/animations"
sidebar_position: 7
---

# Animation Effects

Animations are enter and exit effects for visual elements. They use FFmpeg xfade effects against transparent backgrounds.

## Properties

| Property         | Default            | Notes                                   |
| ---------------- | ------------------ | --------------------------------------- |
| `enterBegin`     | `0`                | Time when the enter animation starts.   |
| `enterEnd`       | `0`                | Time when the element is fully visible. |
| `exitBegin`      | `project.duration` | Time when exit animation starts.        |
| `exitEnd`        | `project.duration` | Time when the element has disappeared.  |
| `enterAnimation` | `null`             | Supported xfade effect name.            |
| `exitAnimation`  | `null`             | Supported xfade effect name.            |

Use an animation only when its end time is greater than its start time.

## Supported Effects

The API accepts the [`XFadeEffect`](./properties/xfade-effects.md) source list for `enterAnimation`, `exitAnimation`, and video `transition`.

## Examples

### Fade In And Out

```json
{
  "type": "TEXT",
  "text": "Hello World",
  "position": "center-center",
  "enterBegin": 0,
  "enterEnd": 1,
  "exitBegin": 9,
  "exitEnd": 10,
  "enterAnimation": "fade",
  "exitAnimation": "fade"
}
```

### Quick SVG Animation

```json
{
  "type": "SVG",
  "svg": "<svg width=\"200\" height=\"150\" viewBox=\"0 0 200 150\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"200\" height=\"150\" fill=\"#ff6b35\" /></svg>",
  "x": 500,
  "y": 200,
  "enterBegin": 5,
  "enterEnd": 5.5,
  "exitBegin": 7,
  "exitEnd": 7.3,
  "enterAnimation": "dissolve",
  "exitAnimation": "dissolve"
}
```

## Troubleshooting

- Animation not visible: ensure the duration is not zero.
- Validation error: check the effect name against the supported list.
- Choppy output: reduce simultaneous animated elements or use simpler effects.

## Related Pages

- [Text Elements](./text-elements.md)
- [Image Elements](./image-elements.md)
- [Video Transitions](./transitions.md)
- [XFadeEffect](./properties/xfade-effects.md)
