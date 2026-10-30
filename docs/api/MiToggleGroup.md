# MiToggleGroup

Set of toggle buttons sharing one v-model. Single selection by default, `multiple` for an array; variants, sizes, orientation, spacing.

Group: Controls. Source: app/components/Controls/MiToggleGroup.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options* | { value: string \| number; label?: string; ariaLabel?: string; disabled?: boolean }[] |  | Items in display order. Each option's `value` is what v-model holds. |
| type | "multiple" \| "single" | "single" | `single` allows one pressed item (v-model is a value or null); `multiple` allows several (v-model is an array). |
| multiple | boolean |  | Alias of `type="multiple"`. |
| variant | "default" \| "outline" | "default" | `outline` adds a hairline border. |
| size | "default" \| "sm" \| "lg" | "default" | Height and padding of the items. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Lays items out in a row or a column and sets the arrow-key axis. |
| spacing | number | 1 | Gap in 4px steps. `0` joins the items into one connected bar. |
| disabled | boolean |  | Blocks interaction and dims every item. |
| label | string |  | Accessible name of the group. |
| modelValue | null \| string \| number \| (string \| number)[] | null | Single: the pressed value or `null`. Multiple: array of pressed values. |

## Slots

- default `{ option: MiToggleGroupOption; pressed: boolean }`: Custom content of each item, replacing `option.label`.

## Emits

- update:modelValue [value: string | number | (string | number)[] | null]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiToggleGroupOption { value: string | number; label?: string; /** Accessible name, required for icon-only items (defaults to `label`). */ ariaLabel?: string; disabled?: boolean }
```
