---
source_url: "https://docs.zvid.io/docs/structure/transitions"
sidebar_position: 8
---

# Video Transitions

Video transitions blend one `VIDEO` element into another using FFmpeg xfade. They are separate from enter/exit animations, which animate an element against transparency.

## Requirements

Transitions apply only to `VIDEO` elements.

On the first clip:

- Set `id`.
- Set `transition` to a supported xfade effect.
- Set `transitionDuration`.
- Set `transitionId` to the next clip's `id`.
- Coordinate timing so the first clip's `exitEnd` aligns with the next clip's `enterBegin`.

On the next clip:

- Set a matching `id`.
- Set `enterBegin` at the handoff time.

Avoid combining an exit animation on the first transition clip or an enter animation on the later transition clip in the same handoff, because that competes with the transition.

## Supported Effects

Transitions use the [`XFadeEffect`](./properties/xfade-effects.md) source list, including `fade`, `fadeblack`, `fadewhite`, `wipeleft`, `slideright`, `smoothleft`, `circlecrop`, `dissolve`, `pixelize`, `radial`, `hblur`, and `fadegrays`.

## Examples

### Fade Transition

```json
[
  {
    "type": "VIDEO",
    "id": "clip1",
    "src": "https://cdn.pixabay.com/video/2025/06/03/283533_large.mp4",
    "width": 1280,
    "height": 720,
    "enterBegin": 0,
    "exitEnd": 5,
    "transition": "fade",
    "transitionId": "clip2",
    "transitionDuration": 2
  },
  {
    "type": "VIDEO",
    "id": "clip2",
    "src": "https://cdn.pixabay.com/video/2025/06/09/284566_large.mp4",
    "width": 1280,
    "height": 720,
    "enterBegin": 5,
    "exitEnd": 10
  }
]
```

### Wipe Transition

```json
[
  {
    "type": "VIDEO",
    "id": "intro",
    "src": "https://cdn.pixabay.com/video/2025/06/03/283533_large.mp4",
    "resize": "cover",
    "enterBegin": 0,
    "exitEnd": 5,
    "transition": "wiperight",
    "transitionId": "main",
    "transitionDuration": 1
  },
  {
    "type": "VIDEO",
    "id": "main",
    "src": "https://cdn.pixabay.com/video/2025/06/09/284566_large.mp4",
    "resize": "cover",
    "enterBegin": 5,
    "exitEnd": 10
  }
]
```

## Best Practices

- Keep transition durations between `0.3` and `2` seconds for most videos.
- Use clear IDs such as `intro`, `scene-2`, and `outro`.
- Keep transition chains simple before adding many simultaneous overlays.
- Use `volume: 0` on scene clips when a separate narration or music track should drive the audio.

## Related Pages

- [Video Elements](./video-elements.md)
- [Animation Effects](./animations.md)
- [Audio Elements](./audio-elements.md)
- [XFadeEffect](./properties/xfade-effects.md)
