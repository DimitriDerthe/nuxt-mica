# Application UI blocks

Ready-made application sections built only with Mica components, shown at `/blocks` on the site.
Families and categories are listed in `catalog.ts`; each category folder holds two to four blocks (distinct proposals, not restyles) and a `meta.json`.

```
site/app/blocks/<family>/<category>/<BlockName>.vue
site/app/blocks/<family>/<category>/meta.json
```

`meta.json` is an array, in display order:

```json
[{ "file": "BlockName", "title": { "en": "…", "fr": "…" }, "summary": { "en": "…", "fr": "…" }, "height": 420, "stage": "pad" }]
```

- `height`: minimum preview height in px (default 360). Give full-page layouts 560 to 720.
- `stage`: `pad` (default) shows the block on the dotted stage; `bleed` frames full-page layouts (app shells, auth pages, chat workspaces) edge to edge with a rounded border.

## Rules for every block

- **Mica first.** Build with `Mi*` components (see `llms.txt`, then `docs/api/<MiName>.md` for the ones you use). Write custom markup only for what no component covers (layout, decorative art, a bespoke card shell).
- **Self-contained and copy-pasteable.** One SFC, `<script setup lang="ts">`, styled with `mi:` utility classes (`docs/atomic.md`), a scoped `<style>` only for what they cannot express (keyframes, `:deep()`), sample data inline in the script. Import Vue APIs explicitly (`import { ref } from 'vue'`). No external images, fonts or network calls, no new dependencies. Avatars use `MiAvatar` initials; imagery is drawn with CSS gradients or inline SVG built from tokens.
- **Container queries, not media queries.** The root element sets `mi:@container`; layout switches with `mi:@[560px]:…` (or `@container (min-width: …)` in scoped CSS). An element cannot query itself: rules inside `@container` must target descendants of the root, never the root (put the layout on an inner wrapper). The block must look right from 360px to 1200px of container width: mobile-first, no horizontal scroll (wide tables scroll inside their own wrapper), no overlapping elements.
- **Tokens only.** Colors come from `--mi-*` vars (`--mi-p*`, `--mi-s*`, neutrals, status colors). Never a hex value. `color-mix(in srgb, var(--mi-p) 20%, transparent)` is fine. Light and dark must both work with no `.dark` branch.
- **60fps.** Animate only `transform` and `opacity`. Progress fills use `transform: scaleX()`, not width. No rAF loops for decoration, no layout reads in handlers.
- **Accessible.** Real headings (`h2`/`h3` inside the block), labelled controls, buttons that are buttons, `aria-*` for meters and live regions, visible focus. Unique ids: prefix with the block name.
- **Overlays are shown open, in place.** Modals, drawers, sheets, popovers and menus render with `inline` (MiDialog, MiDrawer, MiSheet, MiActionSheet, MiPopover, MiContextMenu support it) on a faux backdrop inside the block, so the preview shows them without a click. A trigger that opens the real overlay is a welcome extra.
- **Working interactions.** Tabs switch, filters filter, toggles toggle, forms validate. Keep state local with `ref`/`computed`.
- **English copy**, realistic and specific (no lorem ipsum, no "John Doe", no "Acme"). Titles and summaries in `meta.json` are given in English and French.
- **Original design.** Do not copy markup or layouts from other UI kits. Each block should carry one distinctive idea (a data story, a clever interaction, an unusual but useful layout) while staying calm and premium: generous spacing, clear hierarchy, restrained color, brand color as the accent.

`analytics/kpi-cards/KpiPulseBoard.vue` is the reference block.
