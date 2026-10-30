# MiRadioGroup

Radio group for one choice, bound to a v-model value with arrow-key navigation. Pass `options` or compose MiRadio children.

Group: Controls. Source: app/components/Controls/MiRadioGroup.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options | MiRadioOption[] |  | Options rendered as radios. Omit to compose MiRadio children yourself. |
| label | string |  | Accessible name of the group. |
| orientation | "horizontal" \| "vertical" | "vertical" | Lays radios out in a column or a row and sets the arrow-key axis. |
| disabled | boolean |  | Blocks interaction and dims every radio in the group. |
| modelValue | null \| string \| number \| boolean | null | Value of the selected radio, or null when none is. |

## Slots

- default: Radios composed by hand, replacing those generated from `options`.

## Emits

- update:modelValue [value: string | number | boolean | null]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiRadioOption { value: string | number | boolean; label: string; description?: string; disabled?: boolean }
```
