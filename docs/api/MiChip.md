# MiChip

Compact tag for labels or filters. `selectable` adds a v-model toggle, `removable` a remove button; tones primary, secondary, neutral.

Group: Controls. Source: app/components/Controls/MiChip.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| label | string |  | Text of the chip. |
| selectable | boolean |  | Renders a toggle (`aria-pressed`) bound to `v-model`. |
| removable | boolean |  | Adds a trailing remove button; Backspace and Delete also remove. |
| tone | "primary" \| "secondary" \| "neutral" | "primary" | Color treatment of the chip. |
| size | "small" \| "regular" | "regular" | Chip height and text size. |
| disabled | boolean |  | Blocks selecting and removing, and dims the chip. |
| removeLabel | string |  | Accessible name of the remove button. |
| modelValue | boolean | false | Whether the chip is selected (only with `selectable`). |

## Slots

- default: Custom chip content replacing the `label` text.

## Emits

- remove []
- update:modelValue [value: boolean]
