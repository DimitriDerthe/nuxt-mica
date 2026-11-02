# Preline extras

Components added after the Preline gap analysis: two charts, a copy button, device frames, confetti and a rich-text editor. All follow `docs/CONVENTIONS.md` (tokens `--mi-*`, `transform` / `opacity` animations only, SSR safe, no dependencies). Playground: `/preline-extras`. Maps are intentionally out of scope (they need geodata).

## MiDonutChart (Charts)

Donut or pie chart. Hover or arrow keys highlight a segment; the legend, the center and the chart share that highlight. A chart/table toggle gives an accessible data table.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `data` | `{ label, value, color? }[]` | | negative / non-finite values count as 0, zero values get no segment |
| `variant` | `'donut' \| 'pie'` | `'donut'` | |
| `title`, `subtitle` | `string` | | card header |
| `card` | `boolean` | `true` | elevated surface |
| `size` | `number` | `240` | max width in px, shrinks with the container |
| `thickness` | `number` | `30` | ring width on a 220 grid (donut) |
| `gap` | `number` | `3` | px between segments |
| `valueLabels` | `'none' \| 'percent' \| 'value'` | `'none'` | drawn on segments of 7 % or more |
| `unit` | `string` | `''` | value suffix |
| `legend`, `toggle`, `animate` | `boolean` | `true` | |
| `totalLabel` | `string` | `'Total'` | caption under the center total |
| `categoryLabel`, `valueLabel`, `shareLabel`, `chartLabel`, `tableLabel` | `string` | English | table / toggle text |
| `formatValue` | `(value, datum) => string` | | |
| `ariaLabel` | `string` | generated | |
| `v-model:view` | `'chart' \| 'table'` | `'chart'` | |
| `v-model:active` | `number` | `-1` | highlighted segment |

Slot `center` (donut): `{ active, total, totalText }`. Event `hover(index)`. Palette: shared chart palette in order (primary, secondary, fixed hues).

## MiScatterChart (Charts)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `series` | `{ name, points: { x, y, r? }[], color? }[]` | | `r` turns it into a bubble chart (area scaled) |
| `title`, `subtitle`, `card` | | | as other charts |
| `xLabel`, `yLabel` | `string` | | axis titles, also table headers |
| `xUnit`, `yUnit` | `string` | `''` | |
| `sizeLabel` | `string` | `'Size'` | |
| `ticks` | `number` | `5` | |
| `height` | `number` | `300` | |
| `dotSize`, `maxRadius` | `number` | `5`, `22` | |
| `toolbar`, `toggle`, `animate` | `boolean` | `true` | |
| `formatValue` | `(value, 'x' \| 'y' \| 'r', series) => string` | | |
| `v-model:view` | `'chart' \| 'table'` | `'chart'` | |

Event `hover({ series, index } \| null)`. Keyboard: arrows read points left to right, Home / End, Escape clears.

## MiCopyButton (Buttons)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | | ignored when `getValue` is set |
| `getValue` | `() => string \| Promise<string>` | | evaluated at click time |
| `label`, `copiedLabel` | `string` | `'Copy'`, `'Copied'` | |
| `timeout` | `number` | `1800` | ms the confirmation stays |
| `variant` | `'tinted' \| 'outline' \| 'ghost'` | `'tinted'` | |
| `iconOnly` | `boolean` | `false` | keeps `aria-label` |
| `disabled` | `boolean` | `false` | |

Events `copy(text)`, `error(error)`. Uses `navigator.clipboard`, falls back to a hidden textarea and `execCommand('copy')`. A polite live region announces the confirmation.

## MiDevice (Base)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `device` | `'phone' \| 'tablet' \| 'laptop' \| 'browser'` | `'phone'` | |
| `orientation` | `'portrait' \| 'landscape'` | `'portrait'` | phone and tablet |
| `url` | `string` | | browser address bar (protocol hidden) |
| `tone` | `'auto' \| 'dark' \| 'light'` | `'auto'` | bezel |
| `maxWidth` | `number` | per device | px |
| `label` | `string` | | makes the frame a labelled group |

Default slot: the screen content. Everything is sized in container query units, so the frame scales with its container.

## MiConfetti + useMiConfetti (Feedback)

Mount `<MiConfetti />` once (prop `zIndex`, default 9999), then:

```ts
const { fire } = useMiConfetti()
fire({ origin: { x: 0.5, y: 0.6 }, count: 120 }) // or origin: element
```

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `origin` | `{ x, y }` (0..1) \| `HTMLElement` | `{ 0.5, 0.7 }` | element center |
| `count` | `number` | `80` | max 500 |
| `spread` | `number` | `70` | degrees, 360 for a circle |
| `angle` | `number` | `-90` | degrees, up |
| `speed` | `number` | `720` | px/s |
| `colors` | `string[]` | brand `--mi-p` / `--mi-s` + extras | |
| `duration` | `number` | `2600` | ms |
| `gravity` | `number` | `900` | px/s² |

`fire()` returns `false` (and draws nothing) on the server, without a mounted host, or under `prefers-reduced-motion`. One rAF loop runs while particles live. The engine is in `app/utils/miConfetti.ts` (`miCreateParticles`, `miStepParticle`, `miUpdateParticles`, `miParticleAlpha`, `miParticleFlip`, `miOriginToPx`).

## MiEditor (Inputs)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | sanitized HTML |
| `label` | `string` | `'Rich text editor'` | accessible name |
| `placeholder` | `string` | | |
| `readonly`, `disabled`, `invalid` | `boolean` | `false` | |
| `minHeight`, `maxHeight` | `number \| string` | `160`, none | px or CSS length |
| `toolbar` | `boolean` | `true` | |
| `pasteMode` | `'html' \| 'text'` | `'html'` | pasted content is always sanitized |
| `linkLabel` | `string` | `'Link address'` | |

Events `focus`, `blur`. Toolbar (roving tabindex, `aria-pressed` follows the selection): bold, italic, underline, strike, H2, H3, lists, quote, code, link, undo, redo, clear formatting. Shortcuts: Cmd/Ctrl + B, I, U, K.

Sanitizer (`app/utils/miSanitize.ts`, pure string processing): allows `p br strong em u s a ul ol li h2 h3 blockquote code pre`; `a[href]` only for `http:`, `https:`, `mailto:` (entity and whitespace obfuscation handled), all other attributes are removed, script / style / iframe / svg and similar are dropped with their content, `b i strike del div h1 h4-h6` are rewritten to allowed tags. Exports `miSanitizeHtml`, `miSafeUrl`, `miEscapeHtml`, `miTextToHtml`, `miHtmlToText`, `miIsEmptyHtml`. Formatting uses `document.execCommand`, guarded for SSR.
