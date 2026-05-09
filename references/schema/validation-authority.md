# Validation Authority

This plugin was created from `zvid-docs/docs` and the live orchestrator validator at `orch/middleware/validation.js`.

For render payload JSON and JSON Schema work, the validator is the authority. The docs are useful for examples and human-facing explanations, but schema output must match the Joi logic in `validation.js`.

## Files

- Live repo source: `orch/middleware/validation.js`
- Bundled snapshot: `references/source-validation/validation.js`
- Public docs snapshot: `references/source-docs/`

## Schema Target

The render API validates request bodies through `validateRenderJob`.

The effective request shape is:

```json
{
  "payload": {},
  "jobId": "optional uuid",
  "clientKey": "optional string"
}
```

`payload` is generated dynamically by `createProjectSchema(limits)`, where `limits` comes from the authenticated user's plan. This means maximum duration, output resolution, input resolution, and element counts are plan-specific.

## Plan-Dependent Values

If concrete plan limits are unavailable, the legacy static schema uses these defaults:

```json
{
  "maxImagesCount": 30,
  "maxVideosCount": 15,
  "maxGifsCount": 10,
  "maxVisualElements": 200,
  "maxAudioElements": 100,
  "maxCaptionElements": 1000,
  "maxDuration": 600,
  "maxInputResolution": 3840,
  "maxOutputResolution": 1920,
  "planName": "Default"
}
```

Use those only as a fallback or example. A production schema should be parameterized or generated with real plan limits.

## JSON Schema Caveats

Joi validation uses `stripUnknown: true` and `convert: true`. A strict JSON Schema for the post-validation shape should usually use `additionalProperties: false`, but the server may strip unknown fields instead of rejecting them in every case.

Some behavior is custom procedural validation and should be represented with notes or supplemental checks:

- Manual visual validation by element type.
- Per-plan element count limits for images, videos, GIFs, audio tracks, and captions.
- Cross-field timing checks such as `enterEnd >= enterBegin`, `exitEnd >= exitBegin`, `exit >= enter`, and `audioEnd >= audioBegin`.
- `resolution !== "custom"` causes validated `width` and `height` to be removed.
- Safe text, safe HTML, safe CSS, safe remote URL, and safe SVG checks use custom code.

## Practical Rule

When asked for "the Zvid JSON schema", generate the schema from the render job validator, not from the Docusaurus OpenAPI MDX or narrative docs alone.
