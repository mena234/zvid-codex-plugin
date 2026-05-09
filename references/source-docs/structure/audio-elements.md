---
source_url: "https://docs.zvid.io/docs/structure/audio-elements"
sidebar_position: 6
---

# Audio Elements

`audios` adds background music, narration, and sound effects to the project. Audio items are not visual elements and do not use `type`.

## Interface

```typescript
interface AudioItem {
  src: string;
  enter?: number;
  exit?: number;
  volume?: number;
  speed?: number;
  audioBegin?: number;
  audioEnd?: number;
  audioDuration?: number;
}
```

## Required Fields

| Property | Type     | Notes                               |
| -------- | -------- | ----------------------------------- |
| `src`    | `string` | Remote `http` or `https` audio URL. |

## Properties

| Property        | Default                    | Range/notes                         |
| --------------- | -------------------------- | ----------------------------------- |
| `enter`         | `0`                        | Start time on the project timeline. |
| `exit`          | `project.duration`         | End time on the project timeline.   |
| `audioBegin`    | `0`                        | Start point in source audio.        |
| `audioEnd`      | project or source duration | End point in source audio.          |
| `audioDuration` | project or source duration | Source duration hint.               |
| `volume`        | `1`                        | `0` to `1`.                         |
| `speed`         | `1`                        | `0.1` to `10`.                      |

## Examples

### Background Music

```json
{
  "src": "https://cdn.pixabay.com/audio/2025/03/19/audio_56ae1dae5f.mp3",
  "volume": 0.3,
  "enter": 0,
  "exit": 10
}
```

### Sound Effect

```json
{
  "src": "https://cdn.pixabay.com/audio/2025/01/13/audio_c2af364af2.mp3",
  "volume": 0.8,
  "enter": 2,
  "exit": 4
}
```

### Source Segment

```json
{
  "src": "https://cdn.pixabay.com/audio/2025/04/21/audio_ed6f0ed574.mp3",
  "audioBegin": 10,
  "audioEnd": 20,
  "volume": 0.5,
  "enter": 0,
  "exit": 10
}
```

## Related Pages

- [Video Elements](./video-elements.md)
- [Animation Effects](./animations.md)
- [Transitions](./transitions.md)
