# MiTimelineItem

One entry of a MiTimeline: a marker (dot or icon) on the connecting line, a title, an optional time and description, and free content in the default slot.

Group: Content. Source: app/components/Content/MiTimelineItem.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Heading of the entry. |
| description | string |  | Supporting text under the title. |
| time | string \| Date |  | When it happened: display text, or a Date (shown as YYYY-MM-DD). |
| datetime | string |  | Machine-readable value of the `<time>` element; derived from `time` when that is a Date or an ISO string. |
| icon | "search" \| "image" \| "copy" \| "widgets" \| "home" \| "folder" \| "folder-compact" \| "folder-plus" \| "tray" \| "calendar" \| "people" \| "settings" \| "billing" \| "grid" \| "list-bullet" \| "list-dots" \| "bell" \| "plus" \| "minus" \| "dash" \| "star" \| "bookmark" \| "share" \| "sliders" \| "chevron-right" \| "chevron-left" \| "chevron-down" \| "chevron-up" \| "chevron-up-down" \| "trash" \| "heart" \| "close" \| "more" \| "sidebar" \| "columns" \| "align-left" \| "align-center" \| "align-right" \| "spinner-arc" \| "arc" \| "spinner" \| "arrow-up" \| "arrow-down" \| "arrow-left" \| "arrow-right" \| "moon" \| "sun" \| "desktop" \| "eye" \| "globe" \| "archive" \| "check" \| "person" \| "person-fill" \| "document" \| "wifi" \| "bluetooth" \| "lock" \| "speaker" \| "speaker-wave" \| "pencil" \| "chat" \| "info-circle" \| "check-circle" \| "exclamation-circle" \| "warning" \| "check-circle-fill" \| "x-circle-fill" |  | Icon shown in the marker; without it the marker is a dot. |
| tone | "primary" \| "warning" \| "neutral" \| "danger" \| "success" \| "info" | "primary" | Color of the marker. |
| status | "done" \| "current" \| "upcoming" | "done" | `done` is filled, `current` is highlighted and marked with `aria-current="step"`, `upcoming` is hollow and dimmed. |

## Slots

- default: Extra content under the description (attachments, buttons, a comment).
- title: Replaces the title text.
- time: Replaces the time text.
- marker: Replaces the marker contents (the icon or dot).
