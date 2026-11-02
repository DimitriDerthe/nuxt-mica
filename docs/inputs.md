# Inputs

Group `Inputs` (`app/components/Inputs/`). Playground: `/inputs`. Spec: `tests/inputs.spec.ts`.

All controls read their brand colors from `--mi-p*` / `--mi-s*`, surfaces from `--mi-field*`, and only animate `transform` / `opacity`. Focus rings are an overlay whose opacity fades in. Controls placed inside `MiField` (or `MiFormRow`) inherit the id, `aria-describedby`, `aria-invalid`, `required` and disabled state automatically.

Shared pieces: `app/utils/miInputs.ts` (field context, `MiSelectOption`, date helpers) and `app/composables/useMiInputPopup.ts` (teleported popup positioning/dismissal used by `MiSelect` and `MiDatePicker`). `MiFieldBox.vue` is an internal field surface; do not use it directly.

## MiField
Label, control slot, hint / error / success message.

| Prop | Type | Notes |
| --- | --- | --- |
| `label` | string | Also available as the `label` slot |
| `hint` | string | Replaced by `error` / `success` when present |
| `error` | string | Marks the control invalid, `role="alert"`, with icon |
| `success` | string | Green message with a check icon |
| `required`, `disabled` | boolean | Propagated to the control |
| `for` | string | Control id; generated when omitted |

Slots: `default`, `label`, `label-end` (right side of the label row, e.g. a counter), `message`.

## MiInput
Single-line text field. `v-model` string. Extra attrs (`placeholder`, `autocomplete`, `name`, ...) go to the `<input>`; `class` / `style` go to the field surface.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | string | `text` | `password` enables the reveal button |
| `size` | `sm` \| `md` | `md` | 36 px / 44 px |
| `prefix`, `suffix` | string | | Text add-ons (slots `prefix`, `suffix` override) |
| `clearable` | boolean | false | Clear button when there is text |
| `passwordToggle` | boolean | auto | Force/disable the reveal button |
| `invalid`, `success`, `disabled` | boolean | from `MiField` | |
| `showLabel`, `hideLabel`, `clearLabel` | string | English | Accessible names |

Slots: `leading`, `prefix`, `suffix`. Events: `clear`. Exposes `focus()`.

## MiSearch
Filled search field. `v-model` string.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `default` \| `compact` | `default` | 40 px / 32 px toolbar variant |
| `cancelable` | boolean | true | Cancel button while text is present (default size) |
| `shortcut` | string | | Hint such as `⌘K` (compact) |
| `hotkey` | string | | Letter bound to Cmd/Ctrl + letter to focus |
| `placeholder`, `ariaLabel`, `cancelLabel`, `clearLabel`, `disabled` | | | |

Events: `search` (Enter), `cancel`. Escape clears.

## MiSelect
Custom listbox (`role="combobox"` + `listbox`), teleported to `body`, flips above when needed. `v-model` of `string | number | null`.

| Prop | Type | Notes |
| --- | --- | --- |
| `options` | `MiSelectOption[]` | `{ value, label, description?, disabled? }` |
| `placeholder`, `size`, `invalid`, `success`, `disabled`, `name` | | `name` adds a hidden input |

Keys: Arrow Up/Down, Home, End, Enter/Space, Escape, Tab, typeahead. Events: `change`.

## MiTextarea
Auto-growing textarea. `v-model` string.

| Prop | Default | Notes |
| --- | --- | --- |
| `rows` | 3 | Initial rows |
| `autoGrow` | true | Grows up to `maxRows` (10), then scrolls |
| `maxlength` | | Native limit |
| `counter` | false | Shows `n / max` under the field |
| `size`, `invalid`, `success`, `disabled` | | |

## MiCalendar
Inline month grid (`role="grid"`), month/year picker via the title. `v-model` `Date | null` (time of day is preserved when picking).

| Prop | Default | Notes |
| --- | --- | --- |
| `locale` | `en-US` | `Intl` names, first weekday from the locale |
| `firstDay` | locale | 0 = Sunday |
| `min`, `max`, `isDisabled` | | Blocked dates |
| `today` | now | Override for demos/tests |
| `fixedRows` | false | Always reserve 6 rows |

