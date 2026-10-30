# Chat

Components live in `app/components/Chat/`. Only `--mi-*` tokens are used; only `transform`/`opacity` animate.

## MiMessageScroller
Auto-stick-to-bottom scroll container (`role=region` > `role=log`). Fills its parent: give it a height.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `autoScroll` | boolean | `true` | Follow new content while at the bottom |
| `initialPosition` | `start` \| `end` \| `last-anchor` | `end` | Where it opens; `last-anchor` falls back to `end` |
| `scrollPreviousItemPeek` | number | `0` | px of previous row kept above the anchor |
| `scrollMargin` | number | `0` | px spacing when scrolling to a target |
| `threshold` | number | `48` | px from bottom still counted as live edge |
| `label` | string | `Messages` | Region aria-label |
| `jumpLabel` | string | `Jump to latest` | Button aria-label |
| `busy` | boolean | `false` | `aria-busy` while streaming |

Slots: `default`. Emits: `update:atEnd(boolean)`. Exposed: `scrollToMessage(id, opts)`, `scrollToEnd()`, `scrollToStart()`, `atEnd`.

## MiMessage
Row layout. Props: `align` (`start` \| `end`, default `start`), `label`. Slots: `avatar`, `header`, `default` (the surface, e.g. `MiBubble`), `footer`.

## MiBubble
| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `default` \| `secondary` \| `muted` \| `tinted` \| `outline` \| `ghost` \| `destructive` | `default` | |
| `align` | `start` \| `end` | `start` | |
| `as` | `div` \| `a` \| `button` | `div` | Clickable bubble; `href` implies `a` |
| `href` | string | | |
| `reactionsSide` | `top` \| `bottom` | `bottom` | |
| `reactionsAlign` | `start` \| `end` | `end` | |

Slots: `default`, `reactions` (give it `role="img"` + `aria-label` in your content).

## MiMarker
| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `default` \| `border` \| `separator` | `default` | `separator` = centered label between lines (dates, unread) |
| `as` / `href` | | `div` | Link or button marker |
| `role` | string | | Use `status` for in-progress markers |

Slots: `default`, `icon` (decorative).

```vue
<MiMessageScroller :busy="streaming" style="height:480px">
  <MiMarker variant="separator">Today</MiMarker>
  <MiMessage><template #avatar><MiAvatar name="Olivia" size="sm" /></template><template #header>Olivia</template><MiBubble variant="muted">Build is green.</MiBubble></MiMessage>
  <MiMessage align="end"><MiBubble align="end">Shipping it.</MiBubble><template #footer>Delivered</template></MiMessage>
</MiMessageScroller>
```

## MiMessageScrollerItem
Wrap each direct child of the scroller. Props: `messageId` (required), `scrollAnchor` (turn start, e.g. user messages).

## MiMessageGroup / MiBubbleGroup
Tight stacks for consecutive messages / bubbles of one sender (slot only).

## useMiMessageScroller()
Inside a `MiMessageScroller`: `scrollToMessage(id, { align, behavior, scrollMargin })` (returns boolean), `scrollToEnd()`, `scrollToStart()`, `scrollable` (`{ start, end }`), `currentAnchorId`, `visibleMessageIds`.
