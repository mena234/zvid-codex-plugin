---
sidebar_position: 6
---

# Frequently Asked Questions

Common questions and solutions for using Zvid.

## Project Configuration

### What video dimensions should I use?

Use resolution presets for common formats, or set `resolution: "custom"` with explicit dimensions.

```javascript
const project = {
  resolution: "instagram-post", // 1080 x 1080
  // resolution: "youtube-short", // 1080 x 1920
  // resolution: "tiktok", // 1080 x 1920
  // resolution: "full-hd", // 1920 x 1080
};
```

```javascript
const customProject = {
  resolution: "custom",
  width: 1920,
  height: 1080,
};
```

### When should I use presets vs custom dimensions?

Use presets for standard social and HD formats. Use custom dimensions for non-standard aspect ratios or client-specific output sizes. Output dimensions are still limited by your plan.

### What frame rate should I use?

- `30`: standard for most content.
- `60`: smoother motion, with larger files and more render work.
- `24`: cinematic look.
- `25`: PAL-style projects.

The API accepts integer frame rates from `1` to `60`.

### Which output format should I choose?

The API currently accepts only:

- `mp4`: recommended default.
- `webm`: web-friendly output.
- `mov`: useful for Apple workflows.
- `avi`: legacy format.

```javascript
const project = {
  outputFormat: "mp4",
};
```

## Element Positioning

### How do I center elements?

Use `position: "center-center"` and provide dimensions when the element size is not obvious:

```javascript
{
  type: "TEXT",
  text: "Centered",
  width: 400,
  height: 100,
  position: "center-center"
}
```

### How do I size elements?

For media elements, either provide `width` and `height` or use `resize`.

- `resize: "contain"` keeps the full asset visible.
- `resize: "cover"` fills the target area and may crop the asset.

```javascript
{
  type: "IMAGE",
  src: "https://example.com/photo.jpg",
  width: 800,
  height: 450,
  resize: "cover"
}
```

## Timing and Animation

### How do timing properties work?

```javascript
{
  enterBegin: 2,
  enterEnd: 3,
  exitBegin: 7,
  exitEnd: 8
}
```

The element is invisible before `enterBegin`, animates in until `enterEnd`, stays visible until `exitBegin`, and animates out until `exitEnd`.

### Why are animations not showing?

Check that:

1. Animation names match the supported lowercase xfade names.
2. `enterEnd` is greater than `enterBegin` for enter animations.
3. `exitEnd` is greater than `exitBegin` for exit animations.
4. Timing values are inside the project duration and ordered correctly.

```javascript
{
  enterAnimation: "fade",
  enterBegin: 0,
  enterEnd: 1
}
```

## Media Files

### What media formats are supported?

Input assets are remote HTTP/HTTPS URLs. Zvid downloads and checks assets before rendering. FFmpeg-compatible media generally works, subject to plan and processing limits.

Common input examples:

- Images: JPEG, PNG, WebP
- Videos: MP4, MOV, WebM, MKV
- Audio: MP3, WAV, AAC, OGG, M4A

Output formats are limited to `mp4`, `mov`, `avi`, and `webm`.

### Are there hard limits?

Yes. Limits are plan-dependent and enforced by API validation and the render pipeline, including duration, output resolution, input resolution, media size, and element counts.

## Audio

### What volume values are allowed?

The API accepts `volume` values from `0` to `1` for both audio tracks and video element audio.

```javascript
{
  volume: 0,   // muted
  volume: 0.5, // half volume
  volume: 1    // full volume
}
```

## Text and Fonts

### Why is my custom font not displaying?

For text and subtitles, use an exact Google Fonts family name such as `Poppins`, `Montserrat`, or `Roboto`.

```javascript
{
  style: {
    fontFamily: "Poppins";
  }
}
```

### Why is my HTML text rejected?

The hosted API accepts only a safe HTML subset for `TEXT.html`. Use tags such as `div`, `span`, `p`, `br`, `strong`, `b`, `em`, `i`, `u`, `s`, `ul`, `ol`, and `li`. Avoid script/style tags, event handlers, external CSS URLs, and unsupported heading tags.

## Getting Help

- Check the [JSON Structure Overview](./structure.md).
- Review the [Getting Started](./getting-started.md) guide.
- Contact [help@zvid.io](mailto:help@zvid.io).
