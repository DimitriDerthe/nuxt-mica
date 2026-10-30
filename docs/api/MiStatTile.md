# MiStatTile

KPI tile for dashboards: headline value, colored change with trend direction, and optional sparkline.

Group: Charts. Source: app/components/Charts/MiStatTile.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| label* | string |  | Name of the metric shown above the value. |
| value* | string |  | Formatted headline value as a string, e.g. "1,240" or "$3.2k". |
| delta | string |  | Formatted change, e.g. "12%" or "0.4 pt". |
| trend | "up" \| "down" | "up" | Direction of the change. |
| tone | "good" \| "bad" \| "neutral" | "good" | Whether the change is good (green), bad (red) or neutral. |
| comparison | string | "vs last month" | Text after the delta. |
| spark | number[] |  | Series for the sparkline; hidden when empty. |
| color | string |  | End dot color of the sparkline. |

## Slots

- default: Extra content shown below the value, such as a note or link.
