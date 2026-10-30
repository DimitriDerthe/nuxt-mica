# MiAlert

Inline callout for a status or error message inside a page or form; tones info, success, warning, danger, neutral, secondary.

Group: Feedback. Source: app/components/Feedback/MiAlert.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| tone | "secondary" \| "warning" \| "neutral" \| "danger" \| "success" \| "info" | "info" | Colour and default glyph. `danger` is announced as an alert, other tones as a status. |
| title | string |  | Bold heading above the message. |
| message | string |  | Body text, shown when no default slot is given. |
| icon | MiFbIconName |  | Built-in glyph; defaults to one matching the tone. |
| actionLabel | string |  | Text of the action button; the button is rendered only when set (or via the `action` slot) and emits `action` on click. |
| dismissible | boolean |  | Adds a close button that hides the alert and emits `dismiss`. |
| dismissLabel | string | "Dismiss" | Accessible name of the close button. |
| modelValue | boolean | true | `v-model` controls visibility; dismissing sets it to false. |

## Slots

- icon: Replaces the leading glyph.
- default: Message content; replaces the `message` prop.
- action: Replaces the action button, e.g. for a link or several buttons.

## Emits

- update:modelValue [value: boolean]
- action []
- dismiss []

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiFbIconName = 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus' | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox' | 'share' | 'search' | 'link'
```
