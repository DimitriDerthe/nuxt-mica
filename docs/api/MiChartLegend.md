# MiChartLegend

Legend for chart series in inline, list, stat or ramp variants. Items are { label, color, value?, sub?, shape? }[].

Group: Charts. Source: app/components/Charts/MiChartLegend.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { label: string; color: string; value?: string; sub?: string; shape?: "dot" \| "line" \| "square" }[] |  | Entries as { label, color, value?, sub?, shape? }[]. |
| variant | "inline" \| "list" \| "stat" \| "ramp" | "inline" | inline: swatches in a row. list: ruled rows in columns. stat: dot, label, sub and big value. ramp: Less to More scale. |
| columns | number | 2 | Column count for the list and stat variants. |
| lessLabel | string | "Less" | Caption at the low end of the `ramp` variant. |
| moreLabel | string | "More" | Caption at the high end of the `ramp` variant. |
| ariaLabel | string |  | Accessible name of the legend. |
| active | number | -1 | Index of the highlighted item (hover). -1 for none. |

## Emits

- update:active [value: number]
