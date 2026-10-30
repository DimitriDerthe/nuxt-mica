# MiActionSheet

Bottom list of actions to choose from, modal by default; use `inline` to render it in place (docs, boards).

Group: Feedback. Source: app/components/Feedback/MiActionSheet.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Optional caption above the actions. |
| actions | MiActionSheetAction[] | [] | Rows as menu items; `id` is emitted on `action`, `disabled` rows are skipped by arrow keys. |
| cancelLabel | string | "Cancel" | Text of the cancel row that closes the sheet without choosing an action. |
| inline | boolean |  | Render in place without scrim, focus trap or teleport. |
| persistent | boolean |  | Ignore Escape and scrim clicks. |
| label | string |  | Accessible name when there is no title. |
| modelValue | boolean | false | Whether the sheet is open. |

## Emits

- update:modelValue [value: boolean]
- action [id: string]
- cancel [reason: "cancel" | "escape" | "backdrop"]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiActionSheetAction { id: string; label: string; kind?: 'default' | 'destructive'; disabled?: boolean }
```
