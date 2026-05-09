---
sidebar_position: 9
---

# Subtitle

The root-level `subtitle` property adds word-timed captions to a video. Zvid converts the subtitle data and applies it during rendering.

## Interface

```typescript
interface Subtitle {
  captions: Caption[];
  styles?: SubtitleStyles;
}
```

## Common Property Reference

| Property   | Quick notes                              | Full reference                                      |
| ---------- | ---------------------------------------- | --------------------------------------------------- |
| `captions` | Timed subtitle segments.                 | [`Caption`](./properties/caption.md)                |
| `words`    | Word-level timing inside each caption.   | [`Word`](./properties/word.md)                      |
| `styles`   | Typography, placement, and display mode. | [`SubtitleStyles`](./properties/subtitle-styles.md) |

## Required Fields

| Property            | Required | Notes                                 |
| ------------------- | -------- | ------------------------------------- |
| `subtitle.captions` | Yes      | At least one caption.                 |
| `caption.start`     | Yes      | Caption start time.                   |
| `caption.end`       | Yes      | Caption end time.                     |
| `caption.text`      | Yes      | API validation requires caption text. |
| `caption.words`     | Yes      | At least one word.                    |
| `word.start`        | Yes      | Word start time.                      |
| `word.end`          | Yes      | Word end time.                        |
| `word.text`         | Yes      | Word text.                            |

## Style Fields

See [`SubtitleStyles`](./properties/subtitle-styles.md) for all style fields, defaults, and allowed values.

## Display Modes

- `normal`: show the full caption text.
- `one-word`: show one word at a time.
- `karaoke`: show the caption and highlight the active word.
- `progressive`: reveal words progressively.

## Examples

### Simple Captions

```json
{
  "subtitle": {
    "captions": [
      {
        "start": 0.5,
        "end": 2,
        "text": "Welcome to our video",
        "words": [
          { "start": 0.5, "end": 0.9, "text": "Welcome" },
          { "start": 0.9, "end": 1.1, "text": "to" },
          { "start": 1.1, "end": 1.4, "text": "our" },
          { "start": 1.4, "end": 2, "text": "video" }
        ]
      }
    ]
  }
}
```

### Karaoke Captions

```json
{
  "subtitle": {
    "captions": [
      {
        "start": 0,
        "end": 3,
        "text": "Let's create amazing videos",
        "words": [
          { "start": 0, "end": 0.5, "text": "Let's" },
          { "start": 0.5, "end": 1, "text": "create" },
          { "start": 1, "end": 1.5, "text": "amazing" },
          { "start": 1.5, "end": 3, "text": "videos" }
        ]
      }
    ],
    "styles": {
      "color": "#FFFFFF",
      "background": "#000000CC",
      "fontSize": 50,
      "fontFamily": "Montserrat",
      "isBold": true,
      "position": "center-center",
      "mode": "karaoke",
      "activeWord": {
        "color": "#FFD700"
      }
    }
  }
}
```

### Top Positioned Captions

```json
{
  "subtitle": {
    "captions": [
      {
        "start": 0,
        "end": 5,
        "text": "This appears near the top",
        "words": [
          { "start": 0, "end": 1, "text": "This" },
          { "start": 1, "end": 2, "text": "appears" },
          { "start": 2, "end": 3, "text": "near" },
          { "start": 3, "end": 4, "text": "the" },
          { "start": 4, "end": 5, "text": "top" }
        ]
      }
    ],
    "styles": {
      "color": "#000000",
      "background": "#FFFFFFEE",
      "fontSize": 40,
      "fontFamily": "Inter",
      "position": "top-left",
      "mode": "normal"
    }
  }
}
```

## Related Pages

- [JSON Structure](../structure.md)
- [Video Elements](./video-elements.md)
- [Caption](./properties/caption.md)
- [SubtitleStyles](./properties/subtitle-styles.md)
