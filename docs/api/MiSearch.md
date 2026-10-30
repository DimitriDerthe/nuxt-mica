# MiSearch

Search input with optional cancel button and Cmd/Ctrl+letter focus hotkey; default or compact size. v-model is the query.

Group: Inputs. Source: app/components/Inputs/MiSearch.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| size | "default" \| "compact" | "default" | `default` is the 40 px filled field, `compact` the 32 px toolbar field. |
| placeholder | string | "Search" | Hint text shown while the field is empty. |
| cancelable | boolean | true | Show a Cancel button next to the field while it has text (default size only). |
| cancelLabel | string | "Cancel" | Text of the cancel button. |
| clearLabel | string | "Clear search" | Accessible name of the clear button. |
| shortcut | string |  | Visible keyboard shortcut hint in compact mode, for example `⌘K`. |
| hotkey | string |  | Letter bound to Cmd/Ctrl + letter to focus the field, for example `k`. |
| disabled | boolean |  | Blocks typing and dims the field. |
| ariaLabel | string | "Search" | Accessible name of the input. Defaults to Search. |
| modelValue | string | "" | Current search query. |

## Emits

- search [value: string]
- update:modelValue [value: string]
- cancel []

## Exposed (template ref)

- focus: () => void | undefined
- input: HTMLInputElement | null
