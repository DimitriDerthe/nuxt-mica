# MiCheckbox

Checkbox with optional description and mixed (indeterminate) state. Use standalone with v-model, or inside MiCheckboxGroup via `value`.

Group: Controls. Source: app/components/Controls/MiCheckbox.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| value | string \| number |  | Value used when the checkbox lives inside an MiCheckboxGroup. |
| label | string |  | Text shown beside the box. |
| description | string |  | Secondary line under the label. |
| disabled | boolean |  | Blocks interaction and dims the control. |
| modelValue | boolean | false | Checked state (standalone use). Inside a group the group's array wins. |
| indeterminate | boolean | false | Mixed state, shown as a dash. Activating the box clears it and checks the box. |

## Slots

- default: Custom label content replacing the `label` text.

## Emits

- update:modelValue [value: boolean]
- update:indeterminate [value: boolean]
