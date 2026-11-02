# MiDonutChart

Donut or pie chart of labelled values with a center readout, legend, hover and keyboard highlighting, and a chart/table toggle. Data: { label, value, color? }[].

Group: Charts. Source: app/components/Charts/MiDonutChart.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| data* | { label: string; value: number; color?: string }[] |  | Segments as { label, value, color? }[]. Negative values count as 0; zero values get no segment. |
| variant | "donut" \| "pie" | "donut" | donut: ring with a center slot. pie: filled disc. |
| title | string |  | Heading shown above the chart inside the card. |
| subtitle | string |  | Secondary line under the title. |
| card | boolean | true | Wraps the chart in the elevated card surface; turn off to embed it in your own container. |
| size | number | 240 | Largest width of the chart in px; it shrinks to fit its container. |
| thickness | number | 30 | Ring thickness in px on a 220 px grid (donut only). |
| gap | number | 3 | Gap between segments in px along the ring. |
| valueLabels | "value" \| "none" \| "percent" | "none" | Text drawn on the segments: nothing, the share in percent, or the formatted value. Small segments stay unlabeled. |
| unit | string | "" | Suffix for values in the legend, tooltip, table and center, e.g. "$". |
| legend | boolean | true | Show the legend next to or below the chart. |
| toggle | boolean | true | Lets users switch between the chart and an accessible data table. |
| animate | boolean | true | Draws the segments in on mount. |
| totalLabel | string | "Total" | Caption under the total in the center when nothing is highlighted. |
| categoryLabel | string | "Category" | Header of the first table column. |
| valueLabel | string | "Value" | Header of the value column in the table. |
| shareLabel | string | "Share" | Header of the share column in the table. |
| chartLabel | string | "Chart" | Label of the chart option in the view toggle. |
| tableLabel | string | "Table" | Label of the table option in the view toggle. |
| formatValue | (value: number, datum: MiDonutDatum): string |  | Custom text for a value in tooltips, legend, table and center; replaces the default number plus unit. |
| ariaLabel | string |  | Accessible description of the chart; a generated summary is used when omitted. |
| view | "table" \| "chart" | "chart" | Active view: the `chart` or its data `table`. |
| active | number | -1 | Index of the highlighted segment, -1 for none. Shared by the chart, the legend and the keyboard. |

## Slots

- center `{ active: { index: number; label: string; value: number; text: string; share: number; } | null; total: number; totalText: string }`: Content in the hole of the donut. Receives the highlighted segment (or null), the total and its formatted text.

## Emits

- hover [index: number]
- update:active [value: number]
- update:view [value: "table" | "chart"]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiDonutDatum { label: string; value: number; /** Any CSS color; defaults to the shared chart palette in order. */ color?: string }
```
