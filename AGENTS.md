# Using the Mica UI layer (for AI assistants)

Read order, cheapest first:
1. `llms.txt` (about 3k tokens): every component with a one-line summary, grouped. Pick from here.
2. `docs/api/<MiName>.md` (about 200 tokens each): props with types and defaults, slots, emits. Read only the ones you use.
3. `components.json`: same data as JSON, for tooling.
4. `docs/blocks.md`: every ready-made block (application section built with Mi components) with its path and a one-line summary. Need a whole dashboard, table, form or auth page? Pick one here and read only that block's `.vue` file.

Never read component `.vue` sources to learn an API; the files above are generated from them and checked in CI (`pnpm docs:check`).

Rules
- Components are auto-registered: write `<MiButton>`, no imports.
- Colors: only CSS vars `--mi-*` (brand `--mi-p*`/`--mi-s*`). Never hardcode hex; light/dark is automatic.
- Theme: `useMiTheme()` gives `mode`, `primary`, `secondary`, `setMode`, `setPrimary`, `setSecondary`.
- Styling: `mi:` utility classes (`mi:flex mi:gap-3 mi:@[560px]:grid-cols-2 mi:bg-card`), generated at build time from the classes the sources use. Reference: `docs/atomic.md`. Write whole class names, never concatenated.
- Animate only `transform`/`opacity` in your own code too (60fps rule).
- v-model components are marked `[v-model]` in `llms.txt`.
