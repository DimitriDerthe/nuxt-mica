# MiDialog

Modal for confirmations and blocking decisions: `alert` is a compact centred box, `dialog` a card with an icon tile.

Group: Feedback. Source: app/components/Feedback/MiDialog.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "alert" \| "dialog" | "alert" | `alert`: compact centred alert. `dialog`: card with icon tile and stacked buttons. |
| title | string |  | Heading announced as the dialog name. |
| message | string |  | Body text under the title, shown when no default slot is given. |
| actions | MiDialogAction[] | [] | Buttons. Initial focus goes to `cancel` in `alert`, else `primary`, else the first enabled one. |
| icon | MiFbIconName |  | Icon tile shown in the `dialog` variant (or use the `icon` slot). |
| inline | boolean |  | Render in place without scrim, focus trap or teleport (for documentation and boards). |
| persistent | boolean |  | Ignore Escape and scrim clicks. |
| closeOnAction | boolean | true | Close automatically after any action. |
| label | string |  | Accessible name when no title is given. |
| modelValue | boolean | false | Whether the dialog is open. |

## Slots

- icon: Custom artwork for the icon tile, replacing the `icon` glyph (dialog variant).
- default: Body content; replaces the `message` prop.
- actions `{ close: () => void }`: Replaces the built-in action buttons; call `close` to dismiss the dialog.

## Emits

- update:modelValue [value: boolean]
- close [reason: "action" | "escape" | "backdrop"]
- action [id: string]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiDialogAction { id: string; label: string; kind?: MiDialogActionKind; disabled?: boolean }
type MiFbIconName = 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus' | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox' | 'share' | 'search' | 'link'
type MiDialogActionKind = 'default' | 'primary' | 'destructive' | 'cancel'
```
