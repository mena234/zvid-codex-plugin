---
name: zvid-video-json
description: Create, repair, validate, or explain Zvid render payload JSON and JSON Schemas. Use when the user asks for Zvid project JSON, render payloads, schema generation, element properties, animations, subtitles, media timing, or anything that must match Zvid renderer validation.
---

# Zvid Video JSON

Use this skill for Zvid JSON-to-video authoring and schema work.

## Source Of Truth

When generating or checking a JSON Schema, `orch/middleware/validation.js` is authoritative. The public docs explain intent and examples, but the schema must apply to the Joi validation rules in that file.

Source order:

1. If working inside the Zvid repo, inspect the live `orch/middleware/validation.js` first.
2. Use this plugin's bundled snapshot at `../../references/source-validation/validation.js` only when the live file is unavailable.
3. Use docs under `../../references/source-docs/` for examples, descriptions, and API-facing wording.
4. If docs and validation disagree, follow `validation.js` and call out the discrepancy briefly.

## JSON Schema Requests

Default to the render job request body validated by `validateRenderJob`:

- Top-level object contains required `payload`, optional `jobId` UUID, and optional `clientKey`.
- `payload` is produced by `createProjectSchema(limits)`.
- Plan-dependent limits come from `planLimitsService.getUserPlanLimits(userId)`.
- If the user provides concrete plan limits, substitute them.
- If no plan limits are available and the user needs a concrete schema, use the legacy defaults in `projectSchema` and state that live API validation is plan-specific.
- If the user needs reusable output, prefer JSON Schema draft 2020-12 unless they request another draft.

Model these Joi behaviors explicitly:

- `stripUnknown: true` strips unknown fields during validation. For a strict JSON Schema, set `additionalProperties: false` for validated objects and mention that the server strips extras instead of necessarily rejecting all of them.
- `convert: true` lets Joi coerce some primitive inputs. JSON Schema cannot fully model that; produce the typed validated shape unless the user asks for an input-acceptance schema.
- Include cross-field validation notes that JSON Schema cannot express cleanly, especially timing order checks and resolution behavior.
- For `resolution` values other than `custom`, `validation.js` deletes `width` and `height` after validation.

## Core Payload Rules

Render payload fields include:

- `name`: optional string matching letters, numbers, spaces, `_`, and `-`, max 1000, default `unnamed`.
- `resolution`: one of the documented presets, including `custom`.
- `width` and `height`: integers from 1 through `limits.maxOutputResolution`, defaults 1280 and 720.
- `duration`: number from 0.1 through `limits.maxDuration`, default 10.
- `frameRate`: integer 1 through 60, default 30.
- `outputFormat`: `mp4`, `mov`, `avi`, or `webm`, default `mp4`.
- `backgroundColor`: hex `#rgb` or `#rrggbb`, default `#ffffff`.
- `visuals`: array of `IMAGE`, `VIDEO`, `GIF`, `SVG`, or `TEXT` elements.
- `audios`: array of audio items.
- `thumbnail`: safe remote `http` or `https` URL.
- `subtitle`: subtitle object validated by the nested subtitle schemas.

## Visual Elements

Common visual fields:

- `type`, `x`, `y`, `width`, `height`, `position`, `anchor`, `resize`, timing fields, `opacity`, `angle`, flips, `track`, `enterAnimation`, and `exitAnimation`.
- `type` is case-insensitive in validation, but emit canonical uppercase values in examples.
- Position and anchor values are `top-left`, `top-center`, `top-right`, `center-left`, `center-center`, `center-right`, `bottom-right`, `bottom-center`, `bottom-left`, and `custom`.
- `resize` is `contain` or `cover`.
- Animation names must be from `XFadeEffect`.

Element-specific rules:

- `IMAGE`: requires safe remote `src`; supports `cropParams`, `filter`, `chromaKey`, `zoom`, and `radius`.
- `VIDEO`: requires safe remote `src`; supports source timing, `volume`, `speed`, `frameRate`, `transition`, `transitionDuration`, `transitionId`, `id`, `hasAudio`, crop/filter/chroma key, and `zoom`.
- `GIF`: requires safe remote `src`; supports image-like crop/filter/chroma key and `zoom`.
- `SVG`: requires `svg` string that starts with `<svg`; forbids active content, event handlers, external refs, unsafe `url(...)`, excessive numbers, and dimensions over the SVG safety cap.
- `TEXT`: requires non-empty `text` or `html`; plain `text` rejects `<` and `>`; `html` only allows the safe inline subset from validation.

Remote media URLs must be `http` or `https`, max 2048 chars, no spaces/backslashes, no credentials, only ports 80 or 443 when a port is present, and no localhost, `.localhost`, `.local`, or private IP hosts.

## Audio And Subtitles

Audio items use safe remote `src` and optional timeline/source timing, `volume` 0 to 1, and `speed` 0.1 to 10. `exit` cannot be before `enter`, and `audioEnd` cannot be before `audioBegin`.

Subtitles require `captions`; each caption requires `start`, `end`, `text`, and at least one word. Each word requires `start`, `end`, and `text`. Styles include color/background with optional alpha, bold/italic, font size/family, transform, outline, position, margins, mode, and active word color.

## References

- JSON structure docs: `../../references/source-docs/structure.md`
- Element docs: `../../references/source-docs/structure/`
- Examples: `../../references/source-docs/examples/`
- Validation authority notes: `../../references/schema/validation-authority.md`
