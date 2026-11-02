# Feedback and overlays

Source board: `Feedback.dc.html`. Components live in `app/components/Feedback/`, the composable in `app/composables/useMiToast.ts`, private helpers in `app/utils/miOverlay.ts`. Playground: `/feedback`.

All overlays teleport to `<body>` and render nothing on the server. They read tokens from `:root`, so brand colours (`--mi-p*`, `--mi-s*`) and light/dark follow the document. Every animation uses `transform` / `opacity` only; durations collapse under `prefers-reduced-motion`.

Shared conventions: `v-model` is the open state. `inline` renders the surface in place (no teleport, scrim, focus trap or scroll lock), which is how the design board shows them.

## MiDialog

Modal alert (`variant="alert"`, 270px, blurred material, centred) or dialog card (`variant="dialog"`, icon tile, stacked buttons). Focus trap, scroll lock, Escape and scrim dismissal, focus restoration. Alerts focus the `cancel` action first.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | boolean | `false` | open state |
| `variant` | `'alert' \| 'dialog'` | `'alert'` | |
| `title`, `message` | string | | |
| `actions` | `{ id, label, kind?: 'default' \| 'primary' \| 'destructive' \| 'cancel', disabled? }[]` | `[]` | two alert actions sit side by side, more stack |
| `icon` | `MiFbIconName` | | dialog variant tile |
| `inline` | boolean | `false` | |
| `persistent` | boolean | `false` | ignore Escape and scrim |
| `closeOnAction` | boolean | `true` | |
| `label` | string | | name when no title |

Slots: `icon`, `default` (replaces `message`), `actions` (scoped `{ close }`). Events: `action(id)`, `close(reason: 'action' \| 'escape' \| 'backdrop')`.

## MiActionSheet

Bottom group of actions plus a separate Cancel button. `role="menu"` with arrow, Home and End navigation.

Props: `v-model`, `title`, `actions: { id, label, kind?: 'default' \| 'destructive', disabled? }[]`, `cancelLabel` (`'Cancel'`), `inline`, `persistent`, `label`. Events: `action(id)`, `cancel(reason: 'cancel' \| 'escape' \| 'backdrop')`.

## MiContextMenu

Menu with icons, shortcuts, separators, checkbox items and nested submenus. Opens from right click, long press (touch) or the ContextMenu / Shift+F10 key on the default slot, or programmatically.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | boolean | `false` | |
| `items` | `MiContextMenuItem[]` | | `{ id, label?, icon?, shortcut?, type?: 'item' \| 'checkbox' \| 'separator', checked?, destructive?, disabled?, children? }` |
| `label` | string | `'Menu'` | accessible name |
| `width` | number | `260` | |
| `inline` | boolean | `false` | static menu |
| `highlighted` | string | | item shown highlighted in `inline` mode |
| `disabled` | boolean | `false` | disables the triggers |

Slot: `default` (trigger area). Events: `select(id, item)` (checkbox items do not toggle themselves, update `checked`), `close`. Exposed: `openAt(x, y)`, `close()`. Keys: arrows, Home/End, typeahead, Right opens a submenu, Left or Escape closes it, Tab closes. The menu closes on scroll, resize and window blur.

## MiPopover

Anchored panel that flips and shifts to stay in the viewport, with an arrow.

| Prop | Type | Default |
| --- | --- | --- |
| `v-model` | boolean | `false` |
| `placement` | `top \| bottom \| left \| right` plus `-start` / `-end` | `'bottom-start'` |
| `offset` | number | `8` |
| `arrow` | boolean | `true` |
| `width` | number \| string | content, max 280px |
| `flush` | boolean | `false` (removes padding) |
| `label` | string | |
| `trigger` | `'click' \| 'manual'` | `'click'` |
| `closeOnOutside`, `closeOnEscape` | boolean | `true` |
| `inline`, `arrowOffset` | boolean, number | `false`, `30` |
| `disabled` | boolean | `false` |

Slots: `trigger` (scoped `{ open, toggle, attrs }`; `aria-haspopup`, `aria-expanded` and `aria-controls` are applied to its first element automatically), `default`. Escape returns focus to the trigger.

## MiTooltip

Wraps its trigger (no directive). Opens after `delay` on hover, immediately on keyboard focus, closes on leave, blur, press and Escape. Moving between tooltips within 300ms skips the delay. The bubble is always in the DOM and linked with `aria-describedby`.

