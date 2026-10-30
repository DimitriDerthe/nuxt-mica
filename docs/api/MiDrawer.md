# MiDrawer

Edge drawer (bottom, top, left or right) with a drag handle and swipe-to-dismiss; use MiSheet for detent-based bottom sheets.

Group: Feedback. Source: app/components/Feedback/MiDrawer.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| swipeDirection | "left" \| "right" \| "up" \| "down" | "down" | Direction the drawer is swiped to dismiss, which also sets its edge: `down` is a bottom drawer, `right` a right-hand one. |
| title | string |  | Heading text (or use the `title` slot). |
| description | string |  | Supporting text under the title (or use the `description` slot). |
| showSwipeHandle | boolean | false | Show the swipe handle bar. |
| dismissible | boolean | true | Allow swipe, Escape and scrim click to dismiss. |
| modal | boolean | true | Dim the page, trap focus and lock scroll. |
| inline | boolean |  | Render the panel in place without teleport, scrim or drag (documentation and boards). |
| label | string |  | Accessible name when there is no title. |
| modelValue | boolean | false | Whether the drawer is open. |

## Slots

- title: Heading content; replaces the `title` prop.
- description: Supporting text under the title; replaces the `description` prop.
- default `{ close: () => void }`: Drawer body; `close` dismisses the drawer.
- footer `{ close: () => void }`: Pinned footer, typically buttons; `close` dismisses the drawer. Hidden when not provided.

## Emits

- update:modelValue [value: boolean]
- close [reason: "escape" | "backdrop" | "drag"]
