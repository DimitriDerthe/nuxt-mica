# MiAlertDialog

Modal that interrupts for an explicit confirm or cancel decision; Escape and outside clicks never dismiss it.

Group: Feedback. Source: app/components/Feedback/MiAlertDialog.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Heading announced as the dialog name. |
| description | string |  | Explanatory text (or use the default slot). |
| confirmLabel | string | "Continue" | Label of the confirming button. |
| cancelLabel | string | "Cancel" | Label of the cancelling button. Initial focus lands here. |
| destructive | boolean |  | Style the confirm button as destructive. |
| size | "default" \| "sm" | "default" | `sm` is a compact centred box; `default` a card with a media tile and stacked buttons. |
| media | MiFbIconName |  | Media icon shown above the title in the `default` size (or use the `media` slot). |
| hideCancel | boolean |  | Hide the cancel button (acknowledge-only alert). |
| confirmDisabled | boolean |  | Disable the confirm button, e.g. while a request runs. |
| keepOpenOnConfirm | boolean |  | Keep the dialog open after confirm so the caller can close it when work completes. |
| inline | boolean |  | Render in place without scrim, focus trap or teleport (documentation and boards). |
| label | string |  | Accessible name when there is no title. |
| modelValue | boolean | false | Whether the dialog is open. |

## Slots

- trigger `{ open: () => void }`: Element that opens the dialog; call `open` from its click handler.
- media: Custom artwork for the media tile, replacing the `media` icon.
- default: Description content; replaces the `description` prop.

## Emits

- update:modelValue [value: boolean]
- cancel []
- confirm []

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiFbIconName = 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus' | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox' | 'share' | 'search' | 'link'
```