Props: `content`, `shortcut`, `placement` (`'top'`), `delay` (`500`), `closeDelay` (`0`), `offset` (`8`), `disabled`, `v-model` (force open or closed). Slots: `default` (trigger), `content`.

## MiSheet

Bottom sheet with detents, drag handle and flick-to-dismiss. Dragging writes one CSS variable per animation frame; snapping is a CSS spring transition.

| Prop | Type | Default |
| --- | --- | --- |
| `v-model` | boolean | `false` |
| `v-model:detent` | number (index) | `0` |
| `detents` | `(number \| 'medium' \| 'large')[]` ascending, fractions of the viewport height | `['medium', 'large']` |
| `title`, `label` | string | |
| `cancelLabel`, `confirmLabel` | string | |
| `dismissible` | boolean | `true` |
| `grabber` | boolean | `true` |
| `modal` | boolean | `true` |
| `closeOnConfirm` | boolean | `true` |
| `inline` | boolean | `false` |

Slots: `default`, `title`, `leading` (scoped `{ cancel }`), `trailing` (scoped `{ confirm }`), `footer`. Events: `cancel`, `confirm`, `close(reason: 'cancel' \| 'confirm' \| 'escape' \| 'backdrop' \| 'drag')`. The grabber is a button when several detents exist (click cycles, ArrowUp/ArrowDown resize).

## MiNotification

Banner card with app tile, title, time and message.

Props: `title`, `message`, `time`, `icon` (`'bell'`), `tone` (`MiFeedbackTone`, `'primary'`), `dismissible`, `dismissLabel`, `interactive`, `live` (`'status' \| 'alert' \| 'off'`). Slots: `icon`, `default`, `time`, `actions`. Events: `click`, `dismiss`.

## MiToast, MiToaster and useMiToast

`MiToast` is the pill. Props: `message`, `description`, `tone` (`neutral \| success \| error \| warning \| info \| loading`), `variant` (`'solid' \| 'material'`), `actionLabel`, `dismissible`, `dismissLabel`. Slots: `icon`, `action`. Events: `action`, `dismiss`.

`MiToaster` renders the global queue; mount it once. Props: `position` (`'bottom-center'`, any `top|bottom` and `left|center|right`), `limit` (`3`), `offset` (`20`), `label`. Hover and focus pause the timers.

```ts
const toast = useMiToast()
toast.success('Link copied', { action: { label: 'Undo', onClick } })
toast.promise(upload(), { loading: 'Uploading…', success: 'Done', error: 'Failed' })
const id = toast.loading('Syncing…'); toast.update(id, { message: 'Synced', tone: 'success' })
```

API: `toasts`, `show(opts | message)`, `success|error|warning|info|loading(message, opts?)`, `update(id, patch)`, `dismiss(id)`, `clear()`, `pause()`, `resume()`, `promise(p, msgs)`. Options: `id`, `message`, `description`, `tone`, `variant`, `action`, `duration` (ms, `0` persistent, default 4000 and 0 for `loading`), `dismissible`, `onDismiss`. Calls on the server are ignored.

## MiAlert

Inline alert row. Props: `v-model` (visible, `true`), `tone` (`info \| success \| warning \| danger \| neutral \| secondary`), `title`, `message`, `icon`, `actionLabel`, `dismissible`, `dismissLabel`. Slots: `default`, `icon`, `action`. Events: `action`, `dismiss`. `danger` uses `role="alert"`, the others `role="status"`.

## MiBanner

Edge to edge announcement bar. Props: `tone` (`MiFeedbackTone`), `variant` (`'tint' \| 'solid'`), `title`, `message`, `icon` (name or `false`), `actionLabel`, `dismissible`, `dismissLabel`, `sticky`. Slots: `default`, `icon`, `action`. Events: `action`, `dismiss`.

## MiProgress

Linear progress; the fill moves with `transform`. Props: `value` (`null` is indeterminate), `max` (`100`), `label`, `valueText`, `showValue`, `size` (`sm` 4px, `md` 6px, `lg` 10px), `tone`, `segments` (`{ value, label?, tone?: 'primary' \| 'secondary' \| 'neutral' }[]`), `legend` (`true`).

## MiProgressRing

Props: `value` (`null` spins), `max`, `size` (`64`), `stroke`, `tone`, `variant` (`'ring' \| 'stop'`), `showValue` (default on from 56px), `label`, `stoppable` (stop variant becomes a button). Slot: `default` (centre). Event: `stop`.

## MiSpinner

