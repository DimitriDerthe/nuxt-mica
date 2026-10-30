# MiProgressRing

Circular progress: `ring` shows a value or an indeterminate arc; `stop` adds a stop square and can emit `stop`.

Group: Feedback. Source: app/components/Feedback/MiProgressRing.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| value | null \| number | null | Current value. `null` spins an indeterminate arc (`ring`) or shows a full ring (`stop`). |
| max | number | 100 | Value that corresponds to a full ring. |
| size | number | 64 | Outer size in px. |
| stroke | number |  | Stroke width in px. Derived from the size when omitted. |
| tone | "primary" \| "secondary" | "primary" | Colour of the arc. |
| variant | "ring" \| "stop" | "ring" | `ring` is a circular progress indicator, `stop` a ring with a stop square inside. |
| showValue | boolean |  | Show the percentage in the centre. Defaults to true for rings of 56px and above. |
| label | string | "Progress" | Accessible name. |
| stoppable | boolean |  | Make the `stop` variant a button that emits `stop`. |

## Slots

- default: Centre content; replaces the percentage text.

## Emits

- stop []
