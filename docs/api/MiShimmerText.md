# MiShimmerText

Status text with a light sweeping across it, for "Thinking…" style labels next to MiOrb; the sweep moves with transforms only.

Group: Ai. Source: app/components/Ai/MiShimmerText.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| text | string | "" | Text to show; the default slot overrides it. |
| duration | number | 2.2 | Seconds per sweep. |
| paused | boolean | false | Stop the sweep and show plain text, e.g. once the work is done. |
| as | string | "span" | Element to render. |

## Slots

- default: Label content; plain inline text reads best.
