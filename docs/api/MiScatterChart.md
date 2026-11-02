# MiScatterChart

Scatter or bubble chart of points on two numeric axes, with nice ticks, optional bubble size, tooltip, keyboard reading and a chart/table toggle. Series: { name, points: { x, y, r? }[], color? }[].

Group: Charts. Source: app/components/Charts/MiScatterChart.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| series* | { name: string; points: MiScatterPoint[]; color?: string }[] |  | Point groups as { name, points: { x, y, r? }[], color? }[]. |
| title | string |  | Heading shown above the chart inside the card. |
| subtitle | string |  | Secondary line under the title. |
| card | boolean | true | Wraps the chart in the elevated card surface; turn off to embed it in your own container. |
| xLabel | string |  | Title of the horizontal axis, drawn under it. |
| yLabel | string |  | Title of the vertical axis, drawn above it. |
| xUnit | string | "" | Suffix for horizontal ticks and values, e.g. "kg". |
| yUnit | string | "" | Suffix for vertical ticks and values, e.g. "%". |
| sizeLabel | string | "Size" | Label for the bubble size in the tooltip and table. |
| ticks | number | 5 | Number of axis intervals. |
| height | number | 300 | Plot height in px. |
| dotSize | number | 5 | Radius of a plain point in px when no point has a size. |
| maxRadius | number | 22 | Largest bubble radius in px. |
| toolbar | boolean | true | Show the legend (from 2 series up) and the chart/table toggle in the header. |
| toggle | boolean | true | Lets users switch between the chart and an accessible data table. |
| animate | boolean | true | Fades the points in on mount. |
| seriesLabel | string | "Series" | Header of the series column in the table. |
| chartLabel | string | "Chart" | Label of the chart option in the view toggle. |
| tableLabel | string | "Table" | Label of the table option in the view toggle. |
| formatValue | (value: number, axis: "x" \| "y" \| "r", series: MiScatterSeries): string |  | Custom text for a coordinate in the tooltip and table; replaces the default number plus unit. |
| ariaLabel | string |  | Accessible description of the chart; a generated summary is used when omitted. |
| view | "table" \| "chart" | "chart" | Active view: the `chart` or its data `table`. |

## Emits

- hover [point: { series: number; index: number; } | null]
- update:view [value: "table" | "chart"]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiScatterPoint { x: number; y: number; /** Bubble size value; mapped to the area of the circle. Omit on all points for a plain scatter. */ r?: number }
interface MiScatterSeries { name: string; points: MiScatterPoint[]; color?: string }
```
