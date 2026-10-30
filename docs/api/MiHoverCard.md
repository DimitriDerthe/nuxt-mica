# MiHoverCard

Rich preview card shown when a trigger is hovered or focused, with open and close delays; non-modal and never steals focus.

Group: Feedback. Source: app/components/Feedback/MiHoverCard.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| side | "left" \| "right" \| "bottom" \| "top" | "bottom" | Side of the trigger the card appears on. |
| align | "start" \| "center" \| "end" | "center" | Alignment along that side. |
| offset | number | 8 | Gap between the trigger and the card, in px. |
| delay | number | 600 | Delay before opening on hover or focus, in ms. |
| closeDelay | number | 300 | Delay before closing after the pointer or focus leaves, in ms. |
| width | string \| number | 256 | Card width in px (or any CSS length). |
| label | string |  | Accessible name of the card. |
| inline | boolean |  | Render the card in flow under the trigger (documentation and boards). |
| disabled | boolean |  | Prevents the card from opening and closes it if already open. |
| modelValue | boolean | false | Whether the card is open. Hover and focus open it by themselves; bind this to control it. |

## Slots

- trigger `{ open: boolean }`: Element that opens the card on hover or focus; `open` reflects the current state.
- default: Content of the card.

## Emits

- update:modelValue [value: boolean]
