# Controls

Selection controls of the kit. All components follow `docs/CONVENTIONS.md`: brand colors come from `--mi-p*` / `--mi-s*`, light and dark from tokens, animations are `transform` / `opacity` only. Playground: `/controls`.

Shared helpers live in `app/utils/miControls.ts` (`MI_SWATCH_DEFAULTS`, `miSnap`, `miClamp`, `miRovingKey`, injection keys).

## MiSwitch

`role="switch"` toggle. 51x31 by default, 38x22 compact.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `boolean` | `false` | |
| `size` | `'regular' \| 'compact'` | `'regular'` | |
| `tone` | `'primary' \| 'secondary' \| 'success'` | `'primary'` | on color |
| `disabled` | `boolean` | `false` | 40 % opacity |
| `label` | `string` | | `aria-label` |

## MiStepper

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `number` | `0` | clamped to `min..max`, snapped to `step` |
| `variant` | `'default' \| 'field'` | `'default'` | plus/minus pill or desktop value box with stacked arrows |
| `min`, `max`, `step` | `number` | `0`, `100`, `1` | |
| `label` | `string` | | group name |
| `unit` | `string` | | suffix, e.g. `pt` |
| `showValue` | `boolean` | `false` | `default` variant only; `field` always shows it |
| `incrementLabel`, `decrementLabel` | `string` | derived | button names |
| `disabled` | `boolean` | `false` | |

Press and hold repeats. Keyboard: Arrow keys, PageUp/PageDown (x10), Home/End on the group (`default`) or the `spinbutton` (`field`).

## MiCheckbox

| Prop / model | Type | Notes |
| --- | --- | --- |
| `v-model` | `boolean` | standalone checked state |
| `v-model:indeterminate` | `boolean` | mixed state (dash). Activating clears it and checks the box |
| `value` | `string \| number` | used inside `MiCheckboxGroup` |
| `label`, `description` | `string` | or default slot for the label |
| `disabled` | `boolean` | |

## MiCheckboxGroup

| Prop | Type | Notes |
| --- | --- | --- |
| `v-model` | `Array<string \| number>` | checked values |
| `options` | `{ value, label, description?, disabled? }[]` | omit to slot `MiCheckbox` children (each with a `value`) |
| `parentLabel` | `string` | adds a select-all parent row with a mixed state (needs `options`) |
| `label` | `string` | group name |
| `disabled` | `boolean` | |

## MiRadio / MiRadioGroup

`MiRadio` props: `value` (required), `label`, `description`, `disabled`, optional `v-model` when used standalone.
`MiRadioGroup` props: `v-model` (selected value), `options`, `label`, `orientation` (`'vertical' \| 'horizontal'`), `disabled`. Roving tabindex; arrows, Home and End move and select.

## MiSegmented

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string \| number \| null` | `null` | |
| `options` | `{ value, label?, icon?, ariaLabel?, disabled? }[]` | | `icon`: `list`, `grid`, `columns` |
| `variant` | `'regular' \| 'tinted'` | `'regular'` | tinted uses the primary color |
| `label` | `string` | | group name |
| `disabled` | `boolean` | `false` | |

Slot `icon` (`{ option, active }`) renders custom glyphs. When no option has a label the control becomes an icon strip (56px cells). The thumb slides with a transform.

## MiSlider

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `number \| [number, number]` | `0` | a tuple makes it a range slider |
| `min`, `max`, `step` | `number` | `0`, `100`, `1` | |
| `label` | `string` | | visible label above the track |
| `ariaLabel` | `string` | | name when no `label` |
| `tone` | `'primary' \| 'secondary'` | `'primary'` | fill color |
| `unit` | `string` | | appended to the value |
| `showValue` | `boolean` | `!!label` | |
| `format` | `(n: number) => string` | | value formatter |
| `name` | `string` | | emits hidden inputs |
| `disabled` | `boolean` | `false` | |

Slots: `start`, `end` (icons or text beside the track). Keyboard: arrows (step), PageUp/PageDown (10 %), Home/End. Dragging is pointer-driven with one rAF per frame.

## MiChip

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `boolean` | `false` | selected state (with `selectable`) |
| `label` | `string` | | or default slot |
| `selectable` | `boolean` | `false` | renders an `aria-pressed` toggle |
| `removable` | `boolean` | `false` | trailing remove button; Backspace/Delete also removes |
| `tone` | `'primary' \| 'secondary' \| 'neutral'` | `'primary'` | |
| `size` | `'regular' \| 'small'` | `'regular'` | |
| `removeLabel` | `string` | `Remove {label}` | |
| `disabled` | `boolean` | `false` | |

Event: `remove`.

## MiSwatch

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string \| null` | `null` | selected option value |
| `options` | `{ value, name, color }[]` | `MI_SWATCH_DEFAULTS` | `color` is any CSS color, e.g. `var(--mi-p)` |
| `label` | `string` | | visible label |
| `showName` | `boolean` | `true` | appends the selected name to the label |
| `ariaLabel` | `string` | | name when no `label` |
| `disabled` | `boolean` | `false` | |

## Shared token request

Components read `--mi-ctl` (off-state outline of checkbox and radio) with a `#8E8E93` fallback. The mockup defines it as `#8E8E93` light and `#7C7C80` dark.

## MiToggle

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model:pressed` | `boolean` | `false` | pressed state |
| `variant` | `'default' \| 'outline'` | `'default'` | |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | 32 / 36 / 44px |
| `label` | `string` | | accessible name for icon-only toggles |
| `disabled` | `boolean` | `false` | |

Slot: default (scoped `pressed`).

## MiToggleGroup

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string \| number \| null \| Array` | `null` | single: value or null; `multiple`: array |
| `options` | `{ value, label?, ariaLabel?, disabled? }[]` | | |
| `type` | `'single' \| 'multiple'` | `'single'` | `multiple` makes v-model an array |
| `multiple` | `boolean` | `false` | alias of `type="multiple"` |
| `variant` | `'default' \| 'outline'` | `'default'` | |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | |
| `spacing` | `number` | `1` | 4px steps; `0` joins items |
| `label` | `string` | | group name |
| `disabled` | `boolean` | `false` | |

Slot: default (scoped `option`, `pressed`). Arrows/Home/End move focus; Space/Enter press.

## MiCollapsible

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model:open` | `boolean` | `false` | |
| `title` | `string` | | default trigger text |
| `disabled` | `boolean` | `false` | |

Slots: `trigger` (scoped `open`), default (content).
