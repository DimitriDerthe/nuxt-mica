# MiSelect

Single-choice dropdown over an options array; v-model holds the chosen option value.

Group: Inputs. Source: app/components/Inputs/MiSelect.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options* | { value: string \| number; label: string; description?: string; disabled?: boolean }[] |  | Choices listed in the dropdown, each with a `value` and a `label`. |
| placeholder | string | "Select an option" | Text shown while nothing is selected. |
| size | "sm" \| "md" | "md" | Control height: `sm` is compact, `md` the standard size. |
| invalid | boolean |  | Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. |
| success | boolean |  | Draws the success border and focus ring. |
| disabled | boolean |  | Overrides the surrounding MiField or MiFormRow disabled state when set. |
| name | string |  | Submitted through a hidden input when inside a native form. |
| modelValue | null \| string \| number | null | Value of the chosen option, or null when none is. |

## Emits

- update:modelValue [value: string | number | null]
- change [value: string | number]

## Exposed (template ref)

- focus: () => void | undefined
