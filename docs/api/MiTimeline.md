# MiTimeline

Vertical activity or history feed: a semantic ordered list of entries on a connecting line, from the `items` shortcut or composed MiTimelineItem parts, optionally alternating sides at wide widths.

Group: Content. Source: app/components/Content/MiTimeline.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items | MiTimelineEntry[] |  | Entries to render; each takes the same fields as MiTimelineItem. Leave empty to compose parts in the default slot. |
| align | "start" \| "alternate" | "start" | `alternate` places entries on both sides of a central line once the container is at least 640px wide; narrower it stays one column. |
| ariaLabel | string | "Timeline" | Accessible name of the list. |

## Slots

- default: MiTimelineItem parts, used instead of `items`.

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiTimelineEntry { title: string; description?: string; time?: string | Date; icon?: MiIconName; tone?: MiTimelineTone; status?: MiTimelineStatus }
type MiIconName = 'widgets' | 'home' | 'folder' | 'folder-compact' | 'folder-plus' | 'tray' | 'calendar' | 'people' | 'settings' | 'billing' | 'search' | 'grid' | 'list-bullet' | 'list-dots' | 'bell' | 'plus' | 'minus' | 'dash' | 'star' | 'bookmark' | 'share' | 'sliders' | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'chevron-up' | 'chevron-up-down' | 'trash' | 'heart' | 'close' | 'more' | 'sidebar' | 'columns' | 'align-left' | 'align-center' | 'align-right' | 'spinner-arc' | 'arc' | 'spinner' | 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right' | 'moon' | 'sun' | 'desktop' | 'eye' | 'globe' | 'archive' | 'image' | 'check' | 'person' | 'person-fill' | 'document' | 'wifi' | 'bluetooth' | 'lock' | 'speaker' | 'speaker-wave' | 'copy' | 'pencil' | 'chat' | 'info-circle' | 'check-circle' | 'exclamation-circle' | 'warning' | 'check-circle-fill' | 'x-circle-fill'
type MiTimelineTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
type MiTimelineStatus = 'done' | 'current' | 'upcoming'
```
