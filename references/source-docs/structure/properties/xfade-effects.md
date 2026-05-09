---
source_url: "https://docs.zvid.io/docs/structure/properties/xfade-effects"
sidebar_position: 10
---

# XFadeEffect

`XFadeEffect` is used by `enterAnimation`, `exitAnimation`, and video `transition`.

```typescript
type XFadeEffect =
  | "fade"
  | "fadeblack"
  | "fadewhite"
  | "wipeleft"
  | "wiperight"
  | "wipeup"
  | "wipedown"
  | "slideleft"
  | "slideright"
  | "slideup"
  | "slidedown"
  | "smoothleft"
  | "smoothright"
  | "smoothup"
  | "smoothdown"
  | "circlecrop"
  | "rectcrop"
  | "circleclose"
  | "circleopen"
  | "horzclose"
  | "horzopen"
  | "vertclose"
  | "vertopen"
  | "diagbl"
  | "diagbr"
  | "diagtl"
  | "diagtr"
  | "hlslice"
  | "hrslice"
  | "vuslice"
  | "vdslice"
  | "dissolve"
  | "pixelize"
  | "radial"
  | "hblur"
  | "wipetl"
  | "wipetr"
  | "wipebl"
  | "wipebr"
  | "fadegrays";
```

Unsupported xfade names such as `distance`, `zoomin`, `hlwind`, `hrwind`, `squeezeh`, `squeezev`, `coverleft`, and `revealleft` are rejected by the hosted API.

## Used By

- [Animation Effects](../animations.md)
- [Video Transitions](../transitions.md)
- [Text Elements](../text-elements.md)
- [Image Elements](../image-elements.md)
- [Video Elements](../video-elements.md)
- [GIF Elements](../gif-elements.md)
- [SVG Elements](../svg-elements.md)
