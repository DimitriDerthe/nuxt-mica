# MiLineChart

Line chart of series over shared categories, with area fills and a chart/table toggle. Series: { name, data, color?, area? }[].

Group: Charts. Source: app/components/Charts/MiLineChart.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| categories* | string[] |  | X-axis labels, one per data point in each series. |
| series* | { name: string; data: number[]; color?: string; area?: boolean }[] |  | Lines as { name, data: number[], color?, area? }[]. |
| title | string |  | Heading shown above the chart inside the card. |
| subtitle | string |  | Secondary line under the title. |
| card | boolean | true | Wraps the chart in the elevated card surface; turn off to embed it in your own container. |
| unit | string | "" | Suffix for axis ticks and the default value format, e.g. "K". |
| min | number |  | Fixed bottom of the value axis; defaults to 0. |
| max | number |  | Fixed top of the value axis; defaults to a nice scale over the data. |
| ticks | number | 4 | Number of axis intervals. |
| height | number | 256 | Plot height in px. |
| area | "none" \| "all" \| "first" | "first" | Which series get an area fill. |
| endLabels | boolean | true | Direct labels at the end of each line. |
| toolbar | boolean | true | Show the legend (from 2 series up) and the chart/table toggle in the header. |
| toggle | boolean | true | Lets users switch between the chart and an accessible data table. |
| animate | boolean | true | Draws the lines in on mount. |
| categoryLabel | string | "Category" | Header of the first table column, which lists the categories. |
| chartLabel | string | "Chart" | Label of the chart option in the view toggle. |
| tableLabel | string | "Table" | Label of the table option in the view toggle. |
| formatValue | (value: number, series: MiLineSeries): string |  | Custom text for a value in tooltips, end labels and the table; replaces the default value plus unit. |
| formatCategory | (category: string, index: number): string |  | Formats category names in the tooltip and table. |
| ariaLabel | string |  | Accessible description of the chart; a generated summary is used when omitted. |
| view | "table" \| "chart" | "chart" | Active view: the `chart` or its data `table`. |

## Emits

- hover [index: number]
- update:view [value: "table" | "chart"]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiLineSeries { name: string; data: number[]; color?: string; /** Fill under the line. Defaults to the chart `area` mode. */ area?: boolean }
```
