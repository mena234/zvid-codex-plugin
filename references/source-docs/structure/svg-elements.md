---
source_url: "https://docs.zvid.io/docs/structure/svg-elements"
sidebar_position: 5
---

# SVG Elements

`SVG` elements render inline SVG markup into a visual layer. The API accepts safe SVG content and rejects active content or external resource references.

## Interface

```typescript
interface SVGItem {
  type: "SVG";
  svg: string;
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
  filter?: FilterOptions;
  chromaKey?: ChromaKey;
}
```

## Required Fields

| Property | Type     | Notes                               |
| -------- | -------- | ----------------------------------- |
| `type`   | `"SVG"`  | Case-insensitive in API validation. |
| `svg`    | `string` | Must start with `<svg`.             |

## Common Property Reference

| Property    | Quick notes                                            | Full reference                                    |
| ----------- | ------------------------------------------------------ | ------------------------------------------------- |
| `position`  | Preset placement such as `center-center`.              | [`PositionPreset`](./properties/position.md)      |
| `anchor`    | Transform origin for placement and rotation.           | [`Anchor`](./properties/anchor.md)                |
| `filter`    | Brightness, contrast, blur, tint, and related effects. | [`FilterOptions`](./properties/filter-options.md) |
| `chromaKey` | Remove pixels matching a color.                        | [`ChromaKey`](./properties/chroma-key.md)         |
| animations  | Enter and exit xfade effects.                          | [`XFadeEffect`](./properties/xfade-effects.md)    |

## SVG Safety Restrictions

The hosted API rejects:

- `<script>`, `<foreignObject>`, `<iframe>`, `<object>`, `<embed>`, `<audio>`, and `<video>` tags.
- Event handler attributes such as `onload` or `onclick`.
- External `href`, `xlink:href`, and `src` values. Only internal fragment references like `#gradient-id` are allowed.
- External `url(...)` references. Internal `url(#id)` references are allowed.
- Excessive numeric values and SVG dimensions above the configured safety cap.
- Control characters.

This means inline gradients and filters that reference local IDs are valid, but external images, fonts, scripts, and network-loaded CSS are not.

## Properties

SVG elements support common visual properties: `x`, `y`, `width`, `height`, [`position`](./properties/position.md), [`anchor`](./properties/anchor.md), timing fields, `track`, `opacity`, `angle`, `flipV`, `flipH`, `enterAnimation`, `exitAnimation`, [`filter`](./properties/filter-options.md), and [`chromaKey`](./properties/chroma-key.md).

[`zoom`](./properties/zoom.md) is not part of the SVG API schema.

## Examples

### Simple Rectangle

```json
{
  "type": "SVG",
  "svg": "<svg width=\"200\" height=\"150\" viewBox=\"0 0 200 150\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" width=\"200\" height=\"150\" fill=\"#ff6b35\" /></svg>"
}
```

### Centered Circle With Animation

```json
{
  "type": "SVG",
  "position": "center-center",
  "enterBegin": 0,
  "enterEnd": 1,
  "exitBegin": 4,
  "exitEnd": 5,
  "enterAnimation": "fade",
  "exitAnimation": "fade",
  "svg": "<svg width=\"200\" height=\"200\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"#3498db\" stroke=\"#2c3e50\" stroke-width=\"4\" /></svg>"
}
```

### Local Gradient

```json
{
  "type": "SVG",
  "position": "center-center",
  "svg": "<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><defs><linearGradient id=\"grad1\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#ff6b35\" /><stop offset=\"100%\" stop-color=\"#f7931e\" /></linearGradient></defs><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"url(#grad1)\" /></svg>"
}
```

## Best Practices

- Include `width`, `height`, and `viewBox` for predictable sizing.
- Keep SVG markup compact.
- Use local IDs for gradients, patterns, and filters.
- Avoid external dependencies.

## Related Pages

- [Image Elements](./image-elements.md)
- [Text Elements](./text-elements.md)
- [Animation Effects](./animations.md)
- [FilterOptions](./properties/filter-options.md)
