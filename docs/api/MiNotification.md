# MiNotification

One notification row (app tile, title, message, time) for inbox-style feeds; `interactive` turns it into a button.

Group: Feedback. Source: app/components/Feedback/MiNotification.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title* | string |  | Bold first line of the notification. |
| message | string |  | Body text under the title, shown when no default slot is given. |
| time | string |  | Timestamp text such as `now` or `2 min ago`. |
| icon | MiFbIconName | "bell" | Built-in glyph shown in the app tile. Use the `icon` slot for anything else. |
| tone | "primary" \| "secondary" \| "warning" \| "neutral" \| "danger" \| "success" | "primary" | Colour of the app tile. |
| dismissible | boolean |  | Adds a dismiss button. |
| dismissLabel | string | "Dismiss" | Accessible name of the dismiss button. |
| interactive | boolean |  | Makes the whole notification a button that emits `click`. |
| live | "status" \| "alert" \| "off" | "status" | `status` announces politely, `alert` interrupts. |

## Slots

- icon: Custom content for the app tile, replacing the `icon` glyph.
- time: Timestamp content; replaces the `time` prop.
- default: Message content; replaces the `message` prop.
- actions: Row of buttons under the message. Hidden when not provided.

## Emits

- click [e: MouseEvent]
- dismiss []

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiFbIconName = 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus' | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox' | 'share' | 'search' | 'link'
```
