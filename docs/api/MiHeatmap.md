# MiHeatmap

Heatmap of daily counts by week, with a legend and keyboard navigation. Data is a flat number[], 7 values per week, Monday first.

Group: Charts. Source: app/components/Charts/MiHeatmap.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| data* | number[] |  | Week-major flat list, 7 values per week (Monday first). |
| title | string |  | Heading shown above the heatmap inside the card. |
| subtitle | string |  | Secondary line under the title. |
| card | boolean | true | Wraps the heatmap in the elevated card surface; turn off to embed it in your own container. |
| dayLabels | string[] | ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] | Seven weekday names, Monday first, used for row labels and tooltips. |
| labelRows | number[] | [0, 2, 4] | Day rows that get a text label. |
| unit | string | "events" | Noun shown in the default tooltip, e.g. "reviews". |
| max | number |  | Maximum for the color scale; defaults to the data maximum. |
| cell | number | 14 | Side length of each square cell in px. |
| gap | number | 3 | Space between cells in px. |
| legend | boolean | true | Shows the Less to More color scale below the grid. |
| lessLabel | string | "Less" | Text at the low end of the legend scale. |
| moreLabel | string | "More" | Text at the high end of the legend scale. |
| formatTip | (value: number, week: number, day: number): string |  | Custom tooltip text. Week and day are 0-based; day 0 is Monday. |
| ariaLabel | string |  | Accessible description of the heatmap; a default summary of days and weeks is used when omitted. |

## Emits

- hover [cell: { week: number; day: number; value: number; } | null]
