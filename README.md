# Zvid Plugin

This repo-local Codex plugin packages the Zvid documentation and render validator guidance into reusable skills.

## Skills

- `zvid-video-json`: create, repair, validate, explain, and generate schemas for Zvid render payload JSON.
- `zvid-api`: work with the hosted Zvid API, including authentication, credits, render submission, and job polling.

## References

- `references/source-docs/`: copied from `zvid-docs/docs`.
- `references/source-validation/validation.js`: copied from `orch/middleware/validation.js`.
- `references/schema/validation-authority.md`: notes that render JSON Schema output must follow `validation.js`.

The plugin is not registered in a marketplace file yet.
