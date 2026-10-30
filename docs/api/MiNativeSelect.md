# MiNativeSelect

Styled native select element with optional option groups; v-model holds the chosen option value.

Group: Inputs. Source: app/components/Inputs/MiNativeSelect.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options | MiNativeSelectOption[] | [] | Options; omit and use the default slot for raw option / optgroup elements. |
| placeholder | string |  | Disabled empty first option shown while nothing is chosen. |
| size | "sm" \| "md" | "md" | Field height: `sm` is compact, `md` the standard size. |
| invalid | boolean |  | Overrides the surrounding MiField state when set. |
| disabled | boolean |  | Overrides the surrounding MiField disabled state when set. |
| name | string |  | Name submitted with the surrounding native form. |
| modelValue | null \| string \| number | null | Value of the selected option, or null when none is. |

## Slots

- default: Raw option and optgroup elements, used when `options` is omitted.

## Emits

- update:modelValue [value: string | number | null]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiNativeSelectOption extends MiSelectOption { /** Group label; options sharing it render inside one optgroup. */ group?: string }
interface MiSelectOption { value: string | number; label: string; description?: string; disabled?: boolean }
```
