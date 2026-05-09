---
sidebar_position: 1
---

# ResolutionPreset

`resolution` selects a preset canvas size. When `resolution` is not `custom`, preset dimensions override `width` and `height`.

```typescript
type ResolutionPreset =
  | "sd"
  | "hd"
  | "full-hd"
  | "squared"
  | "youtube-short"
  | "youtube-video"
  | "tiktok"
  | "instagram-reel"
  | "instagram-post"
  | "instagram-story"
  | "instagram-feed"
  | "twitter-landscape"
  | "twitter-portrait"
  | "twitter-square"
  | "facebook-video"
  | "facebook-story"
  | "facebook-post"
  | "snapchat"
  | "custom";
```

| Preset              | Dimensions         | Use case                |
| ------------------- | ------------------ | ----------------------- |
| `sd`                | 640 x 480          | Standard definition     |
| `hd`                | 1280 x 720         | HD landscape            |
| `full-hd`           | 1920 x 1080        | Full HD landscape       |
| `squared`           | 1080 x 1080        | Square format           |
| `youtube-short`     | 1080 x 1920        | YouTube Shorts          |
| `youtube-video`     | 1920 x 1080        | YouTube videos          |
| `tiktok`            | 1080 x 1920        | TikTok videos           |
| `instagram-reel`    | 1080 x 1920        | Instagram Reels         |
| `instagram-post`    | 1080 x 1080        | Instagram posts         |
| `instagram-story`   | 1080 x 1920        | Instagram Stories       |
| `instagram-feed`    | 1080 x 1080        | Instagram feed posts    |
| `twitter-landscape` | 1200 x 675         | Landscape social video  |
| `twitter-portrait`  | 1080 x 1350        | Portrait social video   |
| `twitter-square`    | 1080 x 1080        | Square social video     |
| `facebook-video`    | 1080 x 1920        | Facebook vertical video |
| `facebook-story`    | 1080 x 1920        | Facebook Stories        |
| `facebook-post`     | 1080 x 1080        | Facebook posts          |
| `snapchat`          | 1080 x 1920        | Snapchat content        |
| `custom`            | `width` x `height` | Custom dimensions       |

:::warning
The API accepts `snapchat`, but this preset is still being standardized. Prefer explicit `width` and `height` for Snapchat-sized renders when you need predictable dimensions.
:::

## Used By

- [JSON Structure Overview](../../structure.md)
