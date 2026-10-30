# MiMessageScroller

Scroll container for a message list: sticks to the bottom while streaming, keeps position when older rows are prepended, shows a jump-to-latest button.

Group: Chat. Source: app/components/Chat/MiMessageScroller.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| autoScroll | boolean | true | Follow new content while the reader is at the bottom. Any manual scroll away releases it. |
| initialPosition | "start" \| "end" \| "last-anchor" | "end" | Where the list opens. |
| scrollPreviousItemPeek | number | 0 | Px of the previous row kept visible above an anchor when opening on `last-anchor`. |
| scrollMargin | number | 0 | Px of spacing applied when scrolling to a target. |
| threshold | number | 48 | Distance in px from the bottom still counted as "at the live edge". |
| label | string | "Messages" | Accessible name of the scrollable region. |
| jumpLabel | string | "Jump to latest" | Label of the jump-to-latest button. |
| busy | boolean |  | Set while a response is streaming (`aria-busy` on the log). |

## Slots

- default: Message rows, usually MiMessageScrollerItem elements.

## Emits

- update:atEnd [value: boolean]

## Exposed (template ref)

- scrollToMessage: (id: string, o?: MiScrollToOptions) => boolean
- scrollToEnd: (behavior?: ScrollBehavior) => void
- scrollToStart: (behavior?: ScrollBehavior) => void
- atEnd: boolean
