# MiStackedBar

One horizontal bar split into shares of a total, with hover, keyboard and a legend. Segments are { label, value, color? }[].

Group: Charts. Source: app/components/Charts/MiStackedBar.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| segments* | { label: string; value: number; color?: string }[] |  | Segments as { label, value, color? }[]; shares are computed from the total. |
| height | number | 28 | Thickness of the bar in px. |
| legend | boolean | true | Show the ruled legend with percentages below the bar. |
| legendColumns | number | 2 | Number of columns in the legend below the bar. |
| formatShare | (pct: number, seg: MiStackSegment): string |  | Formats the share (0-100) shown in the legend and live region. |
| ariaLabel | string |  | Accessible description of the bar; each segment label and share is read when omitted. |
| animate | boolean | true | Grows the segments in on mount. |
| active | number | -1 | Highlighted segment index, -1 for none. |

## Emits

- update:active [value: number]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiStackSegment { label: string; value: number; color?: string }
```
