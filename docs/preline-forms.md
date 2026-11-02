# Preline-gap forms

Form components added after the Preline gap analysis. All follow `docs/CONVENTIONS.md`: colors from `--mi-*` tokens, animations are `transform` / `opacity` only, SSR safe. Playground: `/preline-forms`.

File validation helpers (`miValidateFiles`, `miFileMatches`, `miFormatBytes`) are exported from `app/components/Inputs/MiFileUpload.vue`; password scoring lives in `app/utils/miPassword.ts`.

## MiFileUpload

Drag-and-drop zone (`role="button"`, Enter / Space open the file dialog) with a file list.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `File[]` | `[]` | |
| `accept` | `string` | | native syntax: `image/*,.pdf,application/zip` |
| `multiple` | `boolean` | `false` | single mode replaces the current file |
| `maxSize` | `number` | | bytes |
| `maxFiles` | `number` | | multiple mode only |
| `disabled` | `boolean` | `false` | |
| `label`, `hint` | `string` | `'Drop files here or browse'` | zone title and secondary line |
| `progress` | `Record<string, number>` | | file name to 0..1; shows a `progressbar` per file |
| `removeLabel` | `string` | `'Remove'` | prefix of the remove button name |

| Event | Payload | Notes |
| --- | --- | --- |
| `reject` | `{ file, reason: 'type' \| 'size' \| 'count' }[]` | also rendered inline in a `role="alert"` list |

## MiFileInput

Field-style input: choose button, file name text, clear button. Same validation props as `MiFileUpload`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `File \| File[] \| null` | `null` | `File` / `null` in single mode, `File[]` with `multiple` |
| `accept`, `multiple`, `maxSize`, `maxFiles`, `disabled` | | | as `MiFileUpload` |
| `label` | `string` | `'File'` | `aria-label` of the native input |
| `buttonLabel`, `placeholder`, `clearLabel` | `string` | `'Choose file'`, `'No file chosen'`, `'Clear'` | |

Event: `reject` (same payload as above).

## MiTimePicker

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string \| null` | `null` | `HH:mm`, or `HH:mm:ss` with `seconds` |
| `hour12` | `boolean` | `false` | adds an AM/PM toggle |
| `seconds` | `boolean` | `false` | |
| `minuteStep` | `number` | `1` | |
| `min`, `max` | `string` | | `HH:mm[:ss]`; results are clamped |
| `label` | `string` | `'Time'` | group name |
| `name` | `string` | | renders a hidden input for form posts |
| `disabled`, `invalid` | `boolean` | `false` | |

Segments are `spinbutton`s. Keyboard: Up / Down step (wrapping), PageUp / PageDown big steps, Home / End, digits type a value and advance, Left / Right move between segments, Backspace / Delete clear. On the AM/PM toggle: Up / Down, `A`, `P`.

## MiRating

`role="slider"`, `aria-valuetext` "3 out of 5".

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `number` | `0` | 0..`max` |
| `max` | `number` | `5` | |
| `half` | `boolean` | `false` | half-star values and hover |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `clearable` | `boolean` | `false` | clicking the current value resets to 0 |
| `readonly`, `disabled` | `boolean` | `false` | readonly stays focusable |
| `label`, `showValue` | `string`, `boolean` | `'Rating'`, `false` | |

Keyboard: Arrows step, Home = 0, End = `max`, Backspace / Delete clears when `clearable`.

## MiPasswordStrength

Meter only; pair it with `MiInput`. Status text is in a polite live region.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | `''` | password to evaluate |
| `requirements` | `('length' \| 'upper' \| 'lower' \| 'number' \| 'symbol')[]` | `[]` | shows a checklist |
| `minLength` | `number` | `8` | |
| `labels` | `[string, string, string, string]` | Weak, Fair, Good, Strong | |
| `emptyLabel`, `label` | `string` | `'Enter a password'`, `'Password strength'` | |
| `requirementLabels` | `Partial<Record<Requirement, string>>` | | overrides checklist texts |

Event: `score` (`0..4`), fired on change and once on mount. `miPasswordScore(value, { minLength })` returns `{ score, checks }`.

## MiRepeater

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `Record<string, unknown>[]` | `[]` | rows |
| `min`, `max` | `number` | `0`, unlimited | missing rows up to `min` are created on mount |
| `template` | `() => row` | `() => ({})` | factory for new rows |
| `addLabel`, `removeLabel` | `string` | `'Add row'`, `'Remove row'` | remove name gets the row number appended |
| `label` | `string` | `'Row'` | list name and row group prefix |
| `disabled` | `boolean` | `false` | |

Slot `default` receives `{ row, index, update(patch) }`. Events: `add(index)`, `remove(index, row)`. Focus moves to the first field of a new row; after removal it moves to the neighbouring remove button or the add button. Rows keep stable keys across add / remove.
