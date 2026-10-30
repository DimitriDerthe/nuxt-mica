# MiChartTable

Accessible data table of chart values. Columns are { key, label, align? }[]; rows are objects keyed by column key.

Group: Charts. Source: app/components/Charts/MiChartTable.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| columns* | { key: string; label: string; align?: "left" \| "right" }[] |  | Column definitions { key, label, align? }[]; the first column is the row header. |
| rows* | Record<string, string \| number>[] |  | Row objects keyed by column key; values are strings or numbers. |
| caption | string |  | Visually hidden caption announced by screen readers. |
| zebra | boolean | true | Shades every other row to ease reading across wide tables. |
