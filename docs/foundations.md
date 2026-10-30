# Foundations (`app/components/Base`)

Playground: `/` (`.playground/pages/index.vue`). All components render from `--mi-*` tokens, so brand colors (`--mi-p*`, `--mi-s*`) follow `useMiTheme` at runtime.

## MiIcon
Inline-SVG, SF-Symbols-like stroke icons on a 24 px grid. `app/utils/miIcons.ts` exports the `miIcons` map, the `MiIconName` type, `miIconNames`, and one constant per icon (`miiHome`, ...) for tree-shaking: `<MiIcon :svg="miiHome" />`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `MiIconName` | | Icon from the built-in map |
| `svg` | `string` | | Raw inner markup, trusted static strings only; wins over `name` |
| `size` | `number \| string` | `20` | |
| `weight` | `number \| string` | `1.9` | Stroke width |
| `label` | `string` | | Sets `role="img"` + `aria-label`; otherwise `aria-hidden` |
| `filled` | `boolean` | `false` | Fill with `currentColor` |
| `spin` | `boolean` | `false` | Transform-only rotation (`spinner` steps in 8 ticks) |

## MiText
Type scale from the Foundations board. Variants: `largeTitle`, `title1`, `title2`, `title3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption`, `caption2`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `MiTextVariant` | `body` | Titles render `h1`-`h4`, the rest `p` |
| `as` | `string` | | Override the element |
| `tone` | `inherit \| label \| label2 \| label3 \| primary \| secondary \| red \| orange \| green` | `inherit` | |
| `weight` | `regular \| medium \| semibold \| bold` | | |
| `align` | `start \| center \| end` | | |
| `lines` | `number` | | Line clamp with ellipsis |
| `tabular`, `balance` | `boolean` | `false` | |

Slot: default.

## MiSurface
| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `card \| elevated \| material` | `card` | |
| `material` | `ultra-thin \| thin \| regular \| thick` | `regular` | Blur 24 + saturate 180 on one static background layer |
| `radius` | `xs \| sm \| md \| lg \| xl \| capsule` | `lg` | 6/10/14/20/28/999 |
| `padding` | `none \| sm \| md \| lg` | `none` | 0/12/18/24 |
| `elevation` | `0 \| 1 \| 2 \| 3` | by variant | `--mi-sh1..3` |
| `as` | `string` | `div` | |

Slot: default.

## MiThemeSwitcher
Light / Dark / System segmented radiogroup bound to `useMiTheme().mode`. Arrow, Home and End keys, roving tabindex, sliding thumb (transform only).

| Prop | Type | Default |
|---|---|---|
| `label` | `string` | `Appearance` |
| `iconOnly` | `boolean` | `false` |
| `labels` | `Partial<Record<MiMode, string>>` | |

Event: `change(mode)`.

## MiColorPicker
Hex input (commit on Enter or blur, Escape reverts, shorthand `#abc` expands) plus preset swatches (radiogroup, arrow keys). Writes through `setPrimary` / `setSecondary`.

| Prop | Type | Default |
|---|---|---|
| `target` | `primary \| secondary` | `primary` |
| `label` | `string` | target name |
| `presets` | `string[]` | kit presets for the target |

Event: `change(hex)`.

## MiLogo
The Mica logo ("Full stop" direction): a lowercase `mica` wordmark drawn as SVG geometry (no webfont), closed by a full stop in the brand color. The dot uses `--mi-p`, so it follows `useMiTheme().setPrimary()` and every app gets the logo in its own colors.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'wordmark' \| 'short' \| 'dot'` | `wordmark` | `mica.`, `m.` for tight spaces and app icons, or the dot alone |
| `size` | `number \| string` | `24` | Height in px or a CSS length; width follows the aspect ratio |
| `tone` | `'label' \| 'inherit' \| 'on-primary'` | `label` | Letter color; `on-primary` for use on a `--mi-p` fill |
| `dot` | `'primary' \| 'secondary' \| 'inherit'` | `primary` | `inherit` gives the monochrome logo |
| `label` | `string` | `Mica` | Accessible name (`role="img"`) |
| `decorative` | `boolean` | `false` | `aria-hidden` when the name is visible nearby |
| `pulse` | `boolean` | `false` | Breathing dot for loading states, transform/opacity only, off under reduced motion |

Clear space around the logo: one dot diameter on every side. On a `--mi-p` fill use `tone="on-primary"` with `dot="inherit"`; `dot="secondary"` only works when the secondary color contrasts with the primary.

## MiColorRamp
Nine-step ramp (50-800, 500 = base) from `miRamp(hex)` in `app/utils/miRamp.ts`.

| Prop | Type | Default |
|---|---|---|
| `color` | `string` | required |
| `labels` | `boolean` | `true` |
| `height` | `number` | `40` |
| `label` | `string` | `Color ramp` |

## Primitives (shadcn parity)

| Component | Props | Notes |
|---|---|---|
| `MiSeparator` | `orientation` (`horizontal`/`vertical`, default `horizontal`), `decorative` (default `true`) | `role="none"` when decorative, else `role="separator"` |
| `MiKbd` / `MiKbdGroup` | none | Keycap; `MiKbdGroup` lays several keys in a row |
| `MiLabel` | `for`, `required`, `disabled` | Native `<label>`; `dir` falls through; asterisk is `aria-hidden` |
| `MiAspectRatio` | `ratio` (number, required) | CSS `aspect-ratio`; img/video children are covered |
| `MiTypography` | `variant` (`h1`-`h4`, `p`, `blockquote`, `ul`, `ol`, `table`, `code`, `lead`, `large`, `small`, `muted`), `as` | Prose styles, logical (RTL-safe) borders and padding |
| `MiDirection` | `direction` (`ltr`/`rtl`, default `ltr`) | Sets `dir` on a `display:contents` wrapper and provides it; read it with `useMiDirection()` (exported from the component file) |
