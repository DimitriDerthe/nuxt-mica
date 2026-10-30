# Mica, a Nuxt UI layer

A Nuxt 4 layer shipping 82 SSR-safe UI components (buttons, controls, inputs, navigation, feedback, content, charts and foundations) built on a single set of `--mi-*` CSS tokens. Every component targets 60 fps: motion is limited to `transform` and `opacity`, enforced by a lint script and measured by a frame-time probe. Light and dark modes are built in, with a runtime-configurable brand color pair.

## Consume it

Mica is a native Nuxt layer. There is no npm package to publish or install: Nuxt fetches the layer from GitHub. In the consuming project's `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  // pin a release tag for reproducible builds
  extends: ['github:DimitriDerthe/nuxt-mica#v0.2.0'],
  // or follow main: 'github:DimitriDerthe/nuxt-mica'
  // or a local path: '../nuxt-mica'
})
```

For a private repository, set `GIGET_AUTH` to a GitHub token in the consuming project's environment.

Components are auto-imported with no path prefix (`<MiButton>`, `<MiTable>`, ...). The layer registers its stylesheet, theme plugin, composables and utils automatically. Component imports inside the layer are relative, so they do not depend on the consumer's `~` alias.

Wrap your app root in an element with the `mi` class so tokens and typography apply:

```vue
<div class="mi" style="min-height:100dvh;background:var(--mi-page);color:var(--mi-label)">
  <NuxtPage />
