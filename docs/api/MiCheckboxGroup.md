# MiCheckboxGroup

Checkboxes for multi-select, bound to an array v-model. Pass `options` or compose MiCheckbox children; `parentLabel` adds a select-all row.

Group: Controls. Source: app/components/Controls/MiCheckboxGroup.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options | MiCheckboxOption[] |  | Options rendered as checkboxes. Omit to compose MiCheckbox children yourself. |
| parentLabel | string |  | Label of a "select all" parent row with a mixed state. Needs `options`. |
| label | string |  | Accessible name of the group. |
| disabled | boolean |  | Blocks interaction and dims every checkbox in the group. |
| modelValue | (string \| number)[] | [] | Values of the checked options. |

## Slots

- default: Checkboxes composed by hand, replacing those generated from `options`.

## Emits

- update:modelValue [value: (string | number)[]]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiCheckboxOption { value: string | number; label: string; description?: string; disabled?: boolean }
```
