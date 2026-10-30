# MiCommand

Command palette: search input over a filtered, grouped list with keyboard navigation; place it inside MiDialog for a modal palette.

Group: Inputs. Source: app/components/Inputs/MiCommand.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { value: string; label: string; group?: string; shortcut?: string; disabled?: boolean; keywords?: string[] }[] |  | Commands to list; they are filtered by the query and grouped by their `group`. |
| placeholder | string | "Type a command or search..." | Placeholder of the search input. |
| emptyText | string | "No results found." | Text shown when nothing matches. |
| autofocus | boolean |  | Focus the search input on mount. |
| dialog | boolean |  | Render as a modal palette with scrim; control it with v-model:open. |
| hotkey | string |  | Key that toggles the dialog together with Cmd/Ctrl (for example `k`); empty disables. |
| label | string | "Command menu" | Accessible name of the dialog. |
| query | string | "" | Text typed in the search field, which filters the items. |
| open | boolean | false | Whether the palette dialog is open (only with `dialog`). |

## Slots

- item `{ item: MiCommandItem }`: Custom row content for each command.
- empty: Replaces the no-match message.

## Emits

- update:open [value: boolean]
- select [item: MiCommandItem]
- update:query [value: string]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiCommandItem { value: string; label: string; /** Group heading; items sharing a group are listed together. */ group?: string; /** Right-aligned hint such as a shortcut. */ shortcut?: string; disabled?: boolean; /** Extra search terms. */ keywords?: string[] }
```
