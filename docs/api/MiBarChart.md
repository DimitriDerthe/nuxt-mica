# MiBarChart

Column chart for comparing values across categories. Data is { label, value, color? }[]; valueLabels is peak, all or none.

Group: Charts. Source: app/components/Charts/MiBarChart.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| data* | { label: string; value: number; color?: string }[] |  | Columns as { label, value, color? }[], in display order. |
| title | string |  | Heading shown above the chart inside the card. |
| subtitle | string |  | Secondary line under the title, for context such as period or unit. |
| card | boolean | true | Wraps the chart in the elevated card surface; turn off to embed it in your own container. |
| unit | string | "" | Suffix added to tick labels and values, e.g. "%". |
| max | number |  | Fixed top of the value axis; defaults to a nice scale over the data. |
| ticks | number | 2 | Number of axis intervals. |
| height | number | 216 | Total chart height in px, including the axis labels. |
| maxBarWidth | number | 24 | Widest a column may be, in px. |
| radius | number | 4 | Corner radius in px of the top of each column. |
| valueLabels | "none" \| "peak" \| "all" | "peak" | peak: label the tallest column (or the hovered one). all: label every column. none: tooltip only. |
| animate | boolean | true | Grows the columns in on mount. |
| formatValue | (value: number, datum: MiBarDatum): string |  | Custom text for a column value in labels and tooltips; replaces the default value plus unit. |
| ariaLabel | string |  | Accessible description of the chart; a summary of highest and lowest columns is generated when omitted. |

## Emits

- hover [index: number]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiBarDatum { label: string; value: number; color?: string }
```
