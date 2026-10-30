# MiEmptyState

Placeholder for an empty list or screen with a glyph, text and up to two actions; `card` wraps it in a surface.

Group: Feedback. Source: app/components/Feedback/MiEmptyState.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title* | string |  | Heading of the placeholder. |
| description | string |  | Supporting text under the title, shown when no default slot is given. |
| icon | MiFbIconName | "folder-plus" | Built-in glyph in the tinted circle. Use the `icon` slot for custom artwork. |
| primaryLabel | string |  | Text of the main action button, which emits `primary`; omitted when empty. |
| secondaryLabel | string |  | Text of the secondary action button, which emits `secondary`; omitted when empty. |
| card | boolean |  | Wrap in a card surface. |
| as | "h2" \| "h3" \| "h4" | "h3" | Heading element. |

## Slots

- icon: Custom artwork inside the tinted circle, replacing the `icon` glyph.
- default: Description content; replaces the `description` prop.
- actions: Replaces the built-in primary and secondary buttons.

## Emits

- primary []
- secondary []

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiFbIconName = 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus' | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox' | 'share' | 'search' | 'link'
```
