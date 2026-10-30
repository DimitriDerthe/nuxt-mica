# MiMessageScrollerItem

Row boundary inside MiMessageScroller: gives a message a stable id and marks it as a turn anchor.

Group: Chat. Source: app/components/Chat/MiMessageScrollerItem.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| messageId* | string |  | Stable id used for scrollToMessage, visibility and anchoring. |
| scrollAnchor | boolean |  | Marks the row as the start of a turn (usually a user message). |

## Slots

- default: The message content, such as a MiMessage.
