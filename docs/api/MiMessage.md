# MiMessage

Conversation row: lays out an avatar, a header (sender), the message surface (usually MiBubble) and a footer (status, actions) on the start or end side.

Group: Chat. Source: app/components/Chat/MiMessage.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| align | "start" \| "end" | "start" | Side of the sender. `end` moves the avatar and footer to the right. |
| label | string |  | Accessible label of the row, e.g. the sender name. |

## Slots

- default: Message surface, usually a MiBubble.
- avatar: Sender avatar beside the message; leave empty on grouped rows to keep alignment.
- header: Sender name or timestamp shown above the message.
- footer: Status or action row shown below the message, such as delivery state or copy buttons.