Keys: arrows, Home/End (week), PageUp/PageDown (month), Shift+Page (year), Enter/Space. Events: `month-change`.

## MiDatePicker
Trigger buttons plus teleported popovers. `v-model` `Date | null`.

| Prop | Default | Notes |
| --- | --- | --- |
| `time` | false | Adds a time button (hours, minutes, AM/PM per locale) |
| `minuteStep` | 5 | |
| `dateStyle` | `medium` | `Intl` date style of the button label |
| `locale`, `min`, `max`, `isDisabled`, `firstDay` | | Forwarded to `MiCalendar` |
| `placeholder`, `timePlaceholder`, `disabled`, `invalid` | | |

## MiTagInput
Token field. `v-model` `string[]`.

| Prop | Default | Notes |
| --- | --- | --- |
| `delimiters` | `['Enter', ',']` | Keys that commit |
| `max`, `allowDuplicates`, `validate` | | Rejected tags emit `reject` |
| `placeholder`, `removeLabel`, `invalid`, `success`, `disabled` | | |

Backspace on empty text removes the last tag; pasted lists (comma, semicolon, newline) are split. Events: `add`, `remove`, `reject`.

## MiCodeInput
One-time code boxes. `v-model` string.

| Prop | Default | Notes |
| --- | --- | --- |
| `length` | 6 | |
| `mode` | `numeric` | `alphanumeric` allowed |
| `mask` | false | Password-style cells |
| `label`, `cellLabel`, `invalid`, `disabled`, `autofocus` | | |

Paste and OS autofill (`one-time-code`) are distributed across cells; arrows/Home/End/Backspace navigate. Events: `complete`. Exposes `focus()`, `clear()`.

## MiForm / MiFormRow
Form layout card: header (`title`, `description`, `header-end` slot), a 180 px label column grid that stacks below 640 px of container width, and an `actions` footer. `submit` is emitted with `preventDefault` applied.

`MiFormRow` props: `label`, `for`, `top` (align label to the top), `hint`, `error`, `required`. It provides the field context to the control in its slot.

## MiCombobox
Searchable dropdown. `v-model` is the option value, or an array with `multiple`.

| Prop | Default | Notes |
| --- | --- | --- |
| `options` | | `{ value, label, disabled?, group? }[]`; `group` renders headings |
| `multiple` | false | Chips with a remove control; Backspace on empty search removes the last |
| `clearable` | false | Clear button |
| `autoHighlight` | true | Highlights the first match while typing |
| `placeholder`, `searchPlaceholder`, `emptyText` | | Copy |
| `size`, `invalid`, `disabled`, `name` | | `name` submits hidden inputs |

Slots: `item` (scoped `option`, `selected`), `empty`. Keyboard: ArrowUp/Down, Enter, Escape. Events: `change`.

## MiCommand
Command palette: search input plus grouped, filtered list with separators between groups.

| Prop | Default | Notes |
| --- | --- | --- |
| `items` | | `{ value, label, group?, shortcut?, keywords?, disabled? }[]` |
| `placeholder`, `emptyText`, `autofocus` | | |
| `dialog` | false | Modal palette with scrim, Escape, focus return; control with `v-model:open` |
| `hotkey` | | With `dialog`: Cmd/Ctrl + key toggles it (for example `k`) |
| `label` | `Command menu` | Dialog accessible name |
| `v-model:query` | `''` | Search text |

Slots: `item` (scoped `item`), `empty`. Events: `select`. Keyboard: arrows, Home/End, Enter.

## MiNativeSelect
Styled native `<select>`. `v-model` is the value. Props: `options` (`group` makes optgroups), `placeholder`, `size`, `invalid`, `disabled`, `name`. The default slot accepts raw `<option>` / `<optgroup>`.

## MiInputGroup
Input or textarea with addons in one field surface. `v-model` string; extra attrs go to the control.

Props: `multiline` (textarea), `rows`, `size`, `invalid`, `disabled`. Slots: `inline-start` (alias `leading`), `inline-end` (alias `trailing`), `block-start`, `block-end` for icons, text, buttons or kbd; use block slots with `multiline`.

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

## MiEditor

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
