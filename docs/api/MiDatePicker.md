# MiDatePicker

Date field that opens an MiCalendar popup, with an optional time picker (time prop); v-model is a Date or null.

Group: Inputs. Source: app/components/Inputs/MiDatePicker.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| locale | string | "en-US" | BCP 47 locale used for the displayed date, month names and 12/24-hour time format. |
| min | null \| Date | null | Earliest selectable day, inclusive. Earlier days are disabled. |
| max | null \| Date | null | Latest selectable day, inclusive. Later days are disabled. |
| isDisabled | (d: Date): boolean |  | Return true for dates that cannot be picked. |
| firstDay | number |  | First weekday of the calendar, 0 = Sunday ... 6 = Saturday. Defaults to the locale's. |
| time | boolean |  | Also show a time button with hour / minute (and AM/PM when the locale uses it). |
| minuteStep | number | 5 | Minutes between options in the time list. |
| dateStyle | "short" \| "medium" \| "long" | "medium" | Intl.DateTimeFormat dateStyle for the displayed date. |
| placeholder | string | "Select date" | Text shown on the date button while no date is chosen. |
| timePlaceholder | string | "Select time" | Text shown on the time button while no time is chosen. |
| disabled | boolean |  | Overrides the surrounding MiField or MiFormRow disabled state when set. |
| invalid | boolean |  | Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. |
| modelValue | null \| Date | null | Selected date (with time when `time` is set), or null when empty. |

## Emits

- update:modelValue [value: Date | null]
