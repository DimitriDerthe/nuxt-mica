# MiCombobox

Searchable single or multiple choice dropdown; v-model holds the option value (or an array when multiple).

Group: Inputs. Source: app/components/Inputs/MiCombobox.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options* | { value: string \| number; label: string; description?: string; disabled?: boolean; group?: string }[] |  | Options; an optional `group` renders a heading above the first option of each group. |
| multiple | boolean |  | Allow several selected values; the model becomes an array. |
| placeholder | string | "Select..." | Text shown when nothing is selected. |
| searchPlaceholder | string | "Search..." | Placeholder of the search input inside the list. |
| emptyText | string | "No results found." | Text shown when no option matches the query. |
| clearable | boolean | false | Show a clear button when a value is selected. |
| autoHighlight | boolean | true | Highlight the first match while typing. |
| size | "sm" \| "md" | "md" | Control height: `sm` is compact, `md` the standard field size. |
| invalid | boolean |  | Overrides the surrounding MiField state when set. |
| disabled | boolean |  | Overrides the surrounding MiField disabled state when set. |
| name | string |  | Submitted through hidden inputs when inside a native form. |
| modelValue | null \| string \| number \| Val[] | null | Selected option value, or an array of values in multiple mode; null when empty. |

## Slots

- item `{ option: MiSelectOption & { group?: string | undefined; }; selected: boolean }`: Custom row content for each option.
- empty: Replaces the no-match message.

## Emits

- update:modelValue [value: Val | Val[] | null]
- change [value: Val | Val[] | null]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiSelectOption { value: string | number; label: string; description?: string; disabled?: boolean }
```

## Exposed (template ref)

- focus: () => void | undefined
