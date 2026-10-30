# MiCalendar

Single-date calendar grid with day and month views; use it inline or as the MiDatePicker popup. v-model is a Date or null.

Group: Inputs. Source: app/components/Inputs/MiCalendar.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| locale | string | "en-US" | BCP 47 locale used for month names, weekday labels and the default first weekday. |
| min | null \| Date | null | Earliest selectable day, inclusive. Earlier days are disabled. |
| max | null \| Date | null | Latest selectable day, inclusive. Later days are disabled. |
| isDisabled | (d: Date): boolean |  | Return true for dates that cannot be picked. |
| firstDay | number |  | 0 = Sunday ... 6 = Saturday. Defaults to the locale's first weekday. |
| today | Date |  | Override "today" (useful for tests and fixed demos). |
| fixedRows | boolean | false | Always reserve six week rows so the height never jumps between months. |
| modelValue | null \| Date | null | Selected date, or null when none is. |

## Emits

- update:modelValue [value: Date | null]
- month-change [year: number, month: number]

## Exposed (template ref)

- focusDate: () => void
