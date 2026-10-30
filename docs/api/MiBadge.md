# MiBadge

Status marker: a count, a dot or a label badge, optionally anchored to a `target` slot (`dotOnly` for a bare dot).

Group: Feedback. Source: app/components/Feedback/MiBadge.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| tone | "primary" \| "secondary" \| "warning" \| "neutral" \| "danger" \| "success" |  | Defaults to `danger` for counts and `primary` otherwise. |
| variant | "outline" \| "tint" \| "solid" | "tint" | `tint` is soft, `solid` filled, `outline` a hairline tag. |
| shape | "rounded" \| "pill" |  | Corner style of label badges. Outline badges default to `rounded`. |
| dot | boolean |  | Leading status dot inside a label badge. |
| count | number |  | Numeric count; switches the badge to count mode. Hidden at 0 unless `showZero`. |
| max | number | 99 | Cap for the displayed count; above it the badge shows `max+`. |
| showZero | boolean |  | Keeps a count badge visible when `count` is 0 instead of hiding it. |
| dotOnly | boolean |  | Status dot only, no text. Usually combined with the `target` slot. |
| dotSize | number | 10 | Diameter of the `dotOnly` badge in px. |
| placement | "top-right" \| "top-left" \| "bottom-right" \| "bottom-left" | "top-right" | Where the badge sits on the `target` slot. |
| offset | number |  | Distance outside the target corner in px. |
| ringColor | string | "var(--mi-card)" | Colour of the cut-out ring around anchored badges. |
| label | string |  | Text for label badges, as an alternative to the default slot. |
| ariaLabel | string |  | Accessible name; defaults to `<count> <countNoun>`. |
| countNoun | string | "unread" | Noun in the accessible label, e.g. `unread` gives "3 unread". |

## Slots

- target: Element the badge is anchored to; the badge is positioned on its corner per `placement`.
- default: Badge text, replacing `label`; used in label mode only.