</div>
```

## Theming

`useMiTheme()` (auto-imported) returns `mode`, `primary`, `secondary`, `resolved`, `isDark`, `setMode`, `setPrimary`, `setSecondary`, `apply`.

- Modes: `'light' | 'dark' | 'system'`. Switching only flips `data-theme` on `<html>`.
- Cookies (1 year, `SameSite=Lax`): `mi-mode`, `mi-primary`, `mi-secondary`. They are read during SSR, so there is no theme flash; a blocking head script resolves `system` before first paint.
- Brand ramps: `--mi-p*` (primary) and `--mi-s*` (secondary) are generated from a hex and emitted once in `<head>` for both appearances.
- Other CSS variables: `--mi-page`, `--mi-card`, `--mi-label`, `--mi-label2`, `--mi-label3`, `--mi-sep`, `--mi-fill`..`--mi-fill4`, `--mi-field`, `--mi-mat`, `--mi-scrim`, status colors (`--mi-red`, `--mi-green`, `--mi-orange`, ...), radii (`--mi-radius-s|m|l|xl`), shadows (`--mi-sh1..3`), motion (`--mi-dur-1..4`, `--mi-ease`, `--mi-ease-in-out`, `--mi-spring`), `--mi-font`.
- Defaults via `runtimeConfig.public.mi`:

```ts
export default defineNuxtConfig({
  runtimeConfig: { public: { mi: { primary: '#0071E3', secondary: '#BF4800', mode: 'system' } } }
})
```

`<MiThemeSwitcher>` and `<MiColorPicker>` give a ready-made UI for the same API.

Other composables: `useMiToast()` (with `<MiToaster>`), `useMiInputPopup()`.

## Component index

| Group | Docs | Components |
|---|---|---|
| Foundations (`Base`) | [docs/foundations.md](docs/foundations.md) | MiColorPicker, MiColorRamp, MiIcon, MiSurface, MiText, MiThemeSwitcher |
| Buttons | [docs/buttons.md](docs/buttons.md) | MiButton, MiButtonGroup, MiIconButton, MiMenu, MiTextLink |
| Controls | [docs/controls.md](docs/controls.md) | MiCheckbox, MiCheckboxGroup, MiChip, MiRadio, MiRadioGroup, MiSegmented, MiSlider, MiStepper, MiSwatch, MiSwitch |
| Inputs | [docs/inputs.md](docs/inputs.md) | MiCalendar, MiCodeInput, MiDatePicker, MiField, MiFieldBox, MiForm, MiFormRow, MiInput, MiSearch, MiSelect, MiTagInput, MiTextarea |
| Navigation | [docs/navigation.md](docs/navigation.md) | MiBreadcrumb, MiLocalNav, MiNavBar, MiNavGlyph, MiPageControl, MiPagination, MiSidebar, MiSteps, MiTabBar, MiToolbar |
| Feedback | [docs/feedback.md](docs/feedback.md) | MiActionSheet, MiAlert, MiBadge, MiBanner, MiContextMenu, MiDialog, MiEmptyState, MiFbIcon, MiNotification, MiPopover, MiProgress, MiProgressRing, MiSheet, MiSkeleton, MiSpinner, MiToast, MiToaster, MiTooltip |
| Content | [docs/content.md](docs/content.md) | MiAccordion, MiAccordionItem, MiAvatar, MiAvatarGroup, MiCard, MiDetails, MiList, MiListItem, MiSwipeRow, MiTable |
| Charts | [docs/charts.md](docs/charts.md) | MiBarChart, MiChartCard, MiChartLegend, MiChartTable, MiHeatmap, MiLineChart, MiMeter, MiRings, MiSparkline, MiStackedBar, MiStatTile |

Binding rules for contributors: [docs/CONVENTIONS.md](docs/CONVENTIONS.md).

## AI-friendly docs

`llms.txt` lists every component in one line (about 3k tokens); `docs/api/<MiName>.md` gives the exact props, slots and emits of one component. Both are generated from the source (`pnpm docs:gen`, checked by `pnpm docs:check` and the test suite). Point your assistant at `AGENTS.md` (copy its rules into your project's `CLAUDE.md`/`AGENTS.md`).

## Performance guarantees

- Animations and transitions touch only `transform` and `opacity` (plus `filter`/`clip-path` where compositor-friendly). Never `width`, `height`, `top`/`left`, margins, paddings, `box-shadow`, `background` or `all`.
- Pointer-driven updates (drag, slider, sheet, swipe) are coalesced to one write per animation frame via `miOverlayRaf`.
- Brand colors are emitted once; a theme change does not recompute component styles.
- `node scripts/lint-motion.mjs [dir]` scans every component's `<style>` for transitions and keyframes on layout or paint properties and exits non-zero on any violation.
- `node scripts/fps.mjs /<page> [baseUrl]` loads a playground page at mobile (390), tablet (820) and desktop (1440) widths in light and dark, interacts with it, samples `requestAnimationFrame` deltas and long tasks, and reports PASS/FAIL with console errors and horizontal overflow.

## Testing and development

```bash
pnpm install                                # development only, consumers install nothing
pnpm dev                                   # playground on .playground
npx vitest run                             # unit tests (tests/*.spec.ts)
node scripts/lint-motion.mjs               # motion rules
node scripts/fps.mjs /buttons http://localhost:3100   # frame-time probe (dev server must run)
npx nuxt build .playground                 # production build
npx nuxt typecheck .playground             # vue-tsc over layer and playground
```

TypeScript is pinned to `~5.9` because `vue-tsc` 3.3 is not compatible with TypeScript 7. The playground lives in `.playground/` with one page per group.

## Website

`site/` is the Mica landing page. It is a separate Nuxt app that extends the layer exactly like a user project would, in English (default) and French via `@nuxtjs/i18n`.

```bash
pnpm site:dev        # http://localhost:3010 (French at /fr)
pnpm site:generate   # static output in site/.output/public, ready for an S3 bucket
```

The component explorer lives at `/components`: one page per component with a live preview, prop controls inferred from the generated manifest, a usage snippet and the full API. Each preview is a small file in `site/app/examples/<MiName>.vue`; see `site/app/examples/README.md` for the contract. A new component shows its API page right away and a placeholder until its example is added.

### GitHub Pages

```bash
pnpm pages:build     # site at /nuxt-mica/, playground demos at /nuxt-mica/demo/, output in pages-dist
pnpm pages:preview   # serve pages-dist locally (mount it under /nuxt-mica/ to test the sub-path)
```

`.github/workflows/pages.yml` runs the docs check, the tests and `pages:build`, then deploys `pages-dist` on every push to `main`. In the repository settings, set Pages > Source to "GitHub Actions". The sub-path is the repository name; for a user or organisation site (or a custom domain) run `node scripts/build-pages.mjs ""` to build for the root. The site also serves the AI docs: `/llms.txt`, `/docs/<group>.md` and `/docs/api/<MiName>.md`.

Set `NUXT_PUBLIC_I18N_BASE_URL` to the public origin (hreflang and canonical tags) and `NUXT_PUBLIC_SHOWCASE_URL` to where the playground showcase is served. The component catalog and the `llms.txt` excerpt on the page are read from the generated manifest at build time, so they never drift.
