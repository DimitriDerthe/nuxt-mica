# MiSegmented

Segmented control to switch between a few mutually exclusive views or modes. Segments use text or icons; `tinted` variant for emphasis.

Group: Controls. Source: app/components/Controls/MiSegmented.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options* | { value: string \| number; label?: string; icon?: "grid" \| "columns" \| "list"; ariaLabel?: string; disabled?: boolean }[] |  | Segments in display order. Each option's `value` is what v-model holds. |
| variant | "regular" \| "tinted" | "regular" | `regular` is the neutral 30px control, `tinted` the pill filled with the primary color. |
| label | string |  | Accessible name of the group. |
| disabled | boolean |  | Blocks interaction and dims the whole control. |
| modelValue | null \| string \| number | null | Value of the selected segment, or null when none is. |

## Slots

- icon `{ option: MiSegmentedOption; active: boolean }`: Custom icon for a segment, replacing the built-in glyph of `option.icon`.

## Emits

- update:modelValue [value: string | number | null]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiSegmentedOption { value: string | number; label?: string; /** Built-in glyph: `list`, `grid` or `columns`. Use the `icon` slot for anything else. */ icon?: 'list' | 'grid' | 'columns'; /** Accessible name, required for icon-only segments (defaults to `label`). */ ariaLabel?: string; disabled?: boolean }
```
