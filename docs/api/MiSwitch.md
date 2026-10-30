# MiSwitch

On/off toggle switch bound to a boolean v-model. Sizes `regular` (51x31) or `compact` (38x22); tones primary, secondary, success.

Group: Controls. Source: app/components/Controls/MiSwitch.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| size | "regular" \| "compact" | "regular" | `regular` is 51x31, `compact` is 38x22 for dense desktop forms. |
| tone | "primary" \| "secondary" \| "success" | "primary" | Color of the on state. |
| disabled | boolean |  | Blocks interaction and dims the control. |
| label | string |  | Accessible name. Use `aria-labelledby` instead when a visible label exists. |
| modelValue | boolean | false | Whether the switch is on. |

## Emits

- update:modelValue [value: boolean]
