# MiBanner

Page-level message bar for persistent notices, in `tint` or `solid` variant, optionally sticky and dismissible.

Group: Feedback. Source: app/components/Feedback/MiBanner.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| tone | "primary" \| "secondary" \| "warning" \| "neutral" \| "danger" \| "success" | "primary" | Colour. `danger` is announced as an alert, other tones as a status. |
| variant | "tint" \| "solid" | "tint" | `tint` is soft and tonal, `solid` is a full colour bar. |
| title | string |  | Bold heading shown before the message. |
| message | string |  | Body text, shown when no default slot is given. |
| icon | false \| MiFbIconName |  | Built-in leading glyph, or `false` to hide it. |
| actionLabel | string |  | Text of the action button, which emits `action` on click; omitted when empty. |
| dismissible | boolean |  | Adds a close button that emits `dismiss` (the parent decides whether to hide the banner). |
| dismissLabel | string | "Dismiss" | Accessible name of the close button. |
| sticky | boolean |  | Stick to the top of the scroll container. |

## Slots

- icon: Replaces the leading glyph.
- default: Message content; replaces the `message` prop.
- action: Replaces the action button, e.g. for a link or several buttons.

## Emits

- action []
- dismiss []

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiFbIconName = 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus' | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox' | 'share' | 'search' | 'link'
```
