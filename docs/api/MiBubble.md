# MiBubble

Chat bubble: a framed message surface with variants, start/end alignment, optional link/button content and a reactions row.

Group: Chat. Source: app/components/Chat/MiBubble.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "default" \| "destructive" \| "secondary" \| "muted" \| "tinted" \| "outline" \| "ghost" | "default" | Visual style. `default` is the strong primary bubble (current user), `ghost` is unframed and full width. |
| align | "start" \| "end" | "start" | Side of the conversation the bubble sits on. |
| as | "div" \| "button" \| "a" | "div" | Render the content as `a` (with `href`) or `button` for a clickable bubble. |
| href | string |  | Link target when `as="a"`. |
| reactionsSide | "bottom" \| "top" | "bottom" | Reactions row position (vertical). Only used when the `reactions` slot is set. |
| reactionsAlign | "start" \| "end" | "end" | Reactions row alignment. |

## Slots

- default: Message content shown inside the bubble.
- reactions: Reactions row (for example emoji chips) placed above or below the bubble.
