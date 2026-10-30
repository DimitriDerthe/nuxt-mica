# MiRadio

Single radio button for one choice, standalone via v-model or inside MiRadioGroup via `value`. Prefer MiRadioGroup for a set of options.

Group: Controls. Source: app/components/Controls/MiRadio.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| value* | string \| number \| boolean |  | The value this radio represents. |
| label | string |  | Text shown beside the radio. |
| description | string |  | Secondary line under the label. |
| disabled | boolean |  | Blocks interaction and dims the control. |
| modelValue | null \| string \| number \| boolean | null | Selected value (standalone use). Inside an MiRadioGroup the group's model wins. |

## Slots

- default: Custom label content replacing the `label` text.

## Emits

- update:modelValue [value: string | number | boolean | null]
