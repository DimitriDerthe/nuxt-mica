# Buttons

Components: `MiButton`, `MiIconButton`, `MiButtonGroup`, `MiMenu`, `MiTextLink`. Playground: `/buttons`.
Types live in `app/utils/miButtons.ts` and `app/utils/miMenu.ts`. Brand colors come from `--mi-p*` / `--mi-s*`.

## MiButton

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `filled \| tinted \| gray \| plain \| bordered \| destructive` | `filled` | |
| `brand` | `primary \| secondary` | `primary` | Uses `--mi-p*` or `--mi-s*` |
| `size` | `mini \| small \| regular \| large \| capsule \| xlarge` | `regular` | 24 / 30 / 36 / 44 / 48 / 50 px |
| `loading` | `boolean` | `false` | Spinner, `aria-busy`, clicks ignored |
| `disabled` | `boolean` | `false` | |
| `block` | `boolean` | `false` | Full width (use with `size="xlarge"` for the block style) |
| `soft` | `boolean` | `false` | Destructive only: gray background, red text |
| `href` | `string` | | Renders an `<a>` |
| `type` | `button \| submit \| reset` | `button` | |
| `pressed` | `boolean` | | Sets `aria-pressed` |
| `state` | `rest \| hover \| focus` | `rest` | Forces a look (docs, visual tests) |

Slots: `default`, `leading`, `trailing`. Events: `click`.

## MiIconButton

| Prop | Type | Default |
| --- | --- | --- |
| `label` (required) | `string` | Accessible name |
| `variant` | `filled \| tinted \| gray \| plain` | `filled` |
| `brand` | `primary \| secondary` | `primary` |
| `size` | `large (44) \| regular (36) \| small (30) \| toolbar (36x32)` | `large` |
| `shape` | `circle \| rounded` | circle, rounded for toolbar |
| `pressed` | `boolean` | Toggle look + `aria-pressed` |
| `disabled`, `type`, `state` | | |

Slot: `default` (icon or text). Event: `click`. Icon size can be overridden with `--mi-icon`.

## MiButtonGroup

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `attached \| segmented \| split` | `attached` | |
| `label` (required) | `string` | | `aria-label` of the group |
| `options` | `MiSegmentOption[]` | | Segmented only |
| `v-model` | `string \| number` | | Segmented selection |

Slots: `default` (attached/split children), `option` (`{ option, selected }`, segmented icon or label). Events: `change`, `update:modelValue`. Segmented supports Left/Right/Home/End focus movement.

## MiMenu

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `MiMenuItem[]` | | `value`, `label`, `shortcut`, `disabled`, `destructive`, `checked`, `separator`, `heading` |
| `variant` | `popup \| pulldown` | `pulldown` | popup = listbox showing the selected label |
| `label` | `string` | | Trigger text |
| `ariaLabel` | `string` | | |
| `placement` | `bottom-start \| bottom-end \| top-start \| top-end` | `bottom-start` | Flips and clamps to the viewport |
| `offset` | `number` | `6` | |
| `disabled` | `boolean` | | |
| `v-model` | `string \| number` | | Selected value |
| `v-model:open` | `boolean` | `false` | |

Slots: `trigger` (`{ props, open }`, bind `props` on your own button), `icon` (`{ item }`), `item` (`{ item }`). Events: `select`.
Keyboard: Arrow Down/Up open, move (wraps); Home/End; typeahead; Enter/Space select; Escape closes and restores focus; Tab closes. The panel is teleported to `body`.

## MiTextLink

Props: `href` (default `#`), `brand`, `chevron` (default `true`). Slot: `default`.

## MiCopyButton

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

## Performance

Only `transform` and `opacity` are animated. Hover is an opacity overlay, press a scale, menu open a spring scale/fade, segmented thumb a scale/fade. Menu placement is measured once per open/scroll/resize (rAF throttled) and applied with one transform write. `will-change` is set only during menu enter/leave and on the active spinner.