Props: `variant` (`'ticks' \| 'arc'`), `size` (`'sm' 16 \| 'md' 20 \| 'lg' 32 \| number`), `tone` (`'inherit' \| 'primary' \| 'secondary'`), `label` (`'Loading'`, empty hides it from assistive tech).

## MiSkeleton

Shimmer placeholder swept with `transform`. Props: `variant` (`'rect' \| 'circle' \| 'text'`), `width`, `height`, `radius`, `lines` (count or widths, text variant), `animated`, `label`. With default slot content it becomes an `aria-busy` group around other skeletons.

## MiBadge

Props: `tone` (`primary` default, `danger` for counts), `variant` (`'solid' \| 'tint' \| 'outline'`), `shape` (`'pill' \| 'rounded'`), `dot`, `count`, `max` (`99`), `showZero`, `dotOnly`, `dotSize` (`10`), `placement` (`top-right` default), `offset`, `ringColor`, `label`, `ariaLabel`, `countNoun` (`'unread'`). Slots: `default` (label), `target` (element the badge attaches to).

## MiEmptyState

Props: `title`, `description`, `icon` (`'folder-plus'`), `primaryLabel`, `secondaryLabel`, `card`, `as` (`'h3'`). Slots: `icon`, `default`, `actions`. Events: `primary`, `secondary`.

## Internal pieces

`MiFbIcon` is a small private icon set (`MiFbIconName`) used by this group. `app/utils/miOverlay.ts` holds the tone variables, focus trap, scroll lock, positioning (`miOverlayPosition`) and overlay behaviour composables.

## MiAlertDialog

Modal that needs an explicit decision. Wraps `MiDialog` and is always `persistent`: Escape and scrim clicks never dismiss it, initial focus is on Cancel, role stays `alertdialog`. v-model: open state.

Props: `size` (`'default' \| 'sm'`, card with media tile vs compact box), `media` (icon name), `title`, `description`, `confirmLabel` (`'Continue'`), `cancelLabel` (`'Cancel'`), `destructive`, `hideCancel`, `confirmDisabled`, `keepOpenOnConfirm`, `inline`, `label`. Slots: `trigger` (`open()`), `media`, `default` (replaces description). Events: `confirm`, `cancel`.

## MiDrawer

Edge drawer with swipe-to-dismiss (drag past 40% of its size or flick). Use `MiSheet` for bottom sheets with snap detents. v-model: open state.

Props: `swipeDirection` (`'down' \| 'up' \| 'left' \| 'right'`, `'down'`; also sets the edge), `showSwipeHandle` (`false`), `title`, `description`, `dismissible` (`true`), `modal` (`true`), `inline`, `label`. Slots: `default` and `footer` (both expose `close`, the DrawerClose equivalent), `title`, `description`. Events: `close` (`'escape' \| 'backdrop' \| 'drag'`). Not supported: nested stacking, snap points.

## MiHoverCard

Preview card opened on hover or keyboard focus of the trigger; stays open while the pointer or focus is inside; Escape closes; never steals focus. v-model: open state.

Props: `side` (`'bottom'`), `align` (`'center' \| 'start' \| 'end'`), `offset` (`8`), `delay` (`600`), `closeDelay` (`300`), `width` (`256`), `label`, `inline`, `disabled`. Slots: `trigger`, `default`.

## MiConfetti + useMiConfetti

Mount `<MiConfetti />` once (prop `zIndex`, default 9999), then:

```ts
const { fire } = useMiConfetti()
fire({ origin: { x: 0.5, y: 0.6 }, count: 120 }) // or origin: element
```

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `origin` | `{ x, y }` (0..1) \| `HTMLElement` | `{ 0.5, 0.7 }` | element center |
| `count` | `number` | `80` | max 500 |
| `spread` | `number` | `70` | degrees, 360 for a circle |
| `angle` | `number` | `-90` | degrees, up |
| `speed` | `number` | `720` | px/s |
| `colors` | `string[]` | brand `--mi-p` / `--mi-s` + extras | |
| `duration` | `number` | `2600` | ms |
| `gravity` | `number` | `900` | px/s² |

`fire()` returns `false` (and draws nothing) on the server, without a mounted host, or under `prefers-reduced-motion`. One rAF loop runs while particles live. The engine is in `app/utils/miConfetti.ts` (`miCreateParticles`, `miStepParticle`, `miUpdateParticles`, `miParticleAlpha`, `miParticleFlip`, `miOriginToPx`).
