# Layer conventions (binding for every component)

Stack: Nuxt 4.6, Vue 3 `<script setup lang="ts">`, scoped plain CSS (no Tailwind dependency), no runtime UI deps.
Source of truth for visuals: the mockups in `MOCKUPS_DIR` (`*.dc.html`). Match them faithfully.

## Files
- Components: `app/components/<Group>/Mi<Name>.vue`. `pathPrefix:false`, so the tag is `<MiName>`. File name == component name, always prefixed `Mi`.
- Composables: `app/composables/useMi<Name>.ts`. Utils: `app/utils/mi<Name>.ts` (auto-imported).
- Each agent writes ONLY its own files plus its playground page `.playground/pages/<group>.vue` and its doc `docs/<group>.md`. Never edit shared files (mi.css, color.ts, nuxt.config.ts, plugins, useMiTheme.ts). If you need a shared change, say so in your report.

## Tokens
Mockup CSS var `--x` becomes `--mi-x` (`--label` -> `--mi-label`, `--card` -> `--mi-card`, `--sh2` -> `--mi-sh2`). Brand: `--mi-p`, `--mi-p-on`, `--mi-p-hover`, `--mi-p-tint`, `--mi-p-tint2`, `--mi-p-text` and the same for `--mi-s*`. Motion: `--mi-ease`, `--mi-spring`, `--mi-dur-1..4`. Never hardcode brand colors; light/dark comes only from tokens (no `.dark` branches in components). Root element of each component carries class `mi` is NOT needed; global `.mi` wrapper is on the app root, but components must still render correctly standalone: set `font-family: var(--mi-font)` where text appears.

## Performance and 60fps (hard requirements)
- Animate ONLY `transform` and `opacity` (plus `clip-path`/`filter` sparingly). Never animate width/height/top/left/margin/box-shadow/border. For expand/collapse use `grid-template-rows: 0fr -> 1fr` or transform tricks.
- Use `will-change` only during an active animation. Use `contain: layout paint` / `content-visibility: auto` for long lists and heavy boards.
- Springs via `var(--mi-spring)` timing (CSS `linear()`), not JS rAF loops. If JS animation is unavoidable (drag, sliders, swipe), use pointer events + a single rAF writing `transform` via CSS variables; passive listeners; no layout reads in the loop.
- No reactive state updated per pointermove beyond what is rendered; throttle with rAF.
- Respect `prefers-reduced-motion` (tokens already collapse durations).
- Charts: SVG with no per-frame re-render; hover handled with one delegated pointer handler; transitions on transform/opacity/stroke-dashoffset only.
- SSR safe: no `window`/`document` at setup; use `onMounted` / `import.meta.client`. Teleported overlays use `<Teleport to="body">` inside `<ClientOnly>` when needed.
- No new runtime dependencies.

## API
- v-model via `defineModel`. Props typed with `defineProps<{...}>()`, sensible defaults, emits typed. Slots for content. `attrs` fall through to the root.
- Full a11y: correct roles, labels, keyboard support (arrows/Home/End/Escape/Tab trapping for overlays), focus-visible ring, `aria-*` states, contrast preserved from tokens.
- Export TypeScript types from the component file or `app/utils/mi<Name>.ts`.

## Deliverables per group
1. Components covering EVERY element shown in the mockup board (including each state, size and variant).
2. `.playground/pages/<group>.vue` showing all of them (this page is also the Playwright check target; wrap content in `<div class="mi">`).
3. `docs/<group>.md`: component list with props/slots/events table.
4. A vitest spec per component group in `tests/<group>.spec.ts` mounting with `@vue/test-utils` (happy-dom) checking render, v-model, a11y roles, keyboard.

## Testability rule
Components must import Vue APIs explicitly (`import { computed, ref } from 'vue'`) and avoid Nuxt-only auto-imports in component files, so they mount under plain vitest. Import sibling layer components and utils explicitly with the `~/` alias (`import MiIcon from '~/components/Base/MiIcon.vue'`, `import { miTone } from '~/utils/color'`). Nuxt-only needs (e.g. `useMiTheme`) go in composables, not leaf components.
