# MiTimePicker

Standalone time field with hour, minute and optional second spinbuttons, 12 or 24 hour display, step, min and max, and an AM/PM toggle.

Group: Inputs. Source: app/components/Inputs/MiTimePicker.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| hour12 | boolean |  | Use a 12 hour clock with an AM/PM toggle instead of 24 hours. |
| minuteStep | number | 1 | Increment of the minute segment; typed values snap to it. |
| min | string |  | Earliest allowed time as `HH:mm` or `HH:mm:ss`; values below are raised to it. |
| max | string |  | Latest allowed time as `HH:mm` or `HH:mm:ss`; values above are lowered to it. |
| seconds | boolean |  | Adds a seconds segment and emits `HH:mm:ss`. |
| label | string | "Time" | Accessible name of the group. |
| name | string |  | Name of a hidden input carrying the value for native form posts. |
| disabled | boolean |  | Blocks interaction and dims the field. |
| invalid | boolean |  | Draws the error border. |
| modelValue | null \| string | null | Selected time as `HH:mm` (`HH:mm:ss` with `seconds`), or null when empty. |

## Emits

- update:modelValue [value: string | null]
