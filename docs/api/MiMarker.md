# MiMarker

Conversation marker: inline status or note, or a labeled divider (date, unread) between messages; can be a link or button.

Group: Chat. Source: app/components/Chat/MiMarker.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "default" \| "border" \| "separator" | "default" | `default` inline marker, `border` adds a bottom border, `separator` centers the label between divider lines. |
| as | "div" \| "button" \| "a" | "div" | Render as a link (`a`, needs `href`) or `button` to make the marker actionable. |
| href | string |  | Link target when `as="a"`. |
| role | string |  | Set to `status` for in-progress markers so assistive tech announces them. |

## Slots

- default: Marker label such as a date, status text or "New messages".
- icon: Decorative icon shown before the label.
